import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    answers: {
      type: [
        {
          questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
          userAnswer: { type: String, required: true },
          correct: { type: Boolean, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
