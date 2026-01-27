'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import SurveyForm from './SurveyForm';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import apiFetch from '@/lib/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://survey.codewithseth.co.ke/api'
    : 'http://localhost:5090/api');

interface ReviewCycle {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  employees: any[];
  questions: any[];
}

interface SurveyContentProps {
  cycleId: string;
}

export default function SurveyContent({ cycleId }: SurveyContentProps) {
  const [cycle, setCycle] = useState<ReviewCycle | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const initializeSurvey = async () => {
      try {
        setLoading(true);

        // Get device fingerprint
        const fingerprint = await getDeviceFingerprint();
        setDeviceId(fingerprint);

        // Fetch review cycle (public endpoint)
        let reviewCycle = null;
        try {
          const cycleRes = await apiFetch(`/public/review-cycles/${cycleId}`);
          if (cycleRes.status === 404) {
            const listRes = await apiFetch('/public/review-cycles');
            const listData = await listRes.json();
            if (listData.success && Array.isArray(listData.data)) {
              reviewCycle = listData.data.find((c: any) => c._id === cycleId) || listData.data[0] || null;
            }
          } else {
            const cycleData = await cycleRes.json();
            if (cycleData.success) reviewCycle = cycleData.data;
          }
        } catch (err) {
          console.error('Error fetching review cycle:', err);
        }

        if (!reviewCycle) {
          setError('Survey not found');
          return;
        }

        // Check if cycle is active
        const now = new Date();
        const endDate = new Date(reviewCycle.endDate);
        if (now > endDate) {
          setError('This survey has ended');
          return;
        }

        setCycle(reviewCycle);

        // Check if device has already voted
        const hasVotedRes = await apiFetch(`/votes/check/${cycleId}/${encodeURIComponent(fingerprint)}`);
        const hasVotedData = await hasVotedRes.json();
        if (hasVotedData.success) {
          setHasVoted(hasVotedData.hasVoted);
        }

        setError(null);
      } catch (err) {
        setError('Failed to load survey');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeSurvey();
  }, [cycleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-red-500 bg-red-50 text-red-900">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Survey not found</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600">Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">
              Your feedback has been submitted successfully and securely recorded.
            </p>
            <p className="text-sm text-muted-foreground">
              This device cannot submit another vote for this review cycle. Thank you for your honest feedback!
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-accent">
          <CardHeader>
            <CardTitle className="text-accent">Already Submitted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">
              You have already submitted your feedback for this review cycle.
            </p>
            <p className="text-sm text-muted-foreground">
              To maintain anonymity and fairness, each device can only submit one response per review cycle.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/accord_transparent_logo.png"
            alt="Accord Medical Logo"
            className="h-20 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Accord Survey
          </h1>
          <p className="text-muted-foreground">
            Anonymous team feedback platform
          </p>
        </div>

        {/* Privacy Notice */}
        <Alert className="mb-8 border-primary/20 bg-primary/5">
          <AlertDescription className="text-sm text-foreground">
            <strong>Privacy Notice:</strong> This system uses an anonymous device fingerprint to prevent duplicate submissions. No personal identity or contact information is collected.
          </AlertDescription>
        </Alert>

        {/* Survey Card */}
        <Card>
          <CardHeader>
            <CardTitle>{cycle.name}</CardTitle>
            <CardDescription>
              {cycle.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SurveyForm
              cycleId={cycleId}
              employees={cycle.employees}
              questions={cycle.questions}
              deviceId={deviceId}
              onSubmit={() => setSubmitted(true)}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Survey closes on{' '}
            <strong>
              {new Date(cycle.endDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}
