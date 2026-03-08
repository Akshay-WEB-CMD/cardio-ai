import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

interface HeartPulseProps {
  bpm?: number;
}

export const HeartPulse = ({ bpm = 72 }: HeartPulseProps) => {
  const duration = 60 / bpm;
  return (
    <div className="relative">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10"
      >
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
      </motion.div>
    </div>
  );
};
