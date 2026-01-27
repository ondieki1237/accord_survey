'use client';

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { authFetch, API_BASE_URL } from '@/lib/auth';

interface ReviewCycle {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isActive: boolean;
  employees: any[];
  questions: any[];
  createdAt: string;
}

interface ReviewCycleTableProps {
  cycles: ReviewCycle[];
  loading: boolean;
  onEdit: (cycle: ReviewCycle) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
}

export default function ReviewCycleTable({
  cycles,
  loading,
  onEdit,
  onDelete,
  onRefresh,
}: ReviewCycleTableProps) {
  const [shareDialog, setShareDialog] = useState<string | null>(null);
  const [questionsDialog, setQuestionsDialog] = useState<null | { id: string; questions: any[] }>(null);
  const [assignDialog, setAssignDialog] = useState<null | { id: string; selected: string[] }>(null);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);

  const getSurveyUrl = (cycleId: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/survey?cycleId=${cycleId}`;
  };

  // Load employees when opening assign dialog
  useEffect(() => {
    const loadEmployees = async () => {
      if (!assignDialog) return;
      try {
        const res = await authFetch(`${API_BASE_URL}/employees`);
        const data = await res.json();
        if (data.success) setAllEmployees(data.data);
      } catch (err) {
        console.error('Failed to load employees', err);
      }
    };

    loadEmployees();
  }, [assignDialog]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading review cycles...
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No review cycles yet. Create one to get started.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr className="text-left text-muted-foreground font-semibold">
              <th className="pb-3 px-4">Cycle Name</th>
              <th className="pb-3 px-4">Start Date</th>
              <th className="pb-3 px-4">End Date</th>
              <th className="pb-3 px-4">Employees</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cycles.map((cycle) => {
              const isActive = new Date(cycle.endDate) > new Date();
              return (
                <tr
                  key={cycle._id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium">{cycle.name}</td>
                  <td className="py-3 px-4">
                    {format(new Date(cycle.startDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    {format(new Date(cycle.endDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">{cycle.employees.length}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      className={
                        isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {isActive ? 'Active' : 'Closed'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShareDialog(cycle._id)}
                      className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Share
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAssignDialog({ id: cycle._id, selected: (cycle.employees || []).map((e: any) => (e._id ? e._id : e)) })}
                      className="text-xs"
                    >
                      Assign
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuestionsDialog({ id: cycle._id, questions: cycle.questions || [] })}
                      className="text-xs"
                    >
                      Questions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(cycle)}
                      className="text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-red-600 hover:text-red-700 bg-transparent"
                      onClick={() => onDelete(cycle._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Share Dialog */}
      <Dialog open={!!shareDialog} onOpenChange={() => setShareDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Survey Link</DialogTitle>
            <DialogDescription>
              Copy and share this link with your team members to collect feedback
            </DialogDescription>
          </DialogHeader>

          {shareDialog && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg border border-border">
                <Input
                  value={getSurveyUrl(shareDialog)}
                  readOnly
                  className="bg-background border border-border text-sm font-mono"
                />
              </div>

              <Button
                onClick={() => {
                  copyToClipboard(getSurveyUrl(shareDialog));
                  alert('Survey link copied to clipboard!');
                }}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Copy Link
              </Button>

              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-semibold">How to share:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Copy the link above</li>
                  <li>Share via email, Slack, or any communication channel</li>
                  <li>Team members can vote anonymously using this link</li>
                  <li>One device, one vote per review cycle</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Questions Dialog */}
      <Dialog open={!!questionsDialog} onOpenChange={() => setQuestionsDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Survey Questions</DialogTitle>
            <DialogDescription>Preview the questions configured for this cycle</DialogDescription>
          </DialogHeader>

          {questionsDialog && (
            <div className="space-y-3">
              {questionsDialog.questions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No questions configured.</p>
              ) : (
                <ol className="list-decimal list-inside space-y-2">
                  {questionsDialog.questions.map((q: any, i: number) => (
                    <li key={i} className="space-y-1">
                      <div className="font-medium">{q.text}</div>
                      <div className="text-sm text-muted-foreground">Type: {q.type} {q.required ? '• Required' : ''}</div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Employees Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Employees</DialogTitle>
            <DialogDescription>Choose employees to include in this review cycle</DialogDescription>
          </DialogHeader>

          {assignDialog && (
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto pr-2">
                {allEmployees.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Loading employees...</div>
                ) : (
                  allEmployees.map((emp) => (
                    <label key={emp._id} className="flex items-center gap-2 p-2 border-b last:border-0">
                      <input
                        type="checkbox"
                        checked={assignDialog.selected.includes(emp._id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setAssignDialog((prev) => {
                            if (!prev) return prev;
                            const sel = new Set(prev.selected);
                            if (checked) sel.add(emp._id);
                            else sel.delete(emp._id);
                            return { ...prev, selected: Array.from(sel) };
                          });
                        }}
                      />
                      <div>
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-sm text-muted-foreground">{emp.role}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setAssignDialog(null)} className="flex-1">Cancel</Button>
                <Button
                  onClick={async () => {
                    if (!assignDialog) return;
                    try {
                      setAssignLoading(true);
                      const res = await authFetch(`${API_BASE_URL}/review-cycles/${assignDialog.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ employees: assignDialog.selected }),
                      });

                      if (res.ok) {
                        setAssignDialog(null);
                        if (typeof window !== 'undefined') {
                          // optional: refresh parent list
                          if (typeof (window as any).location !== 'undefined') {
                            // no-op
                          }
                        }
                        if (typeof (props as any) !== 'undefined') {
                          // eslint-disable-next-line
                        }
                        // Call optional refresh callback
                        onRefresh && onRefresh();
                      } else {
                        const d = await res.json();
                        alert(d.message || 'Failed to assign employees');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Error assigning employees');
                    } finally {
                      setAssignLoading(false);
                    }
                  }}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={assignLoading}
                >
                  {assignLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
