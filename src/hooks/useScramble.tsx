"use client";

import { useState, useEffect } from "react";

const CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~az09";

export function useScramble(text: string, duration = 2000, speed = 50) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const steps = duration / speed;
    let step = 0;

    interval = setInterval(() => {
      if (step >= steps) {
        setDisplayText(text);
        setIsScrambling(false);
        clearInterval(interval);
        return;
      }

      const progress = step / steps;
      const scrambled = text
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";
          // If we are far enough in progress, show real char
          if (index < Math.floor(progress * text.length)) {
            return char;
          }
          // Otherwise show random char
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setDisplayText(scrambled);
      step++;
    }, speed);

    return () => clearInterval(interval);
  }, [text, duration, speed]);

  return { displayText, isScrambling };
}
