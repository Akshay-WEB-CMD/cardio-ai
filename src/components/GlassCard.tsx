import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'blue' | 'teal' | 'pink' | 'none';
  hover?: boolean;
}

export const GlassCard = ({ children, className, glow = 'none', hover = true }: GlassCardProps) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, translateY: -2 } : {}}
      className={cn(
        "glass rounded-3xl p-6 relative overflow-hidden",
        glow === 'blue' && "glow-blue border-medical-blue/20",
        glow === 'teal' && "glow-teal border-medical-teal/20",
        glow === 'pink' && "glow-pink border-pink-500/20",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
