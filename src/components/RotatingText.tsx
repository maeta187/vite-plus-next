'use client';

import {
  AnimatePresence,
  motion,
  TargetAndTransition,
  Transition,
} from 'motion/react';
import { useEffect, useState } from 'react';

type RotatingTextProps = {
  texts: string[];
  transition?: Transition;
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  exit?: TargetAndTransition;
  animatePresenceMode?: 'wait' | 'sync' | 'popLayout';
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: 'first' | 'last' | 'center' | 'random';
  loop?: boolean;
  auto?: boolean;
  splitBy?: 'characters' | 'words' | 'lines';
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
};

const RotatingText: React.FC<RotatingTextProps> = ({
  texts,
  transition = { type: 'spring', damping: 25, stiffness: 300 } as Transition,
  initial = { y: '100%', opacity: 0 } as TargetAndTransition,
  animate = { y: 0, opacity: 1 } as TargetAndTransition,
  exit = { y: '-120%', opacity: 0 } as TargetAndTransition,
  animatePresenceMode = 'wait',
  animatePresenceInitial = false,
  rotationInterval = 2000,
  staggerDuration = 0.025,
  staggerFrom = 'first',
  loop = true,
  auto = true,
  splitBy = 'characters',
  onNext,
  mainClassName = '',
  splitLevelClassName = '',
  elementLevelClassName = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => {
      const nextIndex = loop
        ? (prev + 1) % texts.length
        : Math.min(prev + 1, texts.length - 1);
      onNext?.(nextIndex);
      return nextIndex;
    });
  };

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(next, rotationInterval);
    return () => clearInterval(id);
  }, [auto, rotationInterval, loop]);

  const elements =
    splitBy === 'characters'
      ? texts[currentIndex].split('')
      : texts[currentIndex].split(' ');

  const getDelay = (i: number, total: number) => {
    if (staggerFrom === 'first') return i * staggerDuration;
    if (staggerFrom === 'last') return (total - 1 - i) * staggerDuration;
    if (staggerFrom === 'center')
      return Math.abs(i - Math.floor(total / 2)) * staggerDuration;
    return ((i * 7 + 3) % total) * staggerDuration;
  };

  return (
    <span className={`inline-flex overflow-hidden ${mainClassName}`}>
      <AnimatePresence
        mode={animatePresenceMode}
        initial={animatePresenceInitial}
      >
        <motion.span
          key={currentIndex}
          className={`flex ${splitLevelClassName}`}
          aria-label={texts[currentIndex]}
        >
          {elements.map((el, i) => (
            <motion.span
              key={i}
              initial={initial}
              animate={animate}
              exit={exit}
              transition={{
                ...transition,
                delay: getDelay(i, elements.length),
              }}
              className={`inline-block ${elementLevelClassName}`}
              style={{ willChange: 'transform, opacity' }}
            >
              {el === ' ' ? '\u00A0' : el}
              {splitBy === 'words' && i < elements.length - 1 && '\u00A0'}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default RotatingText;
