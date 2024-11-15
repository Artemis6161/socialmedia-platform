const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Post = require('../models/PostModels');


// Create a new post
router.post('/post', verifyToken, async (req, res) => {
    const { content } = req.body;
    const userId = req.userId; // Use req.userId directly
  
    try {
      const newPost = new Post({ user: userId, content });
      await newPost.save();
      res.status(201).json(newPost);
    } catch (error) {
      res.status(500).json({ message: 'Error creating post', error: error.message });
    }
  });
  
  // Get all posts with comments
  router.get('/posts', verifyToken, async (req, res) => {
    try {
      const posts = await Post.find()
        .populate('user', 'name')
        .populate('comments.user', 'name')
        .sort({ createdAt: -1 });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
  });

  // Edit Post
  router.put('/post/:postId', verifyToken, async (req, res) => {
    const { content } = req.body;
    const userId = req.userId; // From the token
  
    try {
      // Find the post and ensure it belongs to the current user
      const post = await Post.findOneAndUpdate(
        { _id: req.params.postId, user: userId },
        { content },
        { new: true }
      );
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found or you do not have permission to edit' });
      }
  
      res.json(post);
    } catch (error) {
      console.error("Edit Error:", error);  // Log the error
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  
  
  // Delete Post
  router.delete('/post/:postId', verifyToken, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.userId; // Extracted from the token
  
    try {
     
  
      // Find and delete the post only if it belongs to the current user
      const post = await Post.findOneAndDelete({ _id: postId, user: userId });
  
      if (!post) {
        console.log("Post not found or not owned by user.");
        return res.status(404).json({ message: 'Post not found or you do not have permission to delete' });
      }
  
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error("Delete Error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
 router.post('/add', verifyToken, async (req, res) => {
    try {
      const userId = req.userId;  // Extracted from the token
      const { postId, content  } = req.body;
     
  
      // Find the post by ID
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Create new comment and add it to the post's comments array
      const newComment = { user: userId, content};
      post.comments.push(newComment);
      
      // Save the updated post
      await post.save();
  
      res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

 // Like or Unlike a Post
router.put('/post/:postId/like', verifyToken, async (req, res) => {
    const userId = req.userId; // ID of the user liking/unliking
    const { postId } = req.params;
  
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Check if user already liked the post
      if (post.likes.includes(userId)) {
        // User has already liked the post; remove like (unlike)
        post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        await post.save();
        return res.json({ message: 'Post unliked', likes: post.likes.length });
      } else {
        // User has not liked the post; add like
        post.likes.push(userId);
        await post.save();
        return res.json({ message: 'Post liked', likes: post.likes.length });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
 

 

  /// Add a comment to a post
router.post('/add', verifyToken, async (req, res) => {
    try {
      const userId = req.userId;  // User from token
      const { postId, content } = req.body;
  
      console.log("Received postId:", postId);  // Log postId for debugging
  
      // Check if postId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: 'Invalid postId format' });
      }
  
      // Find the post by ID
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Create new comment
      const newComment = new Comment({
        user: userId,
        content,
        createdAt: new Date(),
      });
  
      const savedComment = await newComment.save(); // Save the new comment
  
      // Add the comment's ID to the post's comments array
      post.comments.push(savedComment._id);
      await post.save();
  
      res.status(201).json({
        message: 'Comment added successfully',
        commentId: savedComment._id,  // Return the comment ID
        comment: savedComment,  // Return the full comment object
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  
  
  
  
  
  

  
  
  // Get a specific comment by ID within a post
router.get('/post/:postId/comment/:commentId', verifyToken, async (req, res) => {
    const { postId, commentId } = req.params;
  
    try {
      // Find the post by postId
      const post = await Post.findById(postId).populate('comments.user', 'name');
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Find the specific comment within the post's comments array by commentId
      const comment = post.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      res.json(comment); // Return the found comment
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
   


// Edit comment
router.put('/comment/:commentId', verifyToken, async (req, res) => {
    const { content } = req.body;
    const userId = req.userId; // From the token
    
    try {
      // Find the post containing the comment, then find the comment in the post's comments array
      const post = await Post.findOne({
        'comments._id': req.params.commentId,
        'comments.user': userId, // Ensure the comment belongs to the current user
      });
  
      if (!post) {
        return res.status(404).json({ message: 'Comment not found or you do not have permission to edit' });
      }
  
      // Find the specific comment within the post's comments array and update it
      const comment = post.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      // Update comment content
      comment.content = content;
      await post.save();
  
      res.json(comment);
    } catch (error) {
      console.error("Edit Error:", error);  // Log the error
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  


  
   // Like or Unlike a Post
router.put('/comment/:postId/like', verifyToken, async (req, res) => {
    const userId = req.userId; // ID of the user liking/unliking
    const { postId } = req.params;
  
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Check if user already liked the commend
      if (comment.likes.includes(userId)) {
        // User has already liked the comment; remove like (unlike)
        comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
        await comment.save();
        return res.json({ message: 'Post unliked', likes: comment.likes.length });
      } else {
        // User has not liked the comment; add like
        comment.likes.push(userId);
        await comment.save();
        return res.json({ message: 'Post liked', likes: comment.likes.length });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  
  module.exports = router;