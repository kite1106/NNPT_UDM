import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    completedLessonIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    lastStudiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

export const Progress = mongoose.model('Progress', progressSchema);
