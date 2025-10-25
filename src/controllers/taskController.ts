import { Response } from 'express';
import { AuthenticatedRequest } from '../types/custom';
import Task from '../models/Task';
import { MongooseError } from '../types/error';
import { logError } from '../utils/logger';

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user?.id });
    res.status(201).json(task);
  } catch (error: unknown) {
    logError(error as Error);
    if (error instanceof Error) {
      const mongooseError = error as MongooseError;
      if (mongooseError.code === 11000) {
        return res.status(400).json({ message: 'Duplicate task title' });
      }
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    // Build the query based on user role
    const query = req.user?.role === 'Admin' ? {} : { createdBy: req.user?.id };

    // Get tasks based on the query
    const tasks = await Task.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    // Get total count based on the same query
    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    logError(error as Error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to update the task
    if (req.user?.role !== 'Admin' && task.createdBy.toString() !== req.user?.id) {
      return res.status(403).json({ message: "You don't have permission to update this task" });
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      'createdBy',
      'name email'
    );

    res.json(updated);
  } catch (error: unknown) {
    logError(error as Error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Task deleted' });
};

export const toggleTaskStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to toggle the task
    if (req.user?.role !== 'Admin' && task.createdBy.toString() !== req.user?.id) {
      return res.status(403).json({ message: "You don't have permission to update this task" });
    }

    // Toggle the status between "Pending" and "Completed"
    task.status = task.status === 'Pending' ? 'Completed' : 'Pending';
    await task.save();

    // Populate the creator details before sending response
    await task.populate('createdBy', 'name email');

    res.json({
      message: 'Task status updated successfully',
      task,
    });
  } catch (error: unknown) {
    logError(error as Error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
