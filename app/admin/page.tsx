'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

interface DashboardStats {
  cyclesCount: number;
  employeesCount: number;
  activeCycles: number;
  totalVotes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    cyclesCount: 0,
    employeesCount: 0,
    activeCycles: 0,
    totalVotes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [cyclesRes, employeesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/review-cycles`),
          fetch(`${API_BASE_URL}/employees`),
        ]);

        const cyclesData = await cyclesRes.json();
        const employeesData = await employeesRes.json();

        if (cyclesData.success && employeesData.success) {
          const activeCycles = cyclesData.data.filter(
            (c: any) => new Date(c.endDate) > new Date()
          ).length;

          setStats({
            cyclesCount: cyclesData.data.length,
            employeesCount: employeesData.data.length,
            activeCycles,
            totalVotes: 0, // Will be calculated from votes
          });
        }
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to Accord Survey Admin</p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-500 bg-red-50 text-red-900">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Review Cycles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.cyclesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeCycles} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.employeesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.totalVotes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Submitted this cycle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-green-600">Active</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Info */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Set up your first review cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside text-sm text-foreground">
            <li>Create employees in the <strong>Employees</strong> section</li>
            <li>Create a new review cycle in <strong>Review Cycles</strong></li>
            <li>Add employees to the cycle and set the time span</li>
            <li>Share the voting link with your team</li>
            <li>Monitor results in the <strong>Results</strong> section</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
