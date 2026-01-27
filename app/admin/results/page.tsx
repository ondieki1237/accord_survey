// app/admin/results/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import apiFetch from '@/lib/api';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResultsSidebar } from './components/ResultsSidebar';
import { EmployeeReport } from './components/EmployeeReport';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReviewCycle {
  _id: string;
  name: string;
}

export default function ResultsPage() {
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Initial fetch of cycles
  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await apiFetch('/review-cycles');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setCycles(data.data);
          setSelectedCycle(data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCycles();
  }, []);

  // Fetch results when cycle changes
  useEffect(() => {
    if (!selectedCycle) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/votes/cycle/${selectedCycle}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
          // Auto-select first employee if none selected or not in list
          const firstEmpId = Object.keys(data.data.stats.byEmployee)[0];
          if (firstEmpId) setSelectedEmployeeId(firstEmpId);
        } else {
          setError('Failed to load results');
        }
      } catch (err) {
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [selectedCycle]);

  // Pre-calculate per-question averages for the whole org (for radar chart comparison)
  const orgAverages = useMemo(() => {
    if (!results || !results.votes) return {};

    // Structure: { [empId]: { [questionId]: averageScore } }
    const avgs: Record<string, Record<string, number>> = {};

    results.votes.forEach((v: any) => {
      const empId = v.targetEmployeeId && (v.targetEmployeeId._id || v.targetEmployeeId);
      if (!empId) return;
      if (!avgs[empId]) avgs[empId] = {};

      v.answers.forEach((a: any) => {
        if (typeof a.answer === 'number') {
          const qid = String(a.questionId);
          if (!avgs[empId][qid]) avgs[empId][qid] = 0; // Temporary sum
          // We need a more robust way to Avg. For now, simple sum and average later
        }
      });
    });

    // Re-calc properly
    const empQData: Record<string, Record<string, { sum: number, count: number }>> = {};
    results.votes.forEach((v: any) => {
      const empId = v.targetEmployeeId && (v.targetEmployeeId._id || v.targetEmployeeId);
      if (!empId) return;
      if (!empQData[empId]) empQData[empId] = {};

      v.answers.forEach((a: any) => {
        if (typeof a.answer === 'number') {
          const qid = String(a.questionId);
          if (!empQData[empId][qid]) empQData[empId][qid] = { sum: 0, count: 0 };
          empQData[empId][qid].sum += a.answer;
          empQData[empId][qid].count++;
        }
      });
    });

    const finalAvgs: Record<string, Record<string, number>> = {};
    Object.keys(empQData).forEach(empId => {
      finalAvgs[empId] = {};
      Object.keys(empQData[empId]).forEach(qid => {
        finalAvgs[empId][qid] = empQData[empId][qid].sum / empQData[empId][qid].count;
      });
    });

    return finalAvgs;
  }, [results]);

  const employees = results?.stats?.byEmployee
    ? Object.values(results.stats.byEmployee).map((r: any) => r.employee)
    : [];

  const selectedEmployeeData = useMemo(() => {
    if (!results || !selectedEmployeeId) return null;
    return results.stats.byEmployee[selectedEmployeeId]?.employee;
  }, [results, selectedEmployeeId]);

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar */}
        {results && (
          <ResultsSidebar
            employees={employees}
            selectedId={selectedEmployeeId}
            onSelect={setSelectedEmployeeId}
            stats={results.stats}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
          <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold">Feedback Results</h1>
              <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select Cycle" />
                </SelectTrigger>
                <SelectContent>
                  {cycles.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-20 text-muted-foreground">Loading analytics engine...</div>
            ) : error ? (
              <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
            ) : selectedEmployeeData ? (
              <EmployeeReport
                employee={selectedEmployeeData}
                votes={results.votes}
                questions={results.questions}
                allStats={results.stats}
                orgAverages={orgAverages}
              />
            ) : (
              <div className="text-center py-20 text-muted-foreground">Select a review cycle and employee to view results.</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
