// app/admin/results/components/ExecutiveSummaryCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExecutiveSummaryCardProps {
    summary: string;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({ summary }) => {
    return (
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                    Executive Performance Summary
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-lg leading-relaxed text-foreground/90">
                    {summary}
                </p>
            </CardContent>
        </Card>
    );
};
