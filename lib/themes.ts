// lib/themes.ts

export const STOP_WORDS = new Set([
    'the', 'and', 'a', 'to', 'of', 'is', 'in', 'for', 'that', 'this', 'with', 'on', 'be', 'it', 'are', 'as', 'an', 'or', 'by', 'from', 'have', 'has', 'i', 'you', 'we', 'they', 'he', 'she',
    'employee', 'member', 'team', 'person', 'work', 'working', 'job', 'role', 'company', 'organization', 'department',
    'very', 'really', 'much', 'lot', 'always', 'sometime', 'sometimes', 'can', 'could', 'should', 'would',
    'make', 'do', 'doing', 'does', 'did', 'done', 'go', 'going', 'gone', 'get', 'getting', 'got',
    'what', 'why', 'how', 'when', 'where', 'who', 'which', 'there', 'here', 'just', 'more', 'less',
    'also', 'too', 'well', 'good', 'bad', 'better', 'best', 'worst', 'time', 'year', 'month', 'week', 'day',
    'continue', 'stop', 'start', 'keep', 'needs', 'needed', 'need'
]);

// Map specific keywords to broader professional themes
export const THEME_MAPPING: Record<string, string> = {
    // Communication
    'communicate': 'Communication',
    'communication': 'Communication',
    'communicating': 'Communication',
    'communicator': 'Communication',
    'listen': 'Active Listening',
    'listening': 'Active Listening',
    'clear': 'Clarification',
    'clarity': 'Clarification',
    'feedback': 'Feedback',
    'responsive': 'Responsiveness',

    // Leadership & Management
    'lead': 'Leadership',
    'leadership': 'Leadership',
    'leader': 'Leadership',
    'guide': 'Mentorship',
    'guidance': 'Mentorship',
    'mentor': 'Mentorship',
    'coaching': 'Coaching',
    'support': 'Support',
    'supportive': 'Support',
    'manage': 'Management',
    'manager': 'Management',
    'delegate': 'Delegation',
    'delegating': 'Delegation',

    // Teamwork
    'collaborate': 'Collaboration',
    'collaboration': 'Collaboration',
    'collaborative': 'Collaboration',
    'team': 'Teamwork',
    'teamwork': 'Teamwork',
    'player': 'Teamwork',
    'help': 'Helpfulness',
    'helpful': 'Helpfulness',
    'helping': 'Helpfulness',

    // Execution & Work Quality
    'fast': 'Speed of Execution',
    'quick': 'Speed of Execution',
    'speed': 'Speed of Execution',
    'quality': 'Work Quality',
    'detail': 'Attention to Detail',
    'detailed': 'Attention to Detail',
    'thorough': 'Thoroughness',
    'reliable': 'Reliability',
    'dependable': 'Reliability',
    'deadline': 'Timeliness',
    'timely': 'Timeliness',
    'efficient': 'Efficiency',
    'efficiency': 'Efficiency',

    // Soft Skills
    'kind': 'Empathy',
    'nice': 'Friendliness',
    'friendly': 'Friendliness',
    'attitude': 'Attitude',
    'positive': 'Attitude',
    'positivity': 'Attitude',
    'calm': 'Composure',
    'patience': 'Patience',
    'patient': 'Patience',

    // Innovation & Growth
    'innovate': 'Innovation',
    'innovation': 'Innovation',
    'creative': 'Creativity',
    'idea': 'Creativity',
    'ideas': 'Creativity',
    'solution': 'Problem Solving',
    'solve': 'Problem Solving',
    'solving': 'Problem Solving',
    'learn': 'Learning',
    'growth': 'Growth Mindset',
    'improve': 'Improvement',
    'goal': 'Goal-Oriented',
    'driven': 'Drive'
};

// Positive sentiment indicators for lightweight sentiment analysis
export const POSITIVE_INDICATORS = new Set([
    'great', 'excellent', 'amazing', 'good', 'strong', 'best', 'superb', 'outstanding',
    'strength', 'love', 'happy', 'impressed', 'perfect', 'reliable', 'helpful', 'top',
    'pro', 'expert', 'smart', 'fast', 'quick', 'clear', 'leader', 'asset', 'valuable'
]);

// Constructive/Negative sentiment indicators
export const CONSTRUCTIVE_INDICATORS = new Set([
    'improve', 'needs', 'better', 'slow', 'hard', 'difficult', 'confusing', 'late',
    'miss', 'lack', 'bad', 'worst', 'weak', 'confuse', 'unclear', 'struggle',
    'focus', 'attention', 'more', 'less', 'stop', 'start', 'try'
]);
