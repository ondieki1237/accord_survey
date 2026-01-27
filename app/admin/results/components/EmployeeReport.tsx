// app/admin/results/components/EmployeeReport.tsx
import React, { useMemo } from 'react';
import { generateReport } from '@/lib/analytics';
import { ExecutiveSummaryCard } from './ExecutiveSummaryCard';
import { ThemeCloud } from './ThemeCloud';
import { CompetencyRadar } from './CompetencyRadar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmployeeReportProps {
    employee: any;
    votes: any[];
    questions: any[];
    allStats: any;
    orgAverages: any;
}

export const EmployeeReport: React.FC<EmployeeReportProps> = ({ employee, votes, questions, allStats, orgAverages }) => {
    const report = useMemo(() => {
        return generateReport(employee, votes, questions, allStats);
    }, [employee, votes, questions, allStats]);

    const radarData = useMemo(() => {
        // Only use numeric questions
        return questions
            .filter(q => !q.text.toLowerCase().includes('strength') && !q.text.toLowerCase().includes('improve')) // heuristic
            .map(q => {
                const qid = String(q._id);
                const empAvg = (orgAverages[employee._id]?.[qid] || 0);

                // Calculate org average for this question
                let orgTotal = 0, orgCount = 0;
                Object.values(orgAverages).forEach((empAvgs: any) => {
                    if (empAvgs[qid]) { orgTotal += empAvgs[qid]; orgCount++; }
                });
                const orgAvg = orgCount > 0 ? orgTotal / orgCount : 0;

                return {
                    subject: q.shortText || q.text.substring(0, 15) + '...',
                    A: empAvg,
                    B: orgAvg,
                    fullMark: 5
                };
            });
    }, [questions, orgAverages, employee._id]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{employee.name}</h2>
                    <p className="text-muted-foreground">{employee.role} • {employee.department || 'General'}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{report.stats.average.toFixed(2)}<span className="text-sm text-gray-400 font-normal">/5</span></div>
                    <div className="text-xs text-muted-foreground">{report.stats.totalVotes} reviews</div>
                </div>
            </div>

            {/* Executive Summary */}
            <ExecutiveSummaryCard summary={report.summary} />

            {/* Main Content Tabs */}
            <Tabs defaultValue="insights" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                    <TabsTrigger value="insights" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2">Insights & Themes</TabsTrigger>
                    <TabsTrigger value="competencies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2">Competencies</TabsTrigger>
                    <TabsTrigger value="actions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2">Action Plan</TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-emerald-700">Top Strengths</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {report.topStrengths.length > 0 ? report.topStrengths.map((s, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✓</span>
                                            {s}
                                        </li>
                                    )) : <span className="text-muted-foreground italic">Insufficient data for specific strengths.</span>}
                                </ul>
                                <div className="mt-4 pt-4 border-t">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Validated by Feedback Themes</h4>
                                    <ThemeCloud themes={report.themes.filter(t => t.sentiment === 'positive')} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Growth Opportunities */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-amber-700">Growth Opportunities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {report.growthOpportunities.length > 0 ? report.growthOpportunities.map((s, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs">!</span>
                                            {s}
                                        </li>
                                    )) : <span className="text-muted-foreground italic">No major concerns flagged.</span>}
                                </ul>
                                <div className="mt-4 pt-4 border-t">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Constructive Themes</h4>
                                    <ThemeCloud themes={report.themes.filter(t => t.sentiment === 'constructive')} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Collaboration Insight */}
                    <Card className="bg-blue-50/50 border-blue-100">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold text-blue-900 mb-2">Collaboration & Culture</h3>
                            <p className="text-blue-800/80">{report.collaborationInsight}</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="competencies" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <Card className="h-full">
                                <CardHeader><CardTitle>Competency Profile</CardTitle><CardDescription>Vs Organization Average</CardDescription></CardHeader>
                                <CardContent>
                                    <CompetencyRadar data={radarData} />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2 space-y-4">
                            {questions.filter(q => radarData.find(rd => rd.subject === (q.shortText || q.text.substring(0, 15) + '...'))).map(q => {
                                const qid = String(q._id);
                                const empAvg = (orgAverages[employee._id]?.[qid] || 0);
                                return (
                                    <div key={qid} className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                                        <div className="flex-1">
                                            <div className="font-medium">{q.text}</div>
                                        </div>
                                        <div className="text-right w-24">
                                            <div className="text-xl font-bold">{empAvg.toFixed(1)}</div>
                                            <div className="text-xs text-muted-foreground">Avg</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="actions" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recommended Development Plan</CardTitle>
                            <CardDescription>Targeted actions based on peer feedback</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {report.recommendedActions.map((action, i) => (
                                    <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="font-bold text-gray-400 text-lg">0{i + 1}</div>
                                        <div>
                                            <div className="font-medium text-gray-900">{action}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Detailed Breakdown Section */}
            <div className="mt-12 pt-8 border-t border-dashed">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                    Detailed Performance Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.questionStats.map((stat, i) => (
                        <Card key={i} className="border-l-4 border-l-primary/50 overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-medium text-foreground pr-4 h-12 overflow-hidden text-ellipsis line-clamp-2" title={stat.text}>{stat.text}</div>
                                    <div className="text-right whitespace-nowrap">
                                        <div className="text-2xl font-bold text-primary">{stat.average.toFixed(1)}</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden mb-2">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
                                        style={{ width: `${(stat.average / 5) * 100}%` }}
                                    />
                                </div>

                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>Based on {stat.count} ratings</span>
                                    <span>{((stat.average / 5) * 100).toFixed(0)}% Score</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
