'use client';

import { motion, Transition, Easing } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type SplitTextProps = {
  text?: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: Easing | Easing[];
  splitType?: 'chars' | 'words' | 'lines';
  from?: Record<string, string | number>;
  to?: Record<string, string | number>;
  threshold?: number;
  rootMargin?: string;
  onLetterAnimationComplete?: () => void;
};

const SplitText: React.FC<SplitTextProps> = ({
  text = '',
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'easeOut' as Easing,
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  onLetterAnimationComplete,
}) => {
  const elements = splitType === 'chars' ? text.split('') : text.split(' ');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current as Element);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {elements.map((char, i) => {
        const transition: Transition = {
          duration,
          delay: (i * delay) / 1000,
          ease,
        };
        return (
          <motion.span
            key={i}
            initial={from}
            animate={inView ? to : from}
            transition={transition}
            onAnimationComplete={
              i === elements.length - 1 ? onLetterAnimationComplete : undefined
            }
            style={{
              display: 'inline-block',
              willChange: 'transform, opacity',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
            {splitType === 'words' && i < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </p>
  );
};

export default SplitText;
