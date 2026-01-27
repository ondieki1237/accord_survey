import React from "react"
import type { Metadata } from 'next';
import AdminNav from './components/AdminNav';
import AdminGuard from './components/AdminGuard';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Accord Survey',
  description: 'Manage review cycles and employees',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <AdminGuard>
        <AdminNav />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </AdminGuard>
    </div>
  );
}
