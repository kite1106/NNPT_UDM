import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }, // optional - question for specific lesson
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }, // optional - question belongs to quiz
    prompt: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'fill'], required: true }, // will expand later
    choices: { type: [String], default: [] },
    answer: { type: String, required: true },
    explanation: { type: String, default: '' },
    level: { type: String, default: 'A1' },
    points: { type: Number, default: 1 },
    mediaUrl: { type: String, default: '' }, // for future audio/video questions
    order: { type: Number, default: 0 }, // for ordering in quiz
  },
  { timestamps: true }
);

export const Question = mongoose.model('Question', questionSchema);
