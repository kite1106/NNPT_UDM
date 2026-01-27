import { Router } from 'express';
import { z } from 'zod';

import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { Topic } from '../models/Topic.js';
import { Lesson } from '../models/Lesson.js';
import { Question } from '../models/Question.js';
import { Vocabulary } from '../models/Vocabulary.js';
import { Quiz } from '../models/Quiz.js';

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

export default router;
