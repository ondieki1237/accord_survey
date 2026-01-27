"use client";
import React from 'react';

interface Props {
  value: number; // 0-5
  size?: number;
  label?: string;
  tone?: 'green' | 'blue' | 'amber' | 'red';
}

const toneColor = (tone?: string) => {
  switch (tone) {
    case 'green': return '#10B981';
    case 'blue': return '#3B82F6';
    case 'amber': return '#F59E0B';
    case 'red': return '#EF4444';
    default: return '#3B82F6';
  }
};

export default function RadialGauge({ value, size = 96, label, tone }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round((value / 5) * 100)));
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const color = toneColor(tone);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <g transform={`translate(${size/2}, ${size/2})`}>
          <circle r={r} stroke="#e6eef6" strokeWidth={stroke} fill="none" />
          <circle
            r={r}
            stroke="url(#g1)"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${dash} ${c - dash}`}
            transform={`rotate(-90)`}
          />
          <text x="0" y="4" textAnchor="middle" fontSize="18" fontWeight={700} fill="#0f172a">{value.toFixed(2)}</text>
        </g>
      </svg>
      {label && <div className="text-xs text-muted-foreground">{label}</div>}
    </div>
  );
}
