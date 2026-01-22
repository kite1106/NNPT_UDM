import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Topic } from '../models/Topic.js';
import { Lesson } from '../models/Lesson.js';
import { Progress } from '../models/Progress.js';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub).select('email name role');
  if (!user) return res.status(404).json({ message: 'Not found' });
  return res.json({ user: { id: String(user._id), email: user.email, name: user.name, role: user.role } });
});

router.get('/topics', requireAuth, async (req, res) => {
  const topics = await Topic.find().sort({ createdAt: -1 });
  return res.json({ topics });
});

router.get('/topics/:topicId/lessons', requireAuth, async (req, res) => {
  const lessons = await Lesson.find({ topicId: req.params.topicId }).sort({ createdAt: 1 });
  return res.json({ lessons });
});

router.post('/topics/:topicId/lessons/:lessonId/complete', requireAuth, async (req, res) => {
  const { topicId, lessonId } = req.params;
  const userId = req.user.sub;

  const p = await Progress.findOneAndUpdate(
    { userId, topicId },
    {
      $set: { lastStudiedAt: new Date() },
      $addToSet: { completedLessonIds: lessonId },
    },
    { upsert: true, new: true }
  );

  return res.json({ progress: p });
});

router.get('/progress', requireAuth, async (req, res) => {
  const progress = await Progress.find({ userId: req.user.sub }).sort({ updatedAt: -1 });
  return res.json({ progress });
});

export default router;
