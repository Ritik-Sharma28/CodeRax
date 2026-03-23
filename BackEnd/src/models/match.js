import mongoose from "mongoose";
const { Schema } = mongoose;

const matchSchema = new Schema({
    matchId: {
        type: String,
        required: true,
        unique: true,
        length: 6
    },
    type: {
        type: String,
        enum: ['Ranked', 'Custom'],
        default: 'Custom'
    },
    status: {
        type: String,
        enum: ['Waiting', 'Ongoing', 'Completed', 'Abandoned'],
        default: 'Waiting'
    },
    startTime: {
        type: Date,
        default: null
    },
    endTime: {
        type: Date,
        default: null
    },
    hostId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    problems: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'problem'
        }],
        validate: [v => v.length <= 5, 'Cannot have more than 5 problems']
    },
    settings: {
        maxPlayers: { type: Number, default: 10 },
        durationMinutes: { type: Number, default: 60 }
    },
    participants: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        status: {
            type: String,
            enum: ['Joined', 'Ready'],
            default: 'Joined'
        },
        totalScore: {
            type: Number,
            default: 0
        },
        totalTimeMinutes: {
            type: Number,
            default: 0
        },
        problemStats: [{
            problemId: {
                type: Schema.Types.ObjectId,
                ref: 'problem',
                required: true
            },
            solved: {
                type: Boolean,
                default: false
            },
            failedAttempts: {
                type: Number,
                default: 0
            },
            timeTakenMinutes: {
                type: Number,
                default: 0
            }
        }]
    }]
}, {
    timestamps: true
});

const Match = mongoose.model("match", matchSchema);

export default Match;
