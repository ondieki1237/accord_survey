"use client";
import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="analytics-bg min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {children}
      </div>
    </div>
  );
}
