import mongoose from "mongoose";
const { Schema } = mongoose;

const revisionMemorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        default: null
    },
    topic: {
        type: String,
        default: ""
    },
    sourceType: {
        type: String,
        enum: ["problem_note", "interview"],
        default: "problem_note"
    },
    tags: {
        type: [String],
        default: []
    },
    summary: {
        type: String,
        required: true
    },
    vector: {
        type: [Number],
        required: true,
        validate: {
            validator: (v) => v.length === 384,
            message: 'Vector must have exactly 384 dimensions'
        }
    }
}, {
    timestamps: true
});

revisionMemorySchema.index({ userId: 1, sourceType: 1, createdAt: -1 });

const RevisionMemory = mongoose.model("revisionmemory", revisionMemorySchema);

export default RevisionMemory;
