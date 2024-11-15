const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); // Assuming token verification middleware is in place
const Chat = require('../models/chatModels');
const User = require('../models/Usermodels'); // Assuming you have a User model

// Send a message
router.post('/sendMessage', verifyToken, async (req, res) => {
  try {
    const { message, receiverId } = req.body;
    
    // Save the message to the database
    const newMessage = new Message({
      sender: req.userId,
      receiver: receiverId,
      message,
      timestamp: new Date(),
    });
    await newMessage.save();

    // Emit the message event to the receiver via `socket.io`
    io.to(receiverId).emit('newMessage', newMessage);

    res.status(200).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Get all chats for a user
router.get('/chats', verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name email') // Populate participant info (optional)
      .sort({ updatedAt: -1 }); // Sort by most recent chat

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.get('/chat/:chatId', verifyToken, async (req, res) => {
  const { chatId } = req.params;
  const userId = req.userId;

  try {
    const chat = await Chat.findById(chatId).populate('participants', 'name email').exec();

    // Ensure that the user is a participant in the chat
    if (!chat || !chat.participants.some(participant => participant._id.toString() === userId.toString())) {
      return res.status(404).json({ message: 'Chat not found or you are not a participant' });
    }

    res.json(chat.messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.delete('/chat/:chatId/message/:messageId', verifyToken, async (req, res) => {
  const { chatId, messageId } = req.params;
  const userId = req.userId;

  try {
    // Find the chat by its ID
    const chat = await Chat.findById(chatId);

    // Check if the chat exists and if the user is a participant
    if (!chat || !chat.participants.some(participant => participant._id.toString() === userId.toString())) {
      return res.status(404).json({ message: 'Chat not found or you are not a participant' });
    }

    // Find the message in the chat
    const message = chat.messages.id(messageId);
    if (!message || message.sender.toString() !== userId.toString()) {
      return res.status(404).json({ message: 'Message not found or you do not have permission to delete' });
    }

    // Use pull to remove the message from the messages array
    chat.messages.pull(messageId);
    await chat.save();  // Save the updated chat document

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;
