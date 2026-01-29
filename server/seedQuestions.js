import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ReviewCycle from './models/ReviewCycle.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/accord-survey';

import { STANDARD_QUESTIONS } from './config/questions.js';

const QUESTIONS = STANDARD_QUESTIONS;

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Find the active review cycle, or the latest one
        let cycle = await ReviewCycle.findOne({ isActive: true }).sort({ createdAt: -1 });

        if (!cycle) {
            console.log('No active cycle found. Checking for any cycle...');
            cycle = await ReviewCycle.findOne().sort({ createdAt: -1 });
        }

        if (!cycle) {
            console.log('No review cycles found. Please create one first.');
            process.exit(1);
        }

        console.log(`Updating cycle: ${cycle.name}`);

        // Update questions
        cycle.questions = QUESTIONS;
        await cycle.save();

        console.log('Questions seeded successfully.');
        console.log('NOTE: Existing votes for this cycle are now invalid due to schema change.');
        process.exit();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
