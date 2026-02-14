import { motion } from 'framer-motion';
import { formatTime } from '@/lib/chatUtils';
import { type Message } from '@/hooks/useRoom';
import { Reply } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useState, useRef } from 'react';

interface ChatBubbleProps {
  message: Message;
  isMine: boolean;
  onReply: (msg: Message) => void;
}

export default function ChatBubble({ message, isMine, onReply }: ChatBubbleProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const lastTap = useRef(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onReply(message);
    }
    lastTap.current = now;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.touches[0].clientX - touchStart;
    if (diff > 0 && diff < 80) setSwipeX(diff);
  };

  const handleTouchEnd = () => {
    if (swipeX > 50) onReply(message);
    setSwipeX(0);
    setTouchStart(null);
  };

  const bubbleClass = message.is_ai ? 'bubble-ai' : isMine ? 'bubble-sent' : 'bubble-received';

  return (
    <motion.div
      initial={message.is_ai ? { opacity: 0, scale: 0.8, y: 20 } : { opacity: 0, y: 10 }}
      animate={message.is_ai ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={message.is_ai ? { type: 'spring', stiffness: 200, damping: 15 } : { duration: 0.2 }}
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2 px-4`}
      style={{ transform: `translateX(${swipeX}px)` }}
      onClick={handleDoubleTap}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`max-w-[80%] relative group`}>
        {!isMine && (
          <p className={`text-xs mb-1 font-medium ${message.is_ai ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
            {message.username}
          </p>
        )}

        {message.reply_to && (
          <div className="mb-1 px-3 py-1.5 rounded-lg bg-muted/40 border-l-2 border-primary/50 text-xs text-muted-foreground truncate">
            <span className="font-medium">{message.reply_to.username}:</span> {message.reply_to.content.slice(0, 60)}
          </div>
        )}

        <div className={`${bubbleClass} px-4 py-2.5 ${message.is_ai ? 'pink-glow' : ''}`}>
          {message.is_ai ? (
            <div className="prose prose-sm prose-invert max-w-none [&_p]:m-0 [&_p]:leading-relaxed text-sm">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{message.content}</p>
          )}
          <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
            {formatTime(message.created_at)}
          </p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onReply(message); }}
          className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted"
        >
          <Reply className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
}
