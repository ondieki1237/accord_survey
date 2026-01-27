'use client';

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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
}

export default function ReviewCycleTable({
  cycles,
  loading,
  onEdit,
  onDelete,
}: ReviewCycleTableProps) {
  const [shareDialog, setShareDialog] = useState<string | null>(null);
  const [questionsDialog, setQuestionsDialog] = useState<null | { id: string; questions: any[] }>(null);

  const getSurveyUrl = (cycleId: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/survey?cycleId=${cycleId}`;
  };

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
    </>
  );
}
