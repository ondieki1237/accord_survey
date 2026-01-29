import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ReviewCycle from './models/ReviewCycle.js';
import { STANDARD_QUESTIONS } from './config/questions.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/accord-survey';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Update ALL review cycles to use standard questions
        const result = await ReviewCycle.updateMany(
            {},
            { $set: { questions: STANDARD_QUESTIONS } }
        );

        console.log(`✓ Updated ${result.modifiedCount} review cycle(s) with standardized questions.`);
        console.log('NOTE: Existing votes remain valid as long as question IDs are referenced correctly.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });
