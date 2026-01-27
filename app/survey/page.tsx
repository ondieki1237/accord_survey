'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SurveyContent from './SurveyContent';
import { Alert, AlertDescription } from '@/components/ui/alert';

function SurveyPageContent() {
  const searchParams = useSearchParams();
  const cycleId = searchParams.get('cycleId');
  const [error, setError] = useState<string | null>(null);

  if (!cycleId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-red-500 bg-red-50 text-red-900">
            <AlertDescription>
              Invalid survey link. Please check the URL and try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <SurveyContent cycleId={cycleId} />;
}

export default function SurveyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    }>
      <SurveyPageContent />
    </Suspense>
  );
}
