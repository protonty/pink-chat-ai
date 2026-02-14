import { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles } from 'lucide-react';
import { type Message } from '@/hooks/useRoom';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageInputProps {
  onSend: (content: string, replyToId?: string) => void;
  replyTo: Message | null;
  onCancelReply: () => void;
}

export default function MessageInput({ onSend, replyTo, onCancelReply }: MessageInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim(), replyTo?.id);
    setText('');
    onCancelReply();
  };

  const isAiMention = text.toLowerCase().startsWith('@ai');

  return (
    <div className="p-3 bg-card/90 backdrop-blur-xl border-t border-border/50">
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-2 px-3 py-2 rounded-xl bg-muted/60 flex items-center justify-between"
          >
            <div className="text-xs text-muted-foreground truncate flex-1">
              <span className="font-medium text-foreground">{replyTo.username}</span>
              <span className="ml-2">{replyTo.content.slice(0, 50)}</span>
            </div>
            <button onClick={onCancelReply} className="ml-2 p-0.5">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message... (type @ai to ask AI)"
            className="glass-input w-full px-4 py-2.5 pr-10 text-sm"
          />
          {isAiMention && (
            <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-pulse" />
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="ios-button !p-2.5 !rounded-xl disabled:opacity-30 disabled:scale-100 pink-glow-strong"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
