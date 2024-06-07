// models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    ChatID: { type: String, required: true },
    userId: { type: String, required: true },
    Messages: [
        {
            question:{ type: String, required: true },
            message:{ type: String, required: true },
            Timestamp: { type: Date, default: Date.now }
        }
    ]
});

const Chat = mongoose.model('Chat', conversationSchema);

module.exports = {Chat};
