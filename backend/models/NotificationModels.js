// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user to whom the notification is directed
  type: { type: String, required: true }, // e.g., 'follow', 'like', 'comment'
  content: { type: String, required: true }, // A brief message about the notification
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the post, comment, etc.
  read: { type: Boolean, default: false }, // To track if the notification is read or not
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
