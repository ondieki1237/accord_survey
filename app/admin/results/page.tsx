'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

interface ReviewCycle {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface Employee {
  _id: string;
  name: string;
  role: string;
}

interface EmployeeResults {
  employee: Employee;
  averageScore: number;
  votes: any[];
}

interface ResultsStats {
  totalVotes: number;
  averageScore: number;
  byEmployee: {
    [key: string]: EmployeeResults;
  };
}

export default function ResultsPage() {
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [results, setResults] = useState<ResultsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/review-cycles`);
        const data = await res.json();

        if (data.success) {
          setCycles(data.data);
          if (data.data.length > 0) {
            setSelectedCycle(data.data[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCycles();
  }, []);

  useEffect(() => {
    if (!selectedCycle) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/votes/cycle/${selectedCycle}`
        );
        const data = await res.json();

        if (data.success) {
          setResults(data.data.stats);
          setError(null);
        } else {
          setError('Failed to load results');
        }
      } catch (err) {
        setError('Failed to load results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedCycle]);

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-100 text-green-800';
    if (score >= 3.5) return 'bg-blue-100 text-blue-800';
    if (score >= 2.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Results</h1>
        <p className="text-muted-foreground">View review cycle feedback and analytics</p>
      </div>

      {/* Cycle Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          Select Review Cycle
        </label>
        <Select value={selectedCycle} onValueChange={setSelectedCycle}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Choose a cycle" />
          </SelectTrigger>
          <SelectContent>
            {cycles.map((cycle) => (
              <SelectItem key={cycle._id} value={cycle._id}>
                {cycle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert className="mb-6 border-red-500 bg-red-50 text-red-900">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading results...
        </div>
      ) : results ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Votes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {results.totalVotes}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {parseFloat(String(results.averageScore)).toFixed(2)}/5
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Results */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Feedback</CardTitle>
              <CardDescription>
                Individual feedback scores and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.values(results.byEmployee).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No votes submitted yet
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.values(results.byEmployee).map((emp: any) => (
                    <div
                      key={emp.employee._id}
                      className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {emp.employee.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {emp.employee.role}
                          </p>
                        </div>
                        <Badge
                          className={getScoreColor(
                            parseFloat(emp.averageScore)
                          )}
                        >
                          {parseFloat(emp.averageScore).toFixed(2)}/5 -{' '}
                          {getScoreLabel(parseFloat(emp.averageScore))}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {emp.votes.length} votes received
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Select a review cycle to view results
        </div>
      )}
    </div>
  );
}
