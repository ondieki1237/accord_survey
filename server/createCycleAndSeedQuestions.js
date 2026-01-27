import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ReviewCycle from './models/ReviewCycle.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/accord-survey';

const QUESTIONS = [
    { text: "Completes tasks on time and meets quality standards", type: 'rating', order: 1 },
    { text: "Demonstrates reliability and accountability", type: 'rating', order: 2 },
    { text: "Follows company procedures and compliance requirements", type: 'rating', order: 3 },
    { text: "Communicates clearly and professionally", type: 'rating', order: 4 },
    { text: "Works effectively in teams and cross-department collaboration", type: 'rating', order: 5 },
    { text: "Demonstrates understanding of his/her role and responsibilities", type: 'rating', order: 6 },
    { text: "Applies problem-solving and decision-making skills effectively", type: 'rating', order: 7 },
    { text: "Takes ownership of tasks and responsibilities", type: 'rating', order: 8 },
    { text: "Follows through on commitments without constant supervision", type: 'rating', order: 9 },
    { text: "Demonstrates integrity and honesty", type: 'rating', order: 10 },
    { text: "What are this employee's key strengths? Provide specific examples.", type: 'text', order: 11 },
    { text: "What is one area he/she can improve to be more effective? Be constructive and specific.", type: 'text', order: 12 },
    { text: "What should this employee start, stop, or continue doing to grow professionally?", type: 'text', order: 13 },
    { text: "How does this employee impact team collaboration and cross-department work?", type: 'text', order: 14 },
    { text: "Is there any support or training you recommend to help this employee grow?", type: 'text', order: 15 },
];

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const now = new Date();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const cycleData = {
            name: 'Seeded Review Cycle',
            description: 'Automatically created review cycle with seeded questions',
            startDate: now,
            endDate: new Date(now.getTime() + oneWeek),
            isActive: true,
            questions: QUESTIONS,
            employees: [],
        };

        const cycle = await ReviewCycle.create(cycleData);
        console.log(`Created review cycle: ${cycle._id} (${cycle.name})`);
        console.log('Questions seeded successfully.');
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
