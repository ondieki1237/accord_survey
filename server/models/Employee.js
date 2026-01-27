import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: '',
    },
    reviewCycles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReviewCycle',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Employee', employeeSchema);
