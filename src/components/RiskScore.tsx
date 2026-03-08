import React from 'react';
import { motion } from 'motion/react';

interface RiskScoreProps {
  score: number;
}

export const RiskScore = ({ score }: RiskScoreProps) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-40 h-40 transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-white/5"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: "easeOut" }}
          className={score > 70 ? "text-red-500" : score > 30 ? "text-yellow-500" : "text-medical-teal"}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tighter">{score}%</span>
        <span className="text-[10px] uppercase tracking-widest opacity-50 font-medium">Risk Level</span>
      </div>
    </div>
  );
};
