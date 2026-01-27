import { Router } from 'express';
import { z } from 'zod';

import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { Topic } from '../models/Topic.js';
import { Lesson } from '../models/Lesson.js';
import { Question } from '../models/Question.js';
import { Vocabulary } from '../models/Vocabulary.js';
import { Quiz } from '../models/Quiz.js';
import { User } from '../models/User.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Progress } from '../models/Progress.js';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

// Topics CRUD
router.get('/topics', async (req, res) => {
  const topics = await Topic.find().sort({ createdAt: -1 });
  return res.json({ topics });
});

router.post('/topics', async (req, res) => {
  const body = z.object({ title: z.string().min(1), description: z.string().optional() }).parse(req.body);
  const topic = await Topic.create({ title: body.title, description: body.description || '' });
  return res.json({ topic });
});

router.put('/topics/:id', async (req, res) => {
  const body = z.object({ title: z.string().min(1), description: z.string().optional() }).parse(req.body);
  const topic = await Topic.findByIdAndUpdate(
    req.params.id,
    { $set: { title: body.title, description: body.description || '' } },
    { new: true }
  );
  return res.json({ topic });
});

router.delete('/topics/:id', async (req, res) => {
  await Topic.deleteOne({ _id: req.params.id });
  await Lesson.deleteMany({ topicId: req.params.id });
  await Question.deleteMany({ topicId: req.params.id });
  await Vocabulary.deleteMany({ topicId: req.params.id });
  await Quiz.deleteMany({ topicId: req.params.id });
  return res.json({ ok: true });
});

// Lessons CRUD
router.get('/topics/:topicId/lessons', async (req, res) => {
  const lessons = await Lesson.find({ topicId: req.params.topicId }).sort({ createdAt: 1 });
  return res.json({ lessons });
});

router.post('/topics/:topicId/lessons', async (req, res) => {
  const body = z
    .object({
      title: z.string().min(1),
      type: z.enum(['vocab', 'grammar', 'listening', 'speaking']),
      content: z.any().optional(),
    })
    .parse(req.body);

  const lesson = await Lesson.create({
    topicId: req.params.topicId,
    title: body.title,
    type: body.type,
    content: body.content ?? {},
  });

  return res.json({ lesson });
});

router.put('/lessons/:id', async (req, res) => {
  const body = z
    .object({
      title: z.string().min(1),
      type: z.enum(['vocab', 'grammar', 'listening', 'speaking']),
      content: z.any().optional(),
    })
    .parse(req.body);

  const lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    { $set: { title: body.title, type: body.type, content: body.content ?? {} } },
    { new: true }
  );

  return res.json({ lesson });
});

router.delete('/lessons/:id', async (req, res) => {
  await Lesson.deleteOne({ _id: req.params.id });
  return res.json({ ok: true });
});

// Questions CRUD
router.get('/topics/:topicId/questions', async (req, res) => {
  const questions = await Question.find({ topicId: req.params.topicId }).sort({ createdAt: 1 });
  return res.json({ questions });
});

router.post('/topics/:topicId/questions', async (req, res) => {
  const body = z
    .object({
      prompt: z.string().min(1),
      type: z.enum(['mcq', 'fill']),
      choices: z.array(z.string()).optional(),
      answer: z.string().min(1),
      explanation: z.string().optional(),
      level: z.string().optional(),
    })
    .parse(req.body);

  const q = await Question.create({
    topicId: req.params.topicId,
    prompt: body.prompt,
    type: body.type,
    choices: body.choices || [],
    answer: body.answer,
    explanation: body.explanation || '',
    level: body.level || 'A1',
  });

  return res.json({ question: q });
});

router.put('/questions/:id', async (req, res) => {
  const body = z
    .object({
      prompt: z.string().min(1),
      type: z.enum(['mcq', 'fill']),
      choices: z.array(z.string()).optional(),
      answer: z.string().min(1),
      explanation: z.string().optional(),
      level: z.string().optional(),
    })
    .parse(req.body);

  const q = await Question.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        prompt: body.prompt,
        type: body.type,
        choices: body.choices || [],
        answer: body.answer,
        explanation: body.explanation || '',
        level: body.level || 'A1',
      },
    },
    { new: true }
  );

  return res.json({ question: q });
});

router.delete('/questions/:id', async (req, res) => {
  await Question.deleteOne({ _id: req.params.id });
  return res.json({ ok: true });
});

// Vocabulary CRUD
router.get('/topics/:topicId/vocabularies', async (req, res) => {
  const vocabularies = await Vocabulary.find({ topicId: req.params.topicId }).sort({ createdAt: 1 });
  return res.json({ vocabularies });
});

router.post('/topics/:topicId/vocabularies', async (req, res) => {
  const body = z
    .object({
      lessonId: z.string().optional(),
      word: z.string().min(1),
      meaning: z.string().min(1),
      pronunciation: z.string().optional(),
      partOfSpeech: z.enum(['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection']).optional(),
      example: z.string().optional(),
      level: z.string().optional(),
      audioUrl: z.string().optional(),
      imageUrl: z.string().optional(),
    })
    .parse(req.body);

  const vocab = await Vocabulary.create({
    topicId: req.params.topicId,
    lessonId: body.lessonId || null,
    word: body.word,
    meaning: body.meaning,
    pronunciation: body.pronunciation || '',
    partOfSpeech: body.partOfSpeech || 'noun',
    example: body.example || '',
    level: body.level || 'A1',
    audioUrl: body.audioUrl || '',
    imageUrl: body.imageUrl || '',
  });

  return res.json({ vocabulary: vocab });
});

router.put('/vocabularies/:id', async (req, res) => {
  const body = z
    .object({
      lessonId: z.string().optional(),
      word: z.string().min(1),
      meaning: z.string().min(1),
      pronunciation: z.string().optional(),
      partOfSpeech: z.enum(['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection']).optional(),
      example: z.string().optional(),
      level: z.string().optional(),
      audioUrl: z.string().optional(),
      imageUrl: z.string().optional(),
    })
    .parse(req.body);

  const vocab = await Vocabulary.findByIdAndUpdate(
    req.params.id,
    {
      lessonId: body.lessonId || null,
      word: body.word,
      meaning: body.meaning,
      pronunciation: body.pronunciation || '',
      partOfSpeech: body.partOfSpeech || 'noun',
      example: body.example || '',
      level: body.level || 'A1',
      audioUrl: body.audioUrl || '',
      imageUrl: body.imageUrl || '',
    },
    { new: true }
  );

  return res.json({ vocabulary: vocab });
});

router.delete('/vocabularies/:id', async (req, res) => {
  await Vocabulary.deleteOne({ _id: req.params.id });
  return res.json({ ok: true });
});

// Quiz CRUD
router.get('/topics/:topicId/quizzes', async (req, res) => {
  const quizzes = await Quiz.find({ topicId: req.params.topicId }).sort({ createdAt: 1 });
  return res.json({ quizzes });
});

router.post('/topics/:topicId/quizzes', async (req, res) => {
  const body = z
    .object({
      lessonId: z.string().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
      questionIds: z.array(z.string()).optional(),
      timeLimit: z.number().optional(),
      passingScore: z.number().min(0).max(100).optional(),
      type: z.enum(['practice', 'assessment', 'final']).optional(),
    })
    .parse(req.body);

  const quiz = await Quiz.create({
    topicId: req.params.topicId,
    lessonId: body.lessonId || null,
    title: body.title,
    description: body.description || '',
    questionIds: body.questionIds || [],
    timeLimit: body.timeLimit || null,
    passingScore: body.passingScore || 70,
    type: body.type || 'practice',
  });

  return res.json({ quiz });
});

router.put('/quizzes/:id', async (req, res) => {
  const body = z
    .object({
      lessonId: z.string().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
      questionIds: z.array(z.string()).optional(),
      timeLimit: z.number().optional(),
      passingScore: z.number().min(0).max(100).optional(),
      type: z.enum(['practice', 'assessment', 'final']).optional(),
      isActive: z.boolean().optional(),
    })
    .parse(req.body);

  const quiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    {
      lessonId: body.lessonId || null,
      title: body.title,
      description: body.description || '',
      questionIds: body.questionIds || [],
      timeLimit: body.timeLimit || null,
      passingScore: body.passingScore || 70,
      type: body.type || 'practice',
      isActive: body.isActive ?? true,
    },
    { new: true }
  );

  return res.json({ quiz });
});

router.delete('/quizzes/:id', async (req, res) => {
  await Quiz.deleteOne({ _id: req.params.id });
  return res.json({ ok: true });
});

// ==================== USER MANAGEMENT ====================

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = search ? { $or: [{ email: { $regex: search, $options: 'i' } }, { name: { $regex: search, $options: 'i' } }] } : {};

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash -refreshTokenHash')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    return res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get user details with learning progress
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-passwordHash -refreshTokenHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const progress = await Progress.find({ userId: req.params.userId }).populate('topicId');
    const quizAttempts = await QuizAttempt.find({ userId: req.params.userId }).sort({ createdAt: -1 });

    const stats = {
      totalLessonsCompleted: progress.reduce((sum, p) => sum + p.completedLessonIds.length, 0),
      totalQuizzesCompleted: quizAttempts.length,
      averageScore: quizAttempts.length > 0 ? (quizAttempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / quizAttempts.length).toFixed(2) : 0,
      totalStudyTime: progress.reduce((sum, p) => sum + p.totalStudyTime, 0),
    };

    return res.json({
      user,
      progress,
      quizAttempts: quizAttempts.slice(0, 10),
      stats,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Lock/unlock user account
router.patch('/users/:userId/lock', async (req, res) => {
  try {
    const body = z.object({ locked: z.boolean() }).parse(req.body);
    const user = await User.findByIdAndUpdate(req.params.userId, { isLocked: body.locked }, { new: true }).select('-passwordHash -refreshTokenHash');
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Promote/Demote user role
router.patch('/users/:userId/role', async (req, res) => {
  try {
    // Validate request body
    const body = z.object({ role: z.enum(['user', 'admin']) }).parse(req.body);
    
    // Check if user ID is valid MongoDB ID
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    // Check if user exists
    const existingUser = await User.findById(req.params.userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new role is same as current role
    if (existingUser.role === body.role) {
      return res.status(400).json({ message: `User already has the ${body.role} role` });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: body.role },
      { new: true }
    ).select('-passwordHash -refreshTokenHash');

    if (!user) {
      return res.status(500).json({ message: 'Failed to update user' });
    }

    return res.status(200).json({
      message: `User role changed from ${existingUser.role} to ${body.role}`,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err) {
    console.error('Role change error:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid role value. Must be "user" or "admin"' });
    }
    return res.status(500).json({ message: err.message || 'Failed to change role' });
  }
});

// Delete user (soft delete - optional)
router.delete('/users/:userId', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    await Progress.deleteMany({ userId: req.params.userId });
    await QuizAttempt.deleteMany({ userId: req.params.userId });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ==================== STATISTICS ====================

// Dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const newUsersToday = await User.countDocuments({
      role: 'user',
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    const totalLessons = await Lesson.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalVocabularies = await Vocabulary.countDocuments();

    const quizAttempts = await QuizAttempt.find();
    const averageScore = quizAttempts.length > 0 ? (quizAttempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / quizAttempts.length).toFixed(2) : 0;

    return res.json({
      users: {
        total: totalUsers,
        admins: totalAdmins,
        newToday: newUsersToday,
      },
      content: {
        lessons: totalLessons,
        quizzes: totalQuizzes,
        vocabularies: totalVocabularies,
      },
      scores: {
        averageScore,
        totalAttempts: quizAttempts.length,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// User statistics
router.get('/stats/users', async (req, res) => {
  try {
    const period = req.query.period || 'month'; // day, week, month

    let startDate = new Date();
    if (period === 'day') startDate.setDate(startDate.getDate() - 1);
    else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    else startDate.setMonth(startDate.getMonth() - 1);

    const userStats = await User.aggregate([
      {
        $match: {
          role: 'user',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const totalUsers = await User.countDocuments({ role: 'user' });

    return res.json({
      total: totalUsers,
      period,
      data: userStats,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Lesson statistics
router.get('/stats/lessons', async (req, res) => {
  try {
    const totalLessons = await Lesson.countDocuments();

    const lessonsCompleted = await Progress.aggregate([
      {
        $group: {
          _id: null,
          totalCompleted: {
            $sum: { $size: '$completedLessonIds' },
          },
        },
      },
    ]);

    const topLessons = await Progress.aggregate([
      {
        $unwind: '$completedLessonIds',
      },
      {
        $group: {
          _id: '$completedLessonIds',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'lessons',
          localField: '_id',
          foreignField: '_id',
          as: 'lesson',
        },
      },
    ]);

    return res.json({
      total: totalLessons,
      totalCompleted: lessonsCompleted[0]?.totalCompleted || 0,
      topLessons,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Quiz statistics
router.get('/stats/quizzes', async (req, res) => {
  try {
    const totalQuizzes = await Quiz.countDocuments();

    const quizStats = await QuizAttempt.aggregate([
      {
        $group: {
          _id: '$quizId',
          attempts: { $sum: 1 },
          averageScore: {
            $avg: { $multiply: [{ $divide: ['$score', '$total'] }, 100] },
          },
          passedCount: {
            $sum: { $cond: ['$passed', 1, 0] },
          },
        },
      },
      {
        $sort: { attempts: -1 },
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: '_id',
          as: 'quiz',
        },
      },
    ]);

    const topPerforming = await QuizAttempt.aggregate([
      {
        $group: {
          _id: '$userId',
          averageScore: {
            $avg: { $multiply: [{ $divide: ['$score', '$total'] }, 100] },
          },
          attemptCount: { $sum: 1 },
        },
      },
      {
        $sort: { averageScore: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
    ]);

    return res.json({
      total: totalQuizzes,
      quizStats,
      topPerforming,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Score statistics
router.get('/stats/scores', async (req, res) => {
  try {
    const scoreDistribution = await QuizAttempt.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $gte: [{ $multiply: [{ $divide: ['$score', '$total'] }, 100] }, 80] },
              'Excellent (80-100)',
              {
                $cond: [
                  { $gte: [{ $multiply: [{ $divide: ['$score', '$total'] }, 100] }, 60] },
                  'Good (60-79)',
                  {
                    $cond: [
                      { $gte: [{ $multiply: [{ $divide: ['$score', '$total'] }, 100] }, 40] },
                      'Fair (40-59)',
                      'Poor (<40)',
                    ],
                  },
                ],
              },
            ],
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const averageScore = await QuizAttempt.aggregate([
      {
        $group: {
          _id: null,
          averageScore: {
            $avg: { $multiply: [{ $divide: ['$score', '$total'] }, 100] },
          },
          medianScore: { $avg: { $multiply: [{ $divide: ['$score', '$total'] }, 100] } },
          maxScore: {
            $max: { $multiply: [{ $divide: ['$score', '$total'] }, 100] },
          },
          minScore: {
            $min: { $multiply: [{ $divide: ['$score', '$total'] }, 100] },
          },
        },
      },
    ]);

    return res.json({
      scoreDistribution,
      statistics: averageScore[0] || { averageScore: 0, maxScore: 0, minScore: 0 },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
