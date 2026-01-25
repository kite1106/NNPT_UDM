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
    content: {
      // Structured content based on lesson type
      vocab: {
        vocabularyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vocabulary' }],
        introduction: { type: String, default: '' },
      },
      grammar: {
        explanation: { type: String, default: '' },
        examples: [{ type: String }],
        rules: [{ type: String }],
        exercises: [{ type: String }],
      },
      listening: {
        audioUrl: { type: String, default: '' },
        transcript: { type: String, default: '' },
        questions: [{ type: String }],
        tips: { type: String, default: '' },
      },
      speaking: {
        prompt: { type: String, default: '' },
        audioUrl: { type: String, default: '' }, // sample audio
        tips: { type: String, default: '' },
        keyPhrases: [{ type: String }],
      },
    },
    order: { type: Number, default: 0 }, // for sorting lessons in topic
    estimatedTime: { type: Number, default: 15 }, // in minutes
  },
  { timestamps: true }
);

export const Lesson = mongoose.model('Lesson', lessonSchema);
