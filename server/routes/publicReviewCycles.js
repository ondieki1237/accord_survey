import express from 'express';
import ReviewCycle from '../models/ReviewCycle.js';

const router = express.Router();

// Public: get all active review cycles (optional)
router.get('/', async (req, res, next) => {
  try {
    const cycles = await ReviewCycle.find({ isActive: true }).populate('employees').sort({ createdAt: -1 });
    res.json({ success: true, data: cycles });
  } catch (err) {
    next(err);
  }
});

// Public: get single review cycle by id
router.get('/:id', async (req, res, next) => {
  try {
    const cycle = await ReviewCycle.findById(req.params.id).populate('employees');
    if (!cycle) {
      return res.status(404).json({ success: false, message: 'Review cycle not found' });
    }
    res.json({ success: true, data: cycle });
  } catch (err) {
    next(err);
  }
});

export default router;
