// lib/analytics.ts
import { THEME_MAPPING, STOP_WORDS, POSITIVE_INDICATORS, CONSTRUCTIVE_INDICATORS } from './themes';

export interface AnalyticTheme {
    name: string;
    count: number;
    sentiment: 'positive' | 'neutral' | 'constructive';
    samples: string[];
}

export interface EmployeeReportData {
    summary: string;
    topStrengths: string[];
    growthOpportunities: string[];
    recommendedActions: string[];
    collaborationInsight: string;
    themes: AnalyticTheme[];
    stats: {
        average: number;
        totalVotes: number;
        highestCategory: string;
        lowestCategory: string;
    };
    questionStats: Array<{
        id: string;
        text: string;
        average: number;
        count: number;
        distribution: Record<number, number>;
    }>;
}

// Helper to clean and tokenize text
const tokenize = (text: string): string[] => {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));
};

// Extract themes from a list of text responses
export const extractThemes = (responses: string[]): AnalyticTheme[] => {
    const themeCounts: Record<string, { count: number; samples: string[]; score: number }> = {};

    responses.forEach(response => {
        const tokens = tokenize(response);
        const seenThemes = new Set<string>();

        // Determine overall sentiment of the response
        let sentimentScore = 0; // >0 positive, <0 constructive
        tokens.forEach(t => {
            if (POSITIVE_INDICATORS.has(t)) sentimentScore++;
            if (CONSTRUCTIVE_INDICATORS.has(t)) sentimentScore--;
        });

        tokens.forEach(token => {
            // Check if token matches a known theme
            let themeName = token; // Default to the word itself if no mapping

            // Try exact match or fuzzy match with mapping
            // Simple singularization (remove 's')
            const singular = token.endsWith('s') ? token.slice(0, -1) : token;

            if (THEME_MAPPING[token]) themeName = THEME_MAPPING[token];
            else if (THEME_MAPPING[singular]) themeName = THEME_MAPPING[singular];
            else {
                // If not in mapping, skip generic words unless they appear frequently later
                // For now, we only trust our mapping or very repeated words
                return;
            }

            if (seenThemes.has(themeName)) return; // Count each theme only once per response
            seenThemes.add(themeName);

            if (!themeCounts[themeName]) {
                themeCounts[themeName] = { count: 0, samples: [], score: 0 };
            }

            themeCounts[themeName].count++;
            themeCounts[themeName].score += sentimentScore;
            if (themeCounts[themeName].samples.length < 3) {
                themeCounts[themeName].samples.push(response);
            }
        });
    });

    return Object.entries(themeCounts)
        .map(([name, data]) => ({
            name,
            count: data.count,
            sentiment: data.score >= 0 ? 'positive' : 'constructive',
            samples: data.samples
        }))
        .sort((a, b) => b.count - a.count);
};

// Generate the Executive Summary
export const generateExecutiveSummary = (
    employeeName: string,
    stats: any,
    themes: AnalyticTheme[],
    questions: any[]
): string => {
    const firstName = employeeName.split(' ')[0];
    const avg = stats.average || 0;

    // Determine performance level
    let performanceLevel = '';
    if (avg >= 4.5) performanceLevel = 'an exceptional top performer';
    else if (avg >= 4.0) performanceLevel = 'a strong and reliable contributor';
    else if (avg >= 3.0) performanceLevel = 'a consistent team member with specific growth areas';
    else performanceLevel = 'an employee facing significant performance challenges';

    // Get top strengths (positive themes)
    const strengths = themes.filter(t => t.sentiment === 'positive').slice(0, 2).map(t => t.name.toLowerCase());

    // Get improvement areas (constructive themes)
    const improvements = themes.filter(t => t.sentiment === 'constructive').slice(0, 2).map(t => t.name.toLowerCase());

    let summary = `${firstName} is emerging as ${performanceLevel} (Avg: ${avg.toFixed(1)}/5). `;

    if (strengths.length > 0) {
        summary += `Peers highlight ${strengths.join(' and ')} as key strengths, noting positive impact on team dynamics. `;
    } else {
        summary += `Feedback indicates a need to establish clearer strengths in the role. `;
    }

    if (improvements.length > 0) {
        summary += `Development efforts should focus on ${improvements.join(' and ')} to elevate performance to the next level.`;
    } else {
        summary += `Continuing to broaden scope and influence would be the natural next step.`;
    }

    return summary;
};

// Generate insights
export const generateReport = (
    employee: any,
    votes: any[],
    questions: any[],
    allStats: any
): EmployeeReportData => {
    // Filter votes for this employee
    const empVotes = votes.filter(v => (v.targetEmployeeId._id || v.targetEmployeeId) === employee._id);

    // Aggregate text responses
    const textResponses: string[] = [];
    empVotes.forEach(v => {
        v.answers.forEach((a: any) => {
            // Only include text answers, skip numbers
            if (typeof a.answer === 'string' && a.answer.length > 5) {
                textResponses.push(a.answer);
            }
        });
    });

    // Extract themes
    const themes = extractThemes(textResponses);
    const strengths = themes.filter(t => t.sentiment === 'positive');
    const weaknesses = themes.filter(t => t.sentiment === 'constructive');

    // Calculate stats
    // find highest/lowest question
    let bestQ = { text: '', val: -1 };
    let worstQ = { text: '', val: 6 };

    // We need per-question stats for this employee.
    const qStats: Record<string, { sum: number, count: number, dist: Record<number, number> }> = {};
    empVotes.forEach(v => {
        v.answers.forEach((a: any) => {
            if (typeof a.answer === 'number') {
                const qid = String(a.questionId);
                if (!qStats[qid]) qStats[qid] = { sum: 0, count: 0, dist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
                qStats[qid].sum += a.answer;
                qStats[qid].count++;
                const rounded = Math.round(a.answer);
                if (rounded >= 1 && rounded <= 5) {
                    qStats[qid].dist[rounded] = (qStats[qid].dist[rounded] || 0) + 1;
                }
            }
        });
    });

    const questionBreakdown = Object.entries(qStats).map(([qid, data]) => {
        const qObj = questions.find(q => String(q._id) === qid);
        const text = qObj ? (qObj.shortText || qObj.text) : 'Unknown Question';
        return {
            id: qid,
            text,
            average: data.count > 0 ? data.sum / data.count : 0,
            count: data.count,
            distribution: data.dist
        };
    }).sort((a, b) => b.average - a.average);

    Object.entries(qStats).forEach(([qid, data]) => {
        const avg = data.sum / data.count;
        const qText = questions.find(q => String(q._id) === qid)?.shortText || questions.find(q => String(q._id) === qid)?.text || 'Unknown';
        if (avg > bestQ.val) bestQ = { text: qText, val: avg };
        if (avg < worstQ.val) worstQ = { text: qText, val: avg };
    });

    const empStats = {
        average: parseFloat(allStats?.byEmployee[employee._id]?.averageScore || 0),
        totalVotes: empVotes.length,
        highestCategory: bestQ.text,
        lowestCategory: worstQ.text
    };

    // Generate sections
    const summary = generateExecutiveSummary(employee.name, empStats, themes, questions);

    // Recommended Actions based on weaknesses or generic growth
    const actions = [];
    if (weaknesses.length > 0) {
        weaknesses.slice(0, 3).forEach(w => {
            if (w.name === 'Communication') actions.push('Enroll in structured communication workshops to enhance clarity and feedback delivery.');
            else if (w.name === 'Timeliness') actions.push('Adopt time-management tools (e.g., Jira, Trello) to improve deadline reliability.');
            else if (w.name === 'Leadership') actions.push('Seek mentorship opportunities to develop team management and delegation skills.');
            else actions.push(`Develop a specific action plan to address feedback regarding ${w.name}.`);
        });
    } else {
        actions.push('Identify a cross-functional project to lead to demonstrate next-level capability.');
        actions.push('Mentor junior team members to solidify mastery of current role.');
    }

    // Collaboration Insight
    const collabTheme = themes.find(t => t.name === 'Collaboration' || t.name === 'Teamwork');
    let collabInsight = '';
    if (collabTheme) {
        collabInsight = `${employee.name.split(' ')[0]} is recognized for ${collabTheme.sentiment === 'positive' ? 'strong' : 'developing'} collaboration skills, closely linked to team success.`;
    } else {
        collabInsight = `${employee.name.split(' ')[0]}'s impact on team collaboration is steady, with opportunities to be more vocal in cross-functional settings.`;
    }

    return {
        summary,
        topStrengths: strengths.slice(0, 5).map(t => t.name),
        growthOpportunities: weaknesses.slice(0, 5).map(t => t.name),
        recommendedActions: actions,
        collaborationInsight: collabInsight,
        themes,
        stats: empStats,
        questionStats: questionBreakdown
    };
};
