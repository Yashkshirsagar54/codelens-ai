import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  cursorClassName?: string;
  delay?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 40,
  className = '',
  cursorClassName = 'text-emerald-400',
  delay = 0,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    const delayTimer = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayedText}
      <span className={`inline-block w-2 h-4 ml-0.5 animate-pulse ${cursorClassName}`}>|</span>
    </span>
  );
};
