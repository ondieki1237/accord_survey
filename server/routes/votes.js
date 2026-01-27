import express from 'express';
import Vote from '../models/Vote.js';
import ReviewCycle from '../models/ReviewCycle.js';
import { hashDevice, isValidDeviceId } from '../utils/fingerprint.js';

const router = express.Router();

// Check if device has already voted in this review cycle
router.get('/check/:reviewCycleId/:deviceId', async (req, res, next) => {
  try {
    const { reviewCycleId, deviceId } = req.params;

    if (!isValidDeviceId(deviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device ID',
      });
    }

    const deviceHash = hashDevice(deviceId, reviewCycleId);

    const existingVote = await Vote.findOne({
      reviewCycleId,
      deviceHash,
    });

    res.json({
      success: true,
      hasVoted: !!existingVote,
    });
  } catch (error) {
    next(error);
  }
});

// Submit a vote
router.post('/', async (req, res, next) => {
  try {
    const { deviceId, reviewCycleId, targetEmployeeId, answers } = req.body;

    // Validate required fields
    if (!deviceId || !reviewCycleId || !targetEmployeeId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Device ID, Review Cycle ID, Target Employee ID, and answers array are required',
      });
    }

    // Validate device ID format
    if (!isValidDeviceId(deviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device ID format',
      });
    }

    // Fetch review cycle to validate questions
    const cycle = await ReviewCycle.findById(reviewCycleId);
    if (!cycle) {
      return res.status(404).json({ success: false, message: 'Review cycle not found' });
    }

    // basic validation of answers
    for (const ans of answers) {
      if (!ans.questionId) {
        return res.status(400).json({ success: false, message: 'Missing questionId in answer' });
      }
      // You could add stricter type checking here based on the question type defined in the cycle
    }

    // Hash the device ID with review cycle ID
    const deviceHash = hashDevice(deviceId, reviewCycleId);

    // Create vote
    const vote = new Vote({
      reviewCycleId,
      targetEmployeeId,
      deviceHash,
      answers,
    });

    const saved = await vote.save();

    res.status(201).json({
      success: true,
      message: 'Vote submitted successfully',
      data: saved,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a vote for this review cycle',
      });
    }
    next(error);
  }
});

// Get votes for a review cycle (admin only)
router.get('/cycle/:reviewCycleId', async (req, res, next) => {
  try {
    const votes = await Vote.find({ reviewCycleId: req.params.reviewCycleId })
      .populate('targetEmployeeId')
      .populate('reviewCycleId')
      .sort({ createdAt: -1 });

    const cycle = await ReviewCycle.findById(req.params.reviewCycleId);

    // Calculate statistics
    const stats = {
      totalVotes: votes.length,
      averageScore: 0, // This needs to be calculated differently now
      byEmployee: {},
    };

    votes.forEach((vote) => {
      // Defensive: targetEmployeeId may be null if employee was deleted or not populated
      const te = vote.targetEmployeeId;
      let empId;
      if (te && (te._id || te.toString)) {
        empId = te._id ? te._id.toString() : String(te);
      } else {
        // skip votes without a valid targetEmployeeId to avoid throwing
        console.warn('Skipping vote with missing targetEmployeeId', vote._id);
        return;
      }

      if (!stats.byEmployee[empId]) {
        stats.byEmployee[empId] = {
          employee: vote.targetEmployeeId,
          votes: [],
          averageScore: 0,
        };
      }
      stats.byEmployee[empId].votes.push(vote);
    });

    // Helper to calculate average from ratings in answers
    const calculateAverage = (voteList) => {
      let totalScore = 0;
      let count = 0;

      voteList.forEach(v => {
        v.answers.forEach(ans => {
          // Find question type if needed, but assuming numeric answers are ratings
          if (typeof ans.answer === 'number') {
            totalScore += ans.answer;
            count++;
          }
        });
      });

      return count > 0 ? (totalScore / count).toFixed(2) : 0;
    };

    // Calculate employee averages
    Object.values(stats.byEmployee).forEach((emp) => {
      emp.averageScore = calculateAverage(emp.votes);
    });

    // Global average
    stats.averageScore = calculateAverage(votes);

    res.json({
      success: true,
      data: {
        votes,
        stats,
        questions: cycle ? cycle.questions : []
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get vote statistics for an employee
router.get('/employee/:targetEmployeeId', async (req, res, next) => {
  try {
    // Simplified for brevity, follows similar pattern
    const votes = await Vote.find({ targetEmployeeId: req.params.targetEmployeeId })
      .populate('reviewCycleId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        votes,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
