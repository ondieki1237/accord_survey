"use client";
import React from 'react';
import RadialGauge from './RadialGauge';
import AvatarSmall from './AvatarSmall';

export default function CompareView({
  employees,
  empIds,
  stats,
  empQAvg,
  questions
}: {
  employees: any; // mapping id -> { employee, averageScore }
  empIds: string[];
  stats: any;
  empQAvg: any;
  questions: any[];
}) {
  const selected = empIds.map((id) => employees[id]).filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selected.map((be: any) => {
          const emp = be.employee;
          const avg = parseFloat(be.averageScore) || 0;
          return (
            <div key={emp._id} className="glass-card rounded-20 p-4 shadow-md border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AvatarSmall alt={emp.name} src={emp.avatar} />
                  <div>
                    <div className="font-semibold">{emp.name}</div>
                    <div className="text-sm text-muted-foreground">{emp.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground text-right">Avg</div>
                  <RadialGauge value={avg} size={72} label={avg.toFixed(2)} tone={avg>=4.5? 'green' : avg>=4? 'blue' : avg<3? 'amber' : 'blue'} />
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">Per-question averages</div>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {questions.map((q) => {
                  const qid = String(q._id);
                  const v = (empQAvg[emp._id] || {})[qid] || 0;
                  return (
                    <div key={qid} className="flex items-center justify-between">
                      <div className="text-sm max-w-xs truncate">{q.text}</div>
                      <div className="text-sm font-medium">{v ? v.toFixed(2) : '—'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-sm text-muted-foreground">Comparison is limited to selected employees. Use the checkboxes to choose who to compare.</div>
    </div>
  );
}
