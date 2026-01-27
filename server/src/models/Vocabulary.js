import mongoose from 'mongoose';

const vocabularySchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }, // optional
    word: { type: String, required: true, trim: true },
    meaning: { type: String, required: true },
    pronunciation: { type: String, default: '' },
    partOfSpeech: {
      type: String,
      enum: ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection'],
      default: 'noun',
    },
    example: { type: String, default: '' },
    level: { type: String, default: 'A1' },
    audioUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes for efficient queries
vocabularySchema.index({ topicId: 1, word: 1 });
vocabularySchema.index({ lessonId: 1 });
vocabularySchema.index({ level: 1 });
vocabularySchema.index({ partOfSpeech: 1 });

export const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);