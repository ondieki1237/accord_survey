import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema(
  {
    reviewCycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReviewCycle',
      required: true,
    },
    targetEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    deviceHash: {
      type: String,
      required: true,
    },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
        answer: { type: mongoose.Schema.Types.Mixed, required: true } // Number for rating, String for text
      }
    ],
  },
  { timestamps: true }
);

// Create unique index on reviewCycleId and deviceHash
voteSchema.index(
  { reviewCycleId: 1, deviceHash: 1 },
  { unique: true }
);

export default mongoose.model('Vote', voteSchema);
