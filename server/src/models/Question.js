import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    prompt: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'fill'], required: true },
    choices: { type: [String], default: [] },
    answer: { type: String, required: true },
    explanation: { type: String, default: '' },
    level: { type: String, default: 'A1' },
  },
  { timestamps: true }
);

export const Question = mongoose.model('Question', questionSchema);
