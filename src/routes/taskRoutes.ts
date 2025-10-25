import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  toggleTaskStatus,
} from '../controllers/taskController';

const router = express.Router();

router.use(protect);

router.route('/').post(createTask).get(getTasks);

router.patch('/:id/toggle-status', toggleTaskStatus);

router.route('/:id').put(updateTask).delete(deleteTask);

export default router;
