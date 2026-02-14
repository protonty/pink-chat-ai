import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Users, Copy, Check, Crown } from 'lucide-react';
import { type Message, type RoomMember } from '@/hooks/useRoom';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';
import AiThinkingIndicator from './AiThinkingIndicator';
import { toast } from 'sonner';

interface ChatRoomProps {
  roomCode: string;
  username: string;
  isAdmin: boolean;
  messages: Message[];
  members: RoomMember[];
  aiThinking: boolean;
  onSend: (content: string, replyToId?: string) => void;
  onLeave: () => void;
}

export default function ChatRoom({ roomCode, username, isAdmin, messages, members, aiThinking, onSend, onLeave }: ChatRoomProps) {
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [copied, setCopied] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, aiThinking]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success('Room code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="px-4 py-3 bg-card/90 backdrop-blur-xl border-b border-border/50 flex items-center justify-between safe-area-top">
        <div className="flex items-center gap-3">
          <button
            onClick={onLeave}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm">Room</h2>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold"
              >
                {roomCode}
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {members.length} member{members.length !== 1 ? 's' : ''} • {isAdmin && '👑 Admin'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowMembers(!showMembers)}
          className="p-2 rounded-xl hover:bg-muted transition-colors relative"
        >
          <Users className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Members dropdown */}
      {showMembers && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-card/95 backdrop-blur-xl border-b border-border/50 px-4 py-3"
        >
          <p className="text-xs font-medium text-muted-foreground mb-2">Members</p>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <span key={m.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium">
                {m.username === username ? '🫵 You' : m.username}
                {m.username === members.find(mem => true)?.username && (
                  <Crown className="w-3 h-3 text-primary" />
                )}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 pink-glow">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-muted-foreground text-sm">
              No messages yet. Say hi! 👋
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Try @ai followed by a question to chat with AI
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isMine={msg.username === username}
            onReply={setReplyTo}
          />
        ))}
        <AnimatePresence>
          {aiThinking && <AiThinkingIndicator />}
        </AnimatePresence>
      </div>

      {/* Input */}
      <MessageInput
        onSend={onSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}
