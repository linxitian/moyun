'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ReadingProgressProps {
  className?: string;
  color?: string;
}

export function ReadingProgress({ className, color = '#b83b3b' }: ReadingProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Only show after scrolling past 80px
      if (window.scrollY > 80) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={cn('fixed top-0 left-0 right-0 h-1 z-50 pointer-events-none bg-transparent', className)}
    >
      <motion.div
        className="h-full origin-left"
        style={{
          scaleX,
          backgroundColor: color,
          boxShadow: '0 0 8px rgba(184, 59, 59, 0.4)',
        }}
      />
    </div>
  );
}

export default ReadingProgress;
