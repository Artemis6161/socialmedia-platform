const express = require('express');
const router = express.Router();
const User = require('../models/Usermodels');
const verifyToken = require('../middleware/verifyToken');



// Follow a user
router.post('/follow/:userId', verifyToken, async (req, res) => {
  const userId = req.userId; // From the token
  const followUserId = req.params.userId; // ID of the user to follow

  if (userId === followUserId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  try {
    const user = await User.findById(userId);
    const followUser = await User.findById(followUserId);

    if (!user || !followUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is already following the other user
    if (user.following.includes(followUserId)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    // Add the follow user to the following list of the current user
    user.following.push(followUserId);
    followUser.followers.push(userId);

    await user.save();
    await followUser.save();

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


// Unfollow a user
router.post('/unfollow/:id', verifyToken, async (req, res) => {
  const userId = req.userId; // Get the current logged-in userId from the token
  const targetUserId = req.params.id; // The user being unfollowed

  try {
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already not following the target user
    if (!user.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Remove from following and followers arrays
    user.following = user.following.filter(following => following.toString() !== targetUserId.toString());
    targetUser.followers = targetUser.followers.filter(follower => follower.toString() !== userId.toString());

    await user.save();
    await targetUser.save();

    res.status(200).json({ message: 'Unfollowed user successfully', targetUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a user's followers
router.get('/followers/:id', verifyToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).populate('followers', 'name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.followers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a user's following list
router.get('/following/:id', verifyToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).populate('following', 'name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.following);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
