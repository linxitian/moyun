'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface InkBackgroundProps {
  className?: string;
}

export function InkBackground({ className }: InkBackgroundProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none select-none',
        className
      )}
      aria-hidden="true"
    >
      {/* Floating ink cloud 1 - Deep Ink Top Right */}
      <motion.div
        animate={{
          x: [0, 20, -15, 0],
          y: [0, -15, 10, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-8"
        style={{
          background: 'radial-gradient(circle, rgba(26,28,35,0.08) 0%, rgba(45,58,75,0.04) 50%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Floating ink cloud 2 - Cinnabar warmth accent Center Left */}
      <motion.div
        animate={{
          x: [0, -20, 25, 0],
          y: [0, 25, -20, 0],
          scale: [0.9, 1.1, 0.95, 0.9],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 -left-24 w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(184,59,59,0.05) 0%, rgba(154,104,80,0.03) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Floating ink cloud 3 - Bamboo mist Bottom Right */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -25, 15, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-10 right-1/4 w-[32rem] h-[32rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(74,107,93,0.06) 0%, rgba(45,58,75,0.03) 50%, transparent 70%)',
          filter: 'blur(55px)',
        }}
      />

      {/* Gentle center vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, color-mix(in srgb, var(--background) 50%, transparent) 80%, var(--background) 100%)',
        }}
      />
    </div>
  );
}

export default InkBackground;
