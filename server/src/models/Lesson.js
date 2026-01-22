import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['vocab', 'grammar', 'listening', 'speaking'],
      required: true,
    },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Lesson = mongoose.model('Lesson', lessonSchema);
