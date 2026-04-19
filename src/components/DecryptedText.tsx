'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type DecryptedTextProps = {
  text: string;
  speed?: number;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'hover' | 'view';
};

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*';

const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 50,
  characters = CHARS,
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
}) => {
  const [revealedCount, setRevealedCount] = useState(text.length);
  const [scrambled, setScrambled] = useState(text);
  const iterationRef = useRef(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const startAnimation = useCallback(() => {
    iterationRef.current = 0;
    const interval = setInterval(() => {
      iterationRef.current += 0.5;
      const count = Math.floor(iterationRef.current);
      setRevealedCount(count);
      setScrambled(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < count) return char;
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join(''),
      );
      if (count >= text.length) {
        clearInterval(interval);
        setRevealedCount(text.length);
        setScrambled(text);
      }
    }, speed);
    return interval;
  }, [text, characters, speed]);

  const resetText = useCallback(() => {
    setRevealedCount(text.length);
    setScrambled(text);
  }, [text]);

  useEffect(() => {
    if (animateOn !== 'view') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          startAnimation();
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-50px' },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [animateOn, hasAnimated, startAnimation]);

  const handleMouseEnter = () => {
    if (animateOn !== 'hover') return;
    startAnimation();
  };

  const handleMouseLeave = () => {
    if (animateOn !== 'hover') return;
    resetText();
  };

  return (
    <span
      ref={containerRef}
      className={`inline-block ${parentClassName}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {scrambled.split('').map((char, i) => (
        <span
          key={i}
          className={i < revealedCount ? className : encryptedClassName}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default DecryptedText;
