"use client";
import React from 'react';
import RadialGauge from './RadialGauge';

export default function KPIOverview({ best, worst }: { best: { label:string, value:number }, worst: { label:string, value:number } }) {
  return (
    <div className="glass-card rounded-20 p-4 shadow-lg border-border flex items-center gap-6">
      <div className="flex-1">
        <div className="text-sm text-muted-foreground">Key Performance Overview</div>
        <div className="mt-2 text-2xl font-bold">Across questions and participants</div>
      </div>
      <div className="flex gap-6 items-center">
        <div className="flex flex-col items-center">
          <RadialGauge value={best.value} label={best.label} tone={best.value>=4.5? 'green' : best.value>=4.0? 'blue' : 'amber'} />
          <div className="text-sm text-muted-foreground mt-2">Highest scoring metric</div>
        </div>
        <div className="flex flex-col items-center">
          <RadialGauge value={worst.value} label={worst.label} tone={worst.value<3? 'amber' : 'blue'} />
          <div className="text-sm text-muted-foreground mt-2">Lowest scoring metric</div>
        </div>
      </div>
    </div>
  );
}
