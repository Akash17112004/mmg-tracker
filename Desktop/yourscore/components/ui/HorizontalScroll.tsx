'use client';
import { ReactNode } from 'react';

export default function HorizontalScroll({ children }: { children: ReactNode }) {
  return (
    <div
      className="results-rail"
      style={{
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        gap: '18px',
        paddingBottom: '12px',
      }}
    >
      <div className="results-track" style={{ display: 'flex', gap: '18px', width: 'max-content' }}>
        {children}
      </div>
    </div>
  );
}
