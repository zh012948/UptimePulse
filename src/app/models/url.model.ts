import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    endpoint: {
        type: String,
        default: "/"
    },
    lastStatus: {
        type: String,
        enum: ["UP", "DOWN"],
        default: null
    },
    lastResponseTime: {
        type: Number,
        default: null
    },
    lastPingedAt: {
        type: Date,
        default: null
    },
    lastError: {
        type: String,
        default: null
    }
}, { timestamps: true });

export default mongoose.models.Url || mongoose.model("Url", urlSchema);
