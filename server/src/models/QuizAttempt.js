import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    timeSpent: { type: Number, default: 0 }, // in seconds
    passed: { type: Boolean, default: false },
    answers: {
      type: [
        {
          questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
          userAnswer: { type: String, required: true },
          correct: { type: Boolean, required: true },
          timeSpent: { type: Number, default: 0 }, // time spent on this question
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
