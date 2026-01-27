"use client";
import React from 'react';
import Sparkline from './Sparkline';
import AvatarSmall from './AvatarSmall';

interface Props {
  title: string;
  average: number;
  question?: string;
  topResponder?: { name: string; avatar?: string } | null;
  size?: 'sm' | 'md' | 'lg';
  spark?: number[];
}

const scoreTone = (avg: number) => {
  if (avg >= 4.5) return 'green';
  if (avg >= 4.0) return 'blue';
  if (avg < 3.0) return 'amber';
  return 'blue';
};

export default function MetricCard({ title, average, question, topResponder, size = 'md', spark = [] }: Props) {
  const tone = scoreTone(average);
  const sizeClass = size === 'lg' ? 'col-span-2 row-span-1' : size === 'sm' ? 'col-span-1' : 'col-span-1';

  return (
    <div className={`glass-card rounded-20 p-4 shadow-md border-border ${sizeClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-1 flex items-center gap-3">
            <div className="text-2xl font-bold text-foreground">{average ? average.toFixed(2) : '—'}/5</div>
            <div className="text-xs px-2 py-1 rounded-md text-foreground/70 bg-white/10">{question || ''}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="w-20">
            <Sparkline values={spark.length ? spark : [1,2,3,4,5].map(i=>Math.max(0, Math.min(5, average + (Math.random()-0.5))))} color={tone==='green'? '#10B981' : tone==='amber'? '#F59E0B' : '#3B82F6'} />
          </div>
          {topResponder && (
            <div className="flex items-center gap-2">
              <AvatarSmall src={topResponder.avatar} alt={topResponder.name} />
              <div className="text-sm">{topResponder.name}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
