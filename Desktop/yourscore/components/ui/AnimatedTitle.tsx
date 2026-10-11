'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import CustomEase from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

if (typeof window !== 'undefined') {
  CustomEase.create('custom-ease-in', '0.52, 0.00, 0.48, 1.00');
}

interface AnimatedTitleProps {
  lines: string[][]; // each line is an array of words/chunks
  style?: React.CSSProperties;
  lineStyle?: (lineIndex: number) => React.CSSProperties;
  delay?: number;
}

export default function AnimatedTitle({ lines, style, lineStyle, delay = 0 }: AnimatedTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chunks = container.querySelectorAll<HTMLElement>('.title-chunk');
    const tl = gsap.timeline({ delay });

    chunks.forEach((chunk, i) => {
      const dir = chunk.dataset.dir; // 'x' or 'y'
      const from = chunk.dataset.from; // starting offset value

      tl.fromTo(
        chunk,
        dir === 'x' ? { x: from } : { y: from },
        {
          x: dir === 'x' ? '0rem' : undefined,
          y: dir === 'y' ? '0rem' : undefined,
          duration: 1.5,
          ease: 'custom-ease-in',
        },
        i * 0.05 // slight stagger between chunks
      );
    });

    return () => { tl.kill(); };
  }, [delay]);

  return (
    <div ref={containerRef} style={{ overflow: 'hidden', ...style }}>
      {lines.map((words, li) => (
        <div key={li} style={{ display: 'flex', overflow: 'hidden', ...(lineStyle ? lineStyle(li) : {}) }}>
          {words.map((word, wi) => {
            // alternate direction left/right for visual variety, like the reference site
            const dir = wi % 2 === 0 ? 'x' : 'x';
            const from = wi % 2 === 0 ? '3rem' : '-3rem';
            return (
              <div key={wi} style={{ overflow: 'hidden', display: 'flex', marginRight: '0.4em' }}>
                <span
                  className="title-chunk"
                  data-dir={dir}
                  data-from={from}
                  style={{ display: 'inline-block', transform: `translateX(${from})` }}
                >
                  {word}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
