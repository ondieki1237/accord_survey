import mongoose from 'mongoose';

const reviewCycleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    questions: [
      {
        text: { type: String, required: true },
        type: { type: String, enum: ['rating', 'text'], default: 'rating' },
        required: { type: Boolean, default: true },
        order: { type: Number, default: 0 }
      }
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('ReviewCycle', reviewCycleSchema);
