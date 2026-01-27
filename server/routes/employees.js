import express from 'express';
import Employee from '../models/Employee.js';

const router = express.Router();

// Get all employees
router.get('/', async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
});

// Get single employee
router.get('/:id', async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('reviewCycles');
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }
    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
});

// Create employee
router.post('/', async (req, res, next) => {
  try {
    const { name, role, department } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name and role are required',
      });
    }

    const employee = new Employee({
      name,
      role,
      department: department || '',
    });

    const saved = await employee.save();
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: saved,
    });
  } catch (error) {
    next(error);
  }
});

// Update employee
router.put('/:id', async (req, res, next) => {
  try {
    const { name, role, department } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, role, department },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
});

// Delete employee
router.delete('/:id', async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
