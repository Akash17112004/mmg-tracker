'use client';

import type { ReactNode } from 'react';
import AnimatedTitle from './AnimatedTitle';

export default function AnimatedPageTitle({ lines, fallback }: { lines: string[][]; fallback: ReactNode }) {
  return (
    <>
      <h1 className="sr-only">{fallback}</h1>
      <AnimatedTitle
        lines={lines}
        delay={0.12}
        style={{ margin: '22px 0' }}
        lineStyle={(lineIndex) => ({
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(52px, 7vw, 104px)',
          fontWeight: 900,
          letterSpacing: '-0.07em',
          lineHeight: 0.92,
          color: lineIndex === lines.length - 1 ? '#8B0000' : '#0a0a0a',
          fontStyle: lineIndex === lines.length - 1 ? 'italic' : 'normal',
        })}
      />
    </>
  );
}
