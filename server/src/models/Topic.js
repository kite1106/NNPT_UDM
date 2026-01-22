import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Topic = mongoose.model('Topic', topicSchema);
