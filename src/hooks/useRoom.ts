import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateRoomCode, extractAiPrompt } from '@/lib/chatUtils';
import { toast } from 'sonner';

export interface Message {
  id: string;
  room_id: string;
  username: string;
  content: string;
  reply_to_id: string | null;
  is_ai: boolean;
  created_at: string;
  reply_to?: Message | null;
}

export interface RoomMember {
  id: string;
  room_id: string;
  username: string;
  joined_at: string;
}

export function useRoom() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const createRoom = useCallback(async (name: string) => {
    setLoading(true);
    try {
      const code = generateRoomCode();
      const { data: room, error } = await supabase
        .from('rooms')
        .insert({ code, admin_username: name })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('room_members').insert({
        room_id: room.id,
        username: name,
      });

      setRoomId(room.id);
      setRoomCode(code);
      setUsername(name);
      setIsAdmin(true);
      return code;
    } catch (e: any) {
      toast.error(e.message || 'Failed to create room');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const joinRoom = useCallback(async (code: string, name: string) => {
    setLoading(true);
    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select()
        .eq('code', code.toUpperCase())
        .single();

      if (roomError || !room) {
        toast.error('Room not found');
        return false;
      }

      // Check username uniqueness
      const { data: existing } = await supabase
        .from('room_members')
        .select()
        .eq('room_id', room.id)
        .eq('username', name)
        .single();

      if (existing) {
        toast.error('Username already taken in this room');
        return false;
      }

      await supabase.from('room_members').insert({
        room_id: room.id,
        username: name,
      });

      setRoomId(room.id);
      setRoomCode(code.toUpperCase());
      setUsername(name);
      setIsAdmin(room.admin_username === name);
      return true;
    } catch (e: any) {
      toast.error(e.message || 'Failed to join room');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, replyToId?: string) => {
    if (!roomId || !username) return;

    // Optimistic: find reply
    const replyMsg = replyToId ? messages.find(m => m.id === replyToId) || null : null;

    const { data: msg, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        username,
        content,
        reply_to_id: replyToId || null,
        is_ai: false,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to send message');
      return;
    }

    // Add message to state immediately (optimistic)
    if (msg) {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, { ...msg, reply_to: replyMsg } as Message];
      });
    }

    // Check for @ai mention
    const aiPrompt = extractAiPrompt(content);
    if (aiPrompt) {
      try {
        const response = await supabase.functions.invoke('chat-ai', {
          body: { prompt: aiPrompt, roomContext: roomCode },
        });

        if (response.error) throw response.error;

        const reply = response.data?.reply || "Couldn't process that 🤔";

        const { data: aiMsg } = await supabase.from('messages').insert({
          room_id: roomId,
          username: '🤖 AI',
          content: reply,
          reply_to_id: msg.id,
          is_ai: true,
        }).select().single();

        if (aiMsg) {
          setMessages(prev => {
            if (prev.some(m => m.id === aiMsg.id)) return prev;
            return [...prev, { ...aiMsg, reply_to: msg } as Message];
          });
        }
      } catch (e) {
        console.error('AI error:', e);
        const { data: errMsg } = await supabase.from('messages').insert({
          room_id: roomId,
          username: '🤖 AI',
          content: 'Sorry, I had trouble responding. Try again! 🔄',
          reply_to_id: msg.id,
          is_ai: true,
        }).select().single();
        if (errMsg) {
          setMessages(prev => {
            if (prev.some(m => m.id === errMsg.id)) return prev;
            return [...prev, { ...errMsg, reply_to: msg } as Message];
          });
        }
      }
    }
  }, [roomId, username, roomCode, messages]);

  const leaveRoom = useCallback(async () => {
    if (!roomId || !username) return;

    if (isAdmin) {
      // Delete the entire room (cascades)
      await supabase.from('rooms').delete().eq('id', roomId);
    } else {
      await supabase.from('room_members').delete()
        .eq('room_id', roomId)
        .eq('username', username);
    }

    setRoomId(null);
    setRoomCode(null);
    setUsername(null);
    setIsAdmin(false);
    setMessages([]);
    setMembers([]);
  }, [roomId, username, isAdmin]);

  // Load messages and members
  useEffect(() => {
    if (!roomId) return;

    const loadData = async () => {
      const [msgRes, memRes] = await Promise.all([
        supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true }),
        supabase.from('room_members').select('*').eq('room_id', roomId),
      ]);

      if (msgRes.data) {
        // Load reply references
        const msgsWithReplies = await Promise.all(
          msgRes.data.map(async (msg) => {
            if (msg.reply_to_id) {
              const replyMsg = msgRes.data.find(m => m.id === msg.reply_to_id);
              return { ...msg, reply_to: replyMsg || null };
            }
            return { ...msg, reply_to: null };
          })
        );
        setMessages(msgsWithReplies as Message[]);
      }
      if (memRes.data) setMembers(memRes.data as RoomMember[]);
    };

    loadData();

    // Subscribe to realtime
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          // Try to attach reply
          const replyTo = newMsg.reply_to_id ? prev.find(m => m.id === newMsg.reply_to_id) || null : null;
          return [...prev, { ...newMsg, reply_to: replyTo }];
        });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'room_members',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMembers(prev => {
            const newMember = payload.new as RoomMember;
            if (prev.some(m => m.id === newMember.id)) return prev;
            return [...prev, newMember];
          });
        } else if (payload.eventType === 'DELETE') {
          setMembers(prev => prev.filter(m => m.id !== (payload.old as any).id));
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'rooms',
      }, (payload) => {
        if ((payload.old as any).id === roomId) {
          toast.info('Room has been closed by the admin');
          setRoomId(null);
          setRoomCode(null);
          setUsername(null);
          setIsAdmin(false);
          setMessages([]);
          setMembers([]);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [roomId]);

  return {
    roomId, roomCode, username, isAdmin, messages, members, loading,
    createRoom, joinRoom, sendMessage, leaveRoom,
  };
}
