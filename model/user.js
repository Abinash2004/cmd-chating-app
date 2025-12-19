import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    contactNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    }
});

const User = mongoose.model("user",userSchema);
export { User };