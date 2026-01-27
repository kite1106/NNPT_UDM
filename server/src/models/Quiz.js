import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }, // optional - quiz for specific lesson
    title: { type: String, required: true },
    description: { type: String, default: '' },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    timeLimit: { type: Number, default: null }, // in minutes, null = no limit
    passingScore: { type: Number, default: 70 }, // percentage
    isActive: { type: Boolean, default: true },
    type: {
      type: String,
      enum: ['practice', 'assessment', 'final'],
      default: 'practice'
    },
  },
  { timestamps: true }
);

// Index for efficient queries
quizSchema.index({ topicId: 1 });
quizSchema.index({ lessonId: 1 });
quizSchema.index({ isActive: 1 });

export const Quiz = mongoose.model('Quiz', quizSchema);