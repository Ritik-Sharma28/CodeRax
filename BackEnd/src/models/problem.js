import mongoose from "mongoose"

const { Schema } = mongoose

const problemSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
    },
    tags: {
        type: String,
        enum: ['array', 'string', 'linkedList', 'tree', 'bst', 'graph', 'dp', 'greedy', 'stack', 'queue', 'heap', 'hashing', 'binarySearch', 'math'],
        required: true
    },
    judgeConfig: {
        outputMode: {
            type: String,
            enum: ['token', 'exact', 'unorderedTokens', 'float'],
            default: 'token'
        },
        floatTolerance: {
            type: Number,
            default: 0.000001
        }
    },

    // Defines the function signature for code generation
    problemSignature: {
        functionName: { type: String, required: true },
        returnType: { type: String, required: true },
        args: [
            {
                name: { type: String, required: true },
                type: { type: String, required: true }
            }
        ]
    },

    visibleTestCases: [
        {
            input: {
                type: String,
                required: true,
            },
            output: {
                type: String,
                required: true,
            },
            explanation: {
                type: String,
                required: true
            }
        }
    ],

    hiddenTestCases: [
        {
            input: {
                type: String,
                required: true,
            },
            output: {
                type: String,
                required: true,
            }
        }
    ],

    startCode: [
        {
            language: {
                type: String,
                required: true,
            },
            initialCode: {
                type: String,
                required: true
            }
        }
    ],

    referenceSolution: [
        {
            language: {
                type: String,
                required: true,
            },
            completeCode: {
                type: String,
                required: true
            }
        }
    ],

    problemCreator: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
})

const Problem = mongoose.model("problem", problemSchema)

export default Problem