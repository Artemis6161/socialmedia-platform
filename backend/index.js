const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

// Route imports
const userRoute = require('./routes/userRoutes');
const followRoutes = require('./routes/followRoute');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoute');

// Initialize dotenv for environmental variables
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Body parser middleware
app.use(express.json({ extended: false }));

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:3000', // Corrected origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

// Create HTTP server for socket.io integration
const server = http.createServer(app);

// Initialize socket.io with the server and CORS options
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000",  // Ensure this matches the client URL
        methods: ["GET", "POST"],
        credentials: true,
        pingInterval: 25000,
        pingTimeout: 60000,
    }
});

// Use CORS middleware
app.use(cors(corsOptions));

// Set socket.io instance to app for potential access in routes
app.set('socketio', io);

// API routes
app.use('/user', userRoute);
app.use('/api', postRoutes);
app.use('/user', followRoutes);
app.use('/chat', chatRoutes);
app.use('/api', notificationRoutes);

// Socket.io connection event
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
  
    // Listen for notifications
    socket.on('sendNotification', (data) => {
        console.log('Notification received:', data);
        
        // Example of how you might emit a notification to a specific user or all clients
        const notificationData = {
            userId: data.userId,  // or any data you want to send
            message: 'You have a new notification',
        };

        // Emit notification to the client (you can emit to specific user or all users)
        socket.emit('receiveNotification', notificationData);
    });
  
    // Listen for disconnection event
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.error("Error connecting to MongoDB:", error));

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
