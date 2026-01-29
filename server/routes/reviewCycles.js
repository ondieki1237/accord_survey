import express from 'express';
import ReviewCycle from '../models/ReviewCycle.js';
import Employee from '../models/Employee.js';
import Vote from '../models/Vote.js';
import { protect } from '../middleware/authMiddleware.js';
import { STANDARD_QUESTIONS } from '../config/questions.js';

const router = express.Router();

// Get all review cycles
router.get('/', async (req, res, next) => {
  try {
    const cycles = await ReviewCycle.find()
      .populate('employees')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: cycles,
    });
  } catch (error) {
    next(error);
  }
});

// Get single review cycle
router.get('/:id', async (req, res, next) => {
  try {
    const cycle = await ReviewCycle.findById(req.params.id).populate('employees');
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Review cycle not found',
      });
    }
    res.json({
      success: true,
      data: cycle,
    });
  } catch (error) {
    next(error);
  }
});

// Create review cycle (admin only)
router.post('/', protect, async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, employees, questions } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, start date, and end date are required',
      });
    }

    const cycle = new ReviewCycle({
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      employees: employees || [],
      employees: employees || [],
      // enforce standard questions
      questions: STANDARD_QUESTIONS,
    });

    const saved = await cycle.save();
    const populated = await saved.populate('employees');

    res.status(201).json({
      success: true,
      message: 'Review cycle created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
});

// Update review cycle (admin only)
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, isActive, employees, questions } = req.body;

    const cycle = await ReviewCycle.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
        employees,
        employees,
        // enforce standard questions
        questions: STANDARD_QUESTIONS,
      },
      { new: true, runValidators: true }
    ).populate('employees');

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Review cycle not found',
      });
    }

    res.json({
      success: true,
      message: 'Review cycle updated successfully',
      data: cycle,
    });
  } catch (error) {
    next(error);
  }
});

// Delete review cycle (admin only)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const cycle = await ReviewCycle.findByIdAndDelete(req.params.id);

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Review cycle not found',
      });
    }

    // Delete all votes for this cycle
    await Vote.deleteMany({ reviewCycleId: req.params.id });

    res.json({
      success: true,
      message: 'Review cycle deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Add employee to review cycle (admin only)
router.post('/:id/employees', protect, async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required',
      });
    }

    const cycle = await ReviewCycle.findById(req.params.id);
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Review cycle not found',
      });
    }

    if (!cycle.employees.includes(employeeId)) {
      cycle.employees.push(employeeId);
      await cycle.save();
    }

    const populated = await cycle.populate('employees');
    res.json({
      success: true,
      message: 'Employee added to review cycle',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
});

// Remove employee from review cycle (admin only)
router.delete('/:id/employees/:employeeId', protect, async (req, res, next) => {
  try {
    const cycle = await ReviewCycle.findById(req.params.id);
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Review cycle not found',
      });
    }

    cycle.employees = cycle.employees.filter(
      (id) => id.toString() !== req.params.employeeId
    );
    await cycle.save();

    const populated = await cycle.populate('employees');
    res.json({
      success: true,
      message: 'Employee removed from review cycle',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
