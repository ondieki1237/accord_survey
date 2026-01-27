'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authFetch, API_BASE_URL } from '@/lib/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, GripVertical } from 'lucide-react';

interface Question {
  _id?: string;
  text: string;
  type: 'rating' | 'text';
  required: boolean;
  order: number;
}

interface ReviewCycle {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  employees: any[];
  questions: Question[];
}

interface ReviewCycleModalProps {
  cycle: ReviewCycle | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ReviewCycleModal({
  cycle,
  onClose,
  onSave,
}: ReviewCycleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cycle) {
      setFormData({
        name: cycle.name,
        description: cycle.description,
        startDate: new Date(cycle.startDate).toISOString().split('T')[0],
        endDate: new Date(cycle.endDate).toISOString().split('T')[0],
      });
      setQuestions(cycle.questions || []);
    } else {
      // Default questions for new cycle
      setQuestions([
        { text: "Completes tasks on time and meets quality standards", type: 'rating', required: true, order: 1 },
        { text: "Demonstrates integrity and honesty", type: 'rating', required: true, order: 2 },
        { text: "What are this employee's key strengths?", type: 'text', required: true, order: 3 },
      ]);
    }
  }, [cycle]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', type: 'rating', required: true, order: questions.length + 1 },
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions.map((q, i) => ({ ...q, order: i + 1 })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    if (questions.some(q => !q.text.trim())) {
      setError('All questions must have text');
      return;
    }

    try {
      setLoading(true);
      const url = cycle
        ? `${API_BASE_URL}/review-cycles/${cycle._id}`
        : `${API_BASE_URL}/review-cycles`;
      const method = cycle ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify({
          ...formData,
          questions
        }),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to save review cycle');
      }
    } catch (err) {
      setError('Error saving review cycle');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cycle ? 'Edit' : 'Create'} Review Cycle</DialogTitle>
          <DialogDescription>
            Configure cycle details and survey questions
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert className="border-red-500 bg-red-50 text-red-900">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Details</h3>
              <div>
                <Label htmlFor="name">Cycle Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Q1 2024 Review"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Additional details..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-lg">Questions ({questions.length})</h3>
                <Button type="button" size="sm" onClick={addQuestion} variant="outline" className="h-8">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {questions.map((q, idx) => (
                  <div key={idx} className="flex gap-2 items-start bg-muted/30 p-3 rounded-md border border-border">
                    <div className="mt-2 text-muted-foreground cursor-move">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        value={q.text}
                        onChange={(e) => handleQuestionChange(idx, 'text', e.target.value)}
                        placeholder="Question text..."
                        className="h-9"
                      />
                      <div className="flex gap-2">
                        <Select
                          value={q.type}
                          onValueChange={(val) => handleQuestionChange(idx, 'type', val)}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rating">Rating (1-5)</SelectItem>
                            <SelectItem value="text">Text Answer</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2 ml-auto">
                          <Label className="text-xs">Required</Label>
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => handleQuestionChange(idx, 'required', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                      onClick={() => removeQuestion(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Saving...' : 'Save Cycle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
