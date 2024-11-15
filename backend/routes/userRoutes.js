const express = require('express')
const router = express.Router()
const User = require('../models/Usermodels')
const bcrypt =require('bcryptjs')
const jwt = require('jsonwebtoken')
const verifyToken = require('../middleware/verifyToken');


// Register








// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) 
      return res.status(400).json({ status: false, message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) 
      return res.status(400).json({ status: false, message: "User already exists" });

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '10h' });
    return res.status(201).json({ token, status: true, message: "Registration successful" });
    
  } catch (error) {
    return res.status(400).json({ status: false, message: "Something went wrong", error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10h' });

    // Send the userId and token in the response
    res.status(200).json({
      token,
      userId: user._id,
      userName: user.name
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



router.get('/profile',verifyToken, async (req, res) => {
  const userId = req.query.userId;

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile details
router.put('/profile',verifyToken, async (req, res) => {
  const { userId, name, email, phone, gender, birthday } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name, email, phone, gender, birthday },  // Update name, gender, and birthday
      { new: true }                // Return the updated document
    ).select('-password');          // Exclude password from response

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


  
// Delete a post
router.delete('/post/:postId', verifyToken, async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await post.remove();

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});



  

  
 


module.exports = router;