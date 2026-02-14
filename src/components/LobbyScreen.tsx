import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Plus, LogIn, Sparkles } from 'lucide-react';

interface LobbyScreenProps {
  onCreateRoom: (username: string) => Promise<string | null>;
  onJoinRoom: (code: string, username: string) => Promise<boolean>;
  loading: boolean;
}

export default function LobbyScreen({ onCreateRoom, onJoinRoom, loading }: LobbyScreenProps) {
  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle');
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreate = async () => {
    if (!username.trim()) return;
    await onCreateRoom(username.trim());
  };

  const handleJoin = async () => {
    if (!username.trim() || !roomCode.trim()) return;
    await onJoinRoom(roomCode.trim(), username.trim());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo area */}
        <div className="text-center mb-10">
          <motion.div
            className="w-20 h-20 rounded-3xl bg-primary/15 flex items-center justify-center mx-auto mb-5 pink-glow"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MessageCircle className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight">BuzzChat</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Create a room, share the code, start chatting ✨
          </p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <button onClick={() => setMode('create')} className="ios-button w-full flex items-center justify-center gap-2 pink-glow-strong">
                <Plus className="w-5 h-5" /> Create Room
              </button>
              <button onClick={() => setMode('join')} className="ios-button-secondary w-full flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" /> Join Room
              </button>
              <div className="flex items-center gap-2 justify-center pt-4 text-xs text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>AI-powered with @ai mentions</span>
              </div>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Pick a username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your display name"
                  className="glass-input w-full px-4 py-3 text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={!username.trim() || loading}
                className="ios-button w-full pink-glow-strong disabled:opacity-40"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
              <button onClick={() => setMode('idle')} className="w-full text-sm text-muted-foreground py-2">
                ← Back
              </button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Room code</label>
                <input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  className="glass-input w-full px-4 py-3 text-sm text-center font-mono font-bold tracking-[0.3em] uppercase"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Pick a username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your display name"
                  className="glass-input w-full px-4 py-3 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
              </div>
              <button
                onClick={handleJoin}
                disabled={!username.trim() || !roomCode.trim() || loading}
                className="ios-button w-full pink-glow-strong disabled:opacity-40"
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
              <button onClick={() => setMode('idle')} className="w-full text-sm text-muted-foreground py-2">
                ← Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
