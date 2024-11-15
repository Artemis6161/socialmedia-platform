// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Notification = require('../models/NotificationModels');
const createNotification = require('../utils/createNotification');

// Test parameters
const userId = "673366da5709a1122e3cef5f";  // Replace with actual user ID
const type = "like";                 // Notification type (e.g., "like", "comment")
const content = "Someone liked your post"; // Notification content
const referenceId = "6734a557e2242cb9e8b3bac5"; // ID of the post or comment related to the notification

// Trigger a notification
createNotification(userId, type, content, referenceId)
  .then(() => console.log("Notification created"))
  .catch((err) => console.error("Error creating notification:", err));


  router.post('/sendNotification', verifyToken, async (req, res) => {
    try {
      const io = req.app.get('socketio');  // Access the io instance
      const { notification, userId } = req.body;
  
      // Save the notification to the database or perform any additional logic
  
      // Emit the notification to the specific user
      io.emit('receiveNotification', { message: 'You have a new message!', notification,userId });
  
      res.status(200).json({ message: 'Notification sent' });
    } catch (error) {
      res.status(500).json({ message: 'Error sending notification', error: error.message });
    }
  });


// Get all notifications for a user
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark a notification as read
router.put('/notifications/:notificationId/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a notification
router.delete('/notifications/:notificationId', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      user: req.userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
