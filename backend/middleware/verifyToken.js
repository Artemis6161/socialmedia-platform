const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Attach userId to request object
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    return res.status(403).json({ error: 'Failed to authenticate token' });
  }
};
module.exports = verifyToken;
