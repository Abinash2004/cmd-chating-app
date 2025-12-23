import mongoose from "mongoose";

const roomSchema = await mongoose.Schema({
    roomName: {
        type: String,
        required: true
    },
    exchangeId: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const Room = new mongoose.model("Room",roomSchema);
export { Room };