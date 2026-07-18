import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  duration: number;
  delay: number;
}

interface ConfettiSuccessProps {
  isActive: boolean;
  onComplete?: () => void;
  message?: string;
}

const PALETTE = [
  '#10b981', // emerald-500
  '#059669', // emerald-600
  '#34d399', // emerald-400
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
];

export default function ConfettiSuccess({ isActive, onComplete, message = "Success!" }: ConfettiSuccessProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate 80 particles with high-variety trajectory
      const newParticles = Array.from({ length: 80 }).map((_, i) => {
        const angle = (Math.random() * 120 + 30) * (Math.PI / 180); // 30deg to 150deg
        const velocity = Math.random() * 250 + 150; // speed
        
        // Target x and y coordinates simulating projectile motion
        const x = Math.cos(angle) * velocity * (Math.random() > 0.5 ? 1.5 : -1.5);
        const y = -Math.sin(angle) * velocity - (Math.random() * 150);
        
        const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
        return {
          id: i,
          x,
          y,
          rotation: Math.random() * 720 - 360,
          scale: Math.random() * 0.6 + 0.5,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          duration: Math.random() * 1.5 + 1.2,
          delay: Math.random() * 0.15,
        };
      });

      setParticles(newParticles);

      // Automatically call complete after 4.5 seconds to reset active state
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 4500);

      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <div id="confetti-success-overlay" className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center overflow-hidden">
          
          {/* Subtle Success Banner Toast at top-center of screen */}
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="absolute top-10 bg-white border-4 border-neutral-950 px-6 py-4 flex items-center gap-4 shadow-[5px_5px_0px_0px_rgba(16,185,129,1)] pointer-events-auto rounded-2xl max-w-sm mx-auto"
          >
            <div className="w-10 h-10 bg-emerald-500 border-2 border-neutral-950 flex items-center justify-center rounded-xl text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-mono font-black text-emerald-700 tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                Dossier Verified
              </p>
              <h4 className="font-display font-black text-xs text-neutral-950 uppercase tracking-tight leading-snug mt-0.5">
                {message}
              </h4>
            </div>
          </motion.div>

          {/* Confetti Spawner Container centered */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1">
            {particles.map((p) => {
              // Custom rendering per shape
              let clipPath = 'none';
              if (p.shape === 'triangle') {
                clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
              }

              return (
                <motion.div
                  key={p.id}
                  initial={{ x: 0, y: 0, rotation: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: p.x,
                    y: p.y,
                    rotate: p.rotation,
                    scale: p.scale,
                    opacity: [1, 1, 0.8, 0], // fades near the end
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: [0.1, 0.8, 0.25, 1], // snappy burst, elegant drift
                  }}
                  style={{
                    position: 'absolute',
                    width: p.shape === 'triangle' ? '12px' : '10px',
                    height: p.shape === 'triangle' ? '12px' : '10px',
                    backgroundColor: p.color,
                    borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : '0%',
                    clipPath,
                    transformOrigin: 'center',
                  }}
                />
              );
            })}
          </div>

        </div>
      )}
    </AnimatePresence>
  );
}
