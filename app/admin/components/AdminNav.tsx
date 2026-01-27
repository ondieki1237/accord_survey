'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="w-64 border-r border-border bg-card text-card-foreground flex flex-col h-screen">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border flex flex-col items-center">
        <img
          src="/accord_transparent_logo.png"
          alt="Accord Medical Logo"
          className="h-16 w-auto mb-2 object-contain"
        />
        <p className="text-sm text-muted-foreground font-medium">Survey Admin</p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-2">
        <Link
          href="/admin"
          className={cn(
            'block px-4 py-2 rounded-md transition-colors',
            isActive('/admin')
              ? 'bg-primary text-primary-foreground font-semibold'
              : 'text-foreground hover:bg-muted'
          )}
        >
          Dashboard
        </Link>

        <Link
          href="/admin/review-cycles"
          className={cn(
            'block px-4 py-2 rounded-md transition-colors',
            isActive('/admin/review-cycles')
              ? 'bg-primary text-primary-foreground font-semibold'
              : 'text-foreground hover:bg-muted'
          )}
        >
          Review Cycles
        </Link>

        <Link
          href="/admin/employees"
          className={cn(
            'block px-4 py-2 rounded-md transition-colors',
            isActive('/admin/employees')
              ? 'bg-primary text-primary-foreground font-semibold'
              : 'text-foreground hover:bg-muted'
          )}
        >
          Employees
        </Link>

        <Link
          href="/admin/results"
          className={cn(
            'block px-4 py-2 rounded-md transition-colors',
            isActive('/admin/results')
              ? 'bg-primary text-primary-foreground font-semibold'
              : 'text-foreground hover:bg-muted'
          )}
        >
          Results
        </Link>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border mt-auto">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accord_token');
              document.cookie = 'accord_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              window.location.href = '/login';
            }
          }}
          className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          Logout
        </button>
        <div className="mt-4 text-xs text-muted-foreground text-center">v1.0.0</div>
      </div>
    </nav>
  );
}
