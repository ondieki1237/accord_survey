'use client';

import { useEffect, useState, useRef } from 'react';
import apiFetch from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MetricCard from '@/components/dashboard/MetricCard';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CompareView from '@/components/dashboard/CompareView';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://survey.codewithseth.co.ke/api'
    : 'http://localhost:5090/api');

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

interface FullResultsPayload {
  votes: any[];
  stats: ResultsStats;
  questions: any[];
}

// Simple chart component that uses Chart.js if installed. Falls back to a tiny SVG bar if Chart.js isn't available.
function QuestionChart({ counts }: { counts: { [key: string]: number } }) {
  const data = [1,2,3,4,5].map((i) => ({ name: String(i), value: counts[String(i)] || 0 }));
  return (
    <div style={{ width: '100%', height: 120 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#0ea5a4" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ResultsPage() {
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [results, setResults] = useState<FullResultsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [detailModal, setDetailModal] = useState<null | { empId: string; empName: string }>(null);
  const [questionStats, setQuestionStats] = useState<any>({});
  const [employeeQuestionAverages, setEmployeeQuestionAverages] = useState<any>({});
  const [questionRankings, setQuestionRankings] = useState<any>({});
  const [fullModalOpen, setFullModalOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareSelected, setCompareSelected] = useState<string[]>([]);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await apiFetch('/review-cycles');
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
        const res = await apiFetch(`/votes/cycle/${selectedCycle}`);
        const data = await res.json();

        if (data.success) {
          // data.data contains { votes, stats, questions }
          setResults(data.data);
          setError(null);
          // populate employees list from stats.byEmployee
          if (data.data.stats && data.data.stats.byEmployee) {
            const emps = Object.values(data.data.stats.byEmployee).map((b: any) => b.employee);
            setEmployeesList(emps);
            // default select all
            setSelectedEmployees(emps.map((e: any) => e._id));
            // compute per-question stats and rankings
            try {
              const votes = data.data.votes || [];
              const questions = data.data.questions || [];
              const byQuestion: any = {};
              const empQAvg: any = {};

              // init
              questions.forEach((q: any) => {
                byQuestion[q._id] = { counts: { 1:0,2:0,3:0,4:0,5:0 }, total: 0, average: 0 };
              });

              // accumulate per employee per question
              votes.forEach((v: any) => {
                const empId = String(v.targetEmployeeId._id || v.targetEmployeeId);
                if (!empQAvg[empId]) empQAvg[empId] = {};
                v.answers.forEach((a: any) => {
                  const qid = String(a.questionId);
                  const val = typeof a.answer === 'number' ? a.answer : parseFloat(a.answer) || 0;
                  if (byQuestion[qid]) {
                    if (val >=1 && val <=5) {
                      byQuestion[qid].counts[val] = (byQuestion[qid].counts[val]||0) + 1;
                      byQuestion[qid].total += 1;
                      byQuestion[qid].average = ((byQuestion[qid].average * (byQuestion[qid].total -1)) + val) / byQuestion[qid].total;
                    }
                  }
                  if (!empQAvg[empId][qid]) empQAvg[empId][qid] = { total:0, count:0 };
                  if (!isNaN(val) && val>0) {
                    empQAvg[empId][qid].total += val;
                    empQAvg[empId][qid].count += 1;
                  }
                });
              });

              // finalize employee averages per question
              const empQAvgFinal: any = {};
              Object.keys(empQAvg).forEach((empId) => {
                empQAvgFinal[empId] = {};
                Object.keys(empQAvg[empId]).forEach((qid) => {
                  const rec = empQAvg[empId][qid];
                  empQAvgFinal[empId][qid] = rec.count > 0 ? rec.total / rec.count : 0;
                });
              });

              // rankings per question
              const qRankings: any = {};
              questions.forEach((q: any) => {
                const qid = String(q._id);
                const arr: Array<{empId:string, avg:number}> = [];
                Object.keys(empQAvgFinal).forEach((empId) => {
                  const avg = empQAvgFinal[empId][qid] || 0;
                  arr.push({ empId, avg });
                });
                arr.sort((a,b) => b.avg - a.avg);
                qRankings[qid] = arr.map((item, idx) => ({ empId: item.empId, avg: item.avg, rank: idx+1 }));
              });

              setQuestionStats(byQuestion);
              setEmployeeQuestionAverages(empQAvgFinal);
              setQuestionRankings(qRankings);
            } catch (err) {
              console.error('Error computing question stats', err);
            }
          }
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

  const ordinal = (n: number) => {
    const s = ['th','st','nd','rd'];
    const v = n % 100;
    return (s[(v-20)%10] || s[v] || s[0]);
  };

  // Questions that are qualitative/open-text and should not show charts
  const qualitativeQuestionKeywords = [
    "what are this employee's key strengths",
    'what are this employees key strengths',
    'what are this employee’s key strengths',
    'what is one area he/she can improve',
    'what should this employee start, stop, or continue',
    'how does this employee impact team collaboration',
    'is there any support or training you recommend'
  ];

  const isQualitativeQuestion = (text?: string) => {
    if (!text) return false;
    const t = text.toLowerCase().replace(/["'’—–-]/g, '').trim();
    return qualitativeQuestionKeywords.some((k) => t.includes(k));
  };

  return (
    <DashboardLayout>
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
          {/* Key Performance Overview (new premium layout) */}
          <div className="mb-6">
            {/* Compute best and worst question summaries inline */}
            {/* best = highest average, worst = lowest average */}
            {(() => {
              const qs = results.questions || [];
              const stats = questionStats || {};
              let best = { label: '—', value: 0 };
              let worst = { label: '—', value: 5 };
              qs.forEach((q: any) => {
                const s = stats[String(q._id)];
                const avg = s ? s.average || 0 : 0;
                if (avg > best.value) best = { label: q.text, value: avg };
                if (avg < worst.value) worst = { label: q.text, value: avg };
              });
              return (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                  <div className="lg:col-span-4">
                    <div className="glass-card rounded-20 p-4 shadow-lg border-border flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Key Performance Overview</div>
                        <div className="mt-1 text-2xl font-bold text-foreground">Overall insights</div>
                        <div className="text-sm text-muted-foreground">Total votes: {results.stats.totalVotes} • Average: {parseFloat(String(results.stats.averageScore)).toFixed(2)}/5</div>
                      </div>
                      <div className="flex gap-6 items-center">
                        <div className="flex flex-col items-center">
                          <div className="text-xs text-muted-foreground">Highest</div>
                          <div className="mt-2"><svg width="88" height="88" viewBox="0 0 88 88"><circle cx="44" cy="44" r="40" stroke="#e6eef6" strokeWidth="8" fill="none"/><text x="44" y="50" textAnchor="middle" fontSize="14" fontWeight={700} fill="#0f172a">{best.value? best.value.toFixed(2): '—'}</text></svg></div>
                          <div className="text-sm mt-2 max-w-xs text-foreground/80">{best.label}</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-xs text-muted-foreground">Lowest</div>
                          <div className="mt-2"><svg width="88" height="88" viewBox="0 0 88 88"><circle cx="44" cy="44" r="40" stroke="#e6eef6" strokeWidth="8" fill="none"/><text x="44" y="50" textAnchor="middle" fontSize="14" fontWeight={700} fill="#0f172a">{worst.value? worst.value.toFixed(2): '—'}</text></svg></div>
                          <div className="text-sm mt-2 max-w-xs text-foreground/80">{worst.label}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Employee selector filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Select Employees</label>
            <div className="flex flex-wrap gap-2">
              {employeesList.map((emp) => (
                <label key={emp._id} className="inline-flex items-center gap-2 px-3 py-1 border rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(emp._id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedEmployees((prev) => {
                        const s = new Set(prev);
                        if (checked) s.add(emp._id);
                        else s.delete(emp._id);
                        return Array.from(s);
                      });
                    }}
                  />
                  <span className="text-sm">{emp.name}</span>
                </label>
              ))}
              <div className="ml-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    // toggle compare selection to match current selectedEmployees by default
                    setCompareSelected(selectedEmployees.slice(0, 3));
                    setCompareOpen(true);
                  }}
                  disabled={selectedEmployees.length < 2}
                  className={`text-sm px-3 py-1 rounded ${selectedEmployees.length < 2 ? 'opacity-50 cursor-not-allowed' : 'bg-primary text-primary-foreground'}`}
                >
                  Compare Selected
                </button>
              </div>
            </div>
          </div>

          {/* Employee Results */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Feedback</CardTitle>
              <CardDescription>
                Individual feedback scores and details
              </CardDescription>
              <div className="ml-auto">
                <button
                  onClick={() => setFullModalOpen(true)}
                  className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded"
                >
                  View Full Survey
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Per-question infographics (premium cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {results.questions.map((q: any, idx: number) => {
                  const qid = String(q._id);
                  const qs = questionStats[qid] || { counts: {}, total: 0, average: 0 };
                  const ranking = (questionRankings[qid] || []).slice(0,3);
                  const avg = qs.average || 0;
                  const top = ranking.length > 0 ? results.stats.byEmployee[ranking[0].empId]?.employee : null;
                  // choose card size: first item large, every 5th medium, others small
                  const size = idx === 0 ? 'lg' : (idx % 5 === 0 ? 'md' : 'sm');
                  const qual = isQualitativeQuestion(q.text);
                  if (qual) {
                    return (
                      <div key={qid} className="glass-card rounded-20 p-4 shadow-md border-border">
                        <div className="font-medium text-foreground mb-2">{q.text}</div>
                        <div className="text-sm text-muted-foreground">Open text responses only — no chart for this question.</div>
                      </div>
                    );
                  }

                  return (
                    <div key={qid} className={""}>
                      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                      {/* @ts-ignore */}
                      <MetricCard title={q.text} average={avg} question={q.shortText || ''} topResponder={top ? { name: top.name } : null} size={size as any} spark={[Math.max(1,avg-0.5), avg-0.2, avg, avg+0.1, Math.max(1,avg+0.2)]} />
                    </div>
                  );
                })}
              </div>
              {Object.values(results.stats.byEmployee).filter((be: any) => selectedEmployees.length === 0 || selectedEmployees.includes(be.employee._id)).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No votes submitted yet
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.values(results.stats.byEmployee)
                    .filter((be: any) => selectedEmployees.length === 0 || selectedEmployees.includes(be.employee._id))
                    .map((emp: any) => (
                      <div
                        key={emp.employee._id}
                        className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{emp.employee.name}</h3>
                            <p className="text-sm text-muted-foreground">{emp.employee.role}</p>
                          </div>
                          <Badge
                            onClick={() => setDetailModal({ empId: emp.employee._id, empName: emp.employee.name })}
                            className={getScoreColor(parseFloat(emp.averageScore)) + ' cursor-pointer'}
                          >
                            {parseFloat(emp.averageScore).toFixed(2)}/5 - {getScoreLabel(parseFloat(emp.averageScore))}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{emp.votes.length} votes received</div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detail Modal */}
          {detailModal && results && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-card p-6 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Details for {detailModal.empName}</h3>
                  <button onClick={() => setDetailModal(null)} className="text-sm text-muted-foreground">Close</button>
                </div>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">Average: {results.stats.byEmployee[detailModal.empId].averageScore.toFixed(2)}/5</div>
                  <div className="text-sm text-muted-foreground">Total votes: {results.stats.byEmployee[detailModal.empId].votes.length}</div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Per-question performance & ranking</h4>
                    <div className="space-y-3">
                        {results.questions.map((q: any, qi: number) => {
                        const qid = String(q._id);
                        const empAvg = (employeeQuestionAverages[detailModal.empId] || {})[qid] || 0;
                        const rankingArr = questionRankings[qid] || [];
                        const rankObj = rankingArr.find((r: any) => String(r.empId) === String(detailModal.empId));
                        const rank = rankObj ? rankObj.rank : null;
                        const totalParticipants = rankingArr.length || 0;
                        const overallAvg = questionStats[qid] ? questionStats[qid].average : 0;
                        const qual = isQualitativeQuestion(q.text);
                        return (
                          <div key={qi} className="p-3 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-medium">{q.text}</div>
                                <div className="text-sm text-muted-foreground">Employee average: {empAvg ? empAvg.toFixed(2) : '—'}/5</div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {rank ? `${rank}${ordinal(rank)} of ${totalParticipants}` : 'No rank'}
                              </div>
                            </div>
                            {qual ? (
                              <div className="text-sm text-muted-foreground">Open text responses — no chart displayed for this question.</div>
                            ) : (
                              <>
                                <div className="w-full bg-border h-3 rounded overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.round((empAvg/5)*100))}%` }} />
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">Overall avg: {overallAvg ? overallAvg.toFixed(2) : '—'}/5</div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compare Modal */}
          {compareOpen && results && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-card p-6 rounded-lg max-w-5xl w-full max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Compare Employees</h3>
                  <button onClick={() => setCompareOpen(false)} className="text-sm text-muted-foreground">Close</button>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-2">Choose up to 3 employees to compare</div>
                  <div className="flex flex-wrap gap-2">
                    {employeesList.map((emp) => (
                      <label key={emp._id} className={`inline-flex items-center gap-2 px-3 py-1 border rounded cursor-pointer ${compareSelected.includes(emp._id) ? 'bg-primary/10' : ''}`}>
                        <input
                          type="checkbox"
                          checked={compareSelected.includes(emp._id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setCompareSelected((prev) => {
                              const s = new Set(prev);
                              if (checked) s.add(emp._id);
                              else s.delete(emp._id);
                              const arr = Array.from(s);
                              return arr.slice(0, 3);
                            });
                          }}
                        />
                        <span className="text-sm">{emp.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  {compareSelected.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No employees selected.</div>
                  ) : (
                    <CompareView employees={results.stats.byEmployee} empIds={compareSelected} stats={questionStats} empQAvg={employeeQuestionAverages} questions={results.questions} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Full Survey Modal */}
          {fullModalOpen && results && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-card p-6 rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Full Survey Submissions</h3>
                  <button onClick={() => setFullModalOpen(false)} className="text-sm text-muted-foreground">Close</button>
                </div>

                <div className="space-y-4">
                  {results.votes.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No submissions yet.</div>
                  ) : (
                    results.votes.map((v: any, idx: number) => {
                      const emp = results.stats.byEmployee[v.targetEmployeeId]? results.stats.byEmployee[v.targetEmployeeId].employee : null;
                      const empName = emp ? emp.name : (v.targetEmployeeId && (v.targetEmployeeId.name || v.targetEmployeeId)) || 'Unknown';
                      return (
                        <div key={idx} className="border p-3 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">Target: {empName}</div>
                              <div className="text-sm text-muted-foreground">Submitted: {new Date(v.createdAt).toLocaleString()}</div>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            {v.answers.map((a: any, i: number) => {
                              const q = results.questions.find((qq: any) => String(qq._id) === String(a.questionId));
                              return (
                                <div key={i}>
                                  <div className="text-sm font-medium">{q ? q.text : `Question ${i+1}`}</div>
                                  <div className="text-sm">{String(a.answer)}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Select a review cycle to view results
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
