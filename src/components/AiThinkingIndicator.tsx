import { motion } from 'framer-motion';
import { useMemo } from 'react';

const PARTICLE_COUNT = 12;

export default function AiThinkingIndicator() {
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      angle: (360 / PARTICLE_COUNT) * i,
      delay: (i / PARTICLE_COUNT) * 1.6,
      size: 3 + Math.random() * 3,
      orbitRadius: 18 + (i % 3) * 6,
      opacity: 0.4 + Math.random() * 0.6,
    })),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex justify-start mb-2 px-4"
    >
      <div className="flex flex-col items-start">
        <p className="text-xs mb-1 font-medium text-accent-foreground">🤖 AI</p>
        <div className="bubble-ai px-5 py-4 pink-glow flex items-center gap-3">
          {/* Particle orbit */}
          <div className="relative w-12 h-12 flex-shrink-0">
            {/* Center glow */}
            <motion.div
              className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-primary"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                boxShadow: '0 0 12px hsl(340 82% 55% / 0.6), 0 0 24px hsl(340 82% 55% / 0.3)',
              }}
            />

            {/* Orbiting particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  top: '50%',
                  left: '50%',
                  marginTop: -p.size / 2,
                  marginLeft: -p.size / 2,
                  background: `radial-gradient(circle, hsl(340 82% 70%), hsl(320 60% 55%))`,
                  boxShadow: `0 0 ${p.size * 2}px hsl(340 82% 55% / 0.5)`,
                }}
                animate={{
                  x: [
                    Math.cos((p.angle * Math.PI) / 180) * p.orbitRadius,
                    Math.cos(((p.angle + 120) * Math.PI) / 180) * p.orbitRadius,
                    Math.cos(((p.angle + 240) * Math.PI) / 180) * p.orbitRadius,
                    Math.cos(((p.angle + 360) * Math.PI) / 180) * p.orbitRadius,
                  ],
                  y: [
                    Math.sin((p.angle * Math.PI) / 180) * p.orbitRadius,
                    Math.sin(((p.angle + 120) * Math.PI) / 180) * p.orbitRadius,
                    Math.sin(((p.angle + 240) * Math.PI) / 180) * p.orbitRadius,
                    Math.sin(((p.angle + 360) * Math.PI) / 180) * p.orbitRadius,
                  ],
                  scale: [1, 1.5, 0.8, 1],
                  opacity: [p.opacity, 1, 0.3, p.opacity],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: p.delay,
                }}
              />
            ))}

            {/* Outer ring trail */}
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-1 rounded-full border border-primary/10"
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-foreground/80 font-medium">Thinking</span>
            <motion.div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary/60"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
