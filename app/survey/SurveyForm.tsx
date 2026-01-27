"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import apiFetch from '@/lib/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://survey.codewithseth.co.ke/api'
    : 'http://localhost:5090/api');

interface Employee {
  _id: string;
  name: string;
  role: string;
}

interface Question {
  _id: string;
  text: string;
  type: string; // 'rating' | 'text'
  required: boolean;
  order: number;
}

interface SurveyFormProps {
  cycleId: string;
  employees: Employee[];
  questions: Question[];
  deviceId: string;
  onSubmit: () => void;
  onCurrentEmployeeChange?: (emp: Employee) => void;
}

// 1-10 Scale
const SCORE_OPTIONS = Array.from({ length: 5 }, (_, i) => ({
  value: i + 1,
  label: (i + 1).toString(),
}));

export default function SurveyForm({
  cycleId,
  employees,
  questions,
  deviceId,
  onSubmit,
  onCurrentEmployeeChange,
}: SurveyFormProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const _cbRef = useRef(onCurrentEmployeeChange);
  const _lastSent = useRef<string | null>(null);

  // keep latest callback in a ref so effect below doesn't depend on it
  useEffect(() => {
    _cbRef.current = onCurrentEmployeeChange;
  }, [onCurrentEmployeeChange]);

  useEffect(() => {
    if (!_cbRef.current || !employees || employees.length === 0) return;
    const emp = employees[currentIndex];
    const empId = emp?._id ? String(emp._id) : String(currentIndex);
    if (_lastSent.current !== empId) {
      _lastSent.current = empId;
      try {
        _cbRef.current(emp);
      } catch (e) {
        // ignore errors from parent
      }
    }
    // intentionally NOT including onCurrentEmployeeChange in deps to avoid unstable callback causing loops
  }, [currentIndex, employees]);

  // Defensive: if no employees provided, render a friendly message
  if (!employees || employees.length === 0) {
    return (
      <div className="min-h-[200px]">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold">No employees to review</h3>
          <p className="text-sm text-muted-foreground mt-2">
            There are no employees assigned to this review cycle. If you are an admin, please add employees to the cycle.
          </p>
        </div>
      </div>
    );
  }

  // State structure: { [employeeId]: { [questionId]: answer } }
  const [responses, setResponses] = useState<{
    [employeeId: string]: { [questionId: string]: string | number }
  }>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentEmployee = employees[currentIndex];

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    setResponses((prev) => ({
      ...prev,
      [currentEmployee._id]: {
        ...(prev[currentEmployee._id] || {}),
        [questionId]: answer,
      },
    }));
  };

  const getAnswer = (questionId: string) => {
    return responses[currentEmployee._id]?.[questionId] || '';
  };

  const isCurrentEmployeeComplete = () => {
    const employeeResponses = responses[currentEmployee._id] || {};
    return questions.every((q) => {
      if (!q.required) return true;
      const ans = employeeResponses[q._id];
      return ans !== undefined && ans !== '' && ans !== 0;
    });
  };

  const handleNext = () => {
    if (isCurrentEmployeeComplete()) {
      if (currentIndex < employees.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setError(null);
        window.scrollTo(0, 0);
      }
    } else {
      setError("Please answer all required questions before proceeding.");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setError(null);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    // Final validation
    if (!isCurrentEmployeeComplete()) {
      setError('Please complete all required fields for the current employee');
      return;
    }

    try {
      setLoading(true);

      // Submit votes for all employees
      const submitPromises = employees.map((emp) => {
        const empAnswers = responses[emp._id] || {};
        const formattedAnswers = Object.entries(empAnswers).map(([qId, val]) => ({
          questionId: qId,
          answer: val
        }));

        return apiFetch('/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId,
            reviewCycleId: cycleId,
            targetEmployeeId: emp._id,
            answers: formattedAnswers
          }),
        });
      });

      const results = await Promise.all(submitPromises);
      const allSuccessful = results.every((res) => res.ok);

      if (allSuccessful) {
        onSubmit();
      } else {
        const firstError = results.find((res) => !res.ok);
        const errorData = await firstError?.json();
        setError(errorData?.message || 'Failed to submit feedback. Please try again.');
      }
    } catch (err) {
      setError('Error submitting feedback. Please try again.');
    }
  };

  const progress = ((currentIndex + 1) / employees.length) * 100;

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-500 bg-red-50 text-red-900">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            {currentIndex + 1} of {employees.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Employee Card */}
      <div className="border border-border rounded-lg p-6 bg-card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {currentEmployee.name}
          </h2>
          <p className="text-muted-foreground">{currentEmployee.role}</p>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {questions.map((q, qIdx) => (
            <div key={q._id} className="space-y-3 pb-6 border-b border-border last:border-0 last:pb-0">
              <Label className="text-base font-semibold block">
                {qIdx + 1}. {q.text} {q.required && <span className="text-red-500">*</span>}
              </Label>

              {q.type === 'rating' ? (
                <RadioGroup
                  value={getAnswer(q._id).toString()}
                  onValueChange={(val) => handleAnswerChange(q._id, parseInt(val))}
                  className="flex flex-wrap gap-2"
                >
                  {SCORE_OPTIONS.map((opt) => (
                    <div key={opt.value} className="flex items-center">
                      <RadioGroupItem
                        value={opt.value.toString()}
                        id={`q-${q._id}-${opt.value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`q-${q._id}-${opt.value}`}
                        className={`
                                            flex items-center justify-center w-10 h-10 rounded-full border cursor-pointer transition-all
                                            peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground
                                            hover:border-primary/50
                                        `}
                      >
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Textarea
                  value={getAnswer(q._id) as string}
                  onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="resize-none"
                  rows={3}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || loading}
          className="flex-1 bg-transparent"
        >
          Previous
        </Button>

        {currentIndex === employees.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={!isCurrentEmployeeComplete() || loading}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!isCurrentEmployeeComplete() || loading}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
