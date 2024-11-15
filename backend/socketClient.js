const socket = require('socket.io-client')('http://localhost:5000'); // Ensure correct URL (including the correct port)

socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('receiveNotification', (data) => {
  console.log('Notification received:', data);
});

// Optionally disconnect after a few seconds
setTimeout(() => {
    socket.disconnect();
    console.log('Disconnected from server');
}, 10000);
