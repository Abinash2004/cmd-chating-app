import mongoose from "mongoose";

const conversationSchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    conversation: [{
        senderContactNumber: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const Conversation = mongoose.model("conversation", conversationSchema);
export { Conversation };