// utils/createNotification.js
const Notification = require('../models/NotificationModels');

const createNotification = async (userId, type, content, referenceId) => {
  try {
    const newNotification = new Notification({
      user: userId,
      type,
      content,
      referenceId
    });

    await newNotification.save();
  } catch (error) {
    console.error("Notification Creation Error:", error);
  }
};

module.exports = createNotification;
