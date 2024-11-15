const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a schema for the Chat message
const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Define the schema for the Chat with participants and messages
const chatSchema = new Schema({
  participants: [
    { type: Schema.Types.ObjectId, ref: 'User', required: true } // List of users in the chat
  ],
  messages: [messageSchema] // Array of messages in this chat
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
