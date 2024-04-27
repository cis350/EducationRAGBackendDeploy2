const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isUserMessage: {
        type: Boolean,
        required: true
    }
});

const ChatSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
        unique: true
    },
    chatName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String, 
        required: true, 
        index: true }, // Indexed for better performance
    messages: [MessageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
});

const ChatModel = mongoose.model("Chat", ChatSchema);
module.exports = ChatModel;