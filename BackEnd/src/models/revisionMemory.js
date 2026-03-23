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
        required: true
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

const RevisionMemory = mongoose.model("revisionmemory", revisionMemorySchema);

export default RevisionMemory;
