"use client";
import React from 'react';

interface Props {
  values: number[];
  color?: string;
  height?: number;
}

export default function Sparkline({ values, color = '#3B82F6', height = 40 }: Props) {
  const w = Math.max(64, values.length * 8);
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => `${(i / (values.length - 1 || 1)) * w},${height - (v / max) * height}`).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="rounded">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
