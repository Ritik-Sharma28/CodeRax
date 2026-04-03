import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 20,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true,
    },
    age: {
        type: Number,
        min: 6,
        max: 100,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: 'user'
    },
    verified: {
        type: Boolean,
        default: undefined
    },
    authProvider: {
        type: String,
        enum: ["local", "google", "hybrid"],
        default: "local"
    },
    googleId: {
        type: String,
        default: ""
    },
    problemSolved: [{
        type: Schema.Types.ObjectId,
        ref: 'problem'
    }],
    profilePicture: {
        type: String,
        default: ""
    },
    rating: {
        type: Number,
        default: 1200
    },
    matchesPlayed: {
        type: Number,
        default: 0
    },
    matchesWon: {
        type: Number,
        default: 0
    },
    rank: {
        type: String,
        default: "Bronze"
    },
    password: {
        type: String,
        required: false
    },
    mockInterviewUseLeft: {
        type: Number,
        default: 2
    },
    aiChatMsgsLeft: {
        type: Number,
        default: 10
    },
    revisionMsgsLeft: {
        type: Number,
        default: 5
    },
    lastLimitResetDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

const User = mongoose.model("user", userSchema);

export default User;
