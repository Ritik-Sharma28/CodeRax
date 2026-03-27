import mongoose from "mongoose";

const { Schema } = mongoose;

const transcriptEntrySchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ["voice", "editor", "reconnect", "silence-prompt"],
      default: "voice",
    },
  },
  { _id: false }
);

const performanceReportSchema = new Schema(
  {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    overallFeedback: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const mockInterviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    techStack: {
      type: String,
      required: true,
      trim: true,
    },
    focusArea: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      trim: true,
    },
    transcript: {
      type: [transcriptEntrySchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Transcript must contain at least one entry",
      },
    },
    finalCode: {
      type: String,
      default: "",
    },
    performanceReport: {
      type: performanceReportSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "abandoned", "timed_out"],
      default: "completed",
    },
    durationSeconds: {
      type: Number,
      min: 0,
      default: 0,
    },
    endedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

mockInterviewSchema.index({ userId: 1, createdAt: -1 });
mockInterviewSchema.index({ userId: 1, focusArea: 1, createdAt: -1 });

const MockInterview = mongoose.model("mockinterview", mockInterviewSchema);

export default MockInterview;
