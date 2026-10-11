'use client';
import React, { useRef, useEffect, CSSProperties } from 'react';

interface MagnetLinesProps {
  rows?: number;
  columns?: number;
  containerSize?: string;
  lineColor?: string;
  lineWidth?: string;
  lineHeight?: string;
  baseAngle?: number;
  className?: string;
  style?: CSSProperties;
}

const MagnetLines: React.FC<MagnetLinesProps> = ({
  rows = 9,
  columns = 9,
  containerSize = '80vmin',
  lineColor = '#efefef',
  lineWidth = '1vmin',
  lineHeight = '6vmin',
  baseAngle = -10,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = container.querySelectorAll<HTMLSpanElement>('span');

    const onPointerMove = (pointer: { x: number; y: number }) => {
      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const cx = rect.x + rect.width / 2;
        const cy = rect.y + rect.height / 2;
        const b = pointer.x - cx;
        const a = pointer.y - cy;
        const c = Math.sqrt(a * a + b * b) || 1;
        const r = ((Math.acos(b / c) * 180) / Math.PI) * (pointer.y > cy ? 1 : -1);
        item.style.setProperty('--rotate', `${r}deg`);
      });
    };

    const handle = (e: PointerEvent) => onPointerMove({ x: e.x, y: e.y });
    window.addEventListener('pointermove', handle);

    if (items.length) {
      const mid = items[Math.floor(items.length / 2)];
      const rect = mid.getBoundingClientRect();
      onPointerMove({ x: rect.x, y: rect.y });
    }

    return () => window.removeEventListener('pointermove', handle);
  }, [rows, columns]);

  const spans = Array.from({ length: rows * columns }, (_, i) => {
    const spanStyle: React.CSSProperties & Record<string, string> = {
      display: 'block',
      width: lineWidth,
      height: lineHeight,
      backgroundColor: lineColor,
      transformOrigin: 'center',
      transform: 'rotate(var(--rotate))',
      willChange: 'transform',
      transition: 'transform 0.08s ease-out',
    };
    spanStyle['--rotate'] = `${baseAngle}deg`;

    return <span key={i} style={spanStyle} />;
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'grid',
        placeItems: 'center',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: containerSize,
        height: containerSize,
        ...style,
      }}
    >
      {spans}
    </div>
  );
};

export default MagnetLines;
