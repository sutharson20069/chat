require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configuration
const PORT = process.env.PORT || 3000;
const MAX_MESSAGE_LENGTH = 1000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data store (for demo purposes)
const users = new Map();
const rooms = new Map();
const messages = new Map();

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // User joins
  socket.on('join', ({ username, room }) => {
    try {
      // Validate input
      if (!username || !room) {
        socket.emit('error', { message: 'Username and room are required' });
        return;
      }

      if (username.length > 20) {
        socket.emit('error', { message: 'Username too long (max 20 chars)' });
        return;
      }

      // Create user
      const userId = uuidv4();
      const user = {
        id: userId,
        username,
        room,
        socketId: socket.id
      };

      // Add user to room
      users.set(socket.id, user);
      
      if (!rooms.has(room)) {
        rooms.set(room, new Set());
      }
      rooms.get(room).add(socket.id);

      // Initialize messages for room if not exists
      if (!messages.has(room)) {
        messages.set(room, []);
      }

      // Join socket.io room
      socket.join(room);

      // Send welcome message
      const welcomeMessage = {
        id: uuidv4(),
        user: { username: 'System', id: 'system' },
        text: `${username} has joined the room`,
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        type: 'system'
      };

      messages.get(room).push(welcomeMessage);

      // Send room info and messages
      socket.emit('joined', {
        user,
        room,
        messages: messages.get(room),
        users: Array.from(rooms.get(room)).map(id => users.get(id))
      });

      // Broadcast to room
      socket.to(room).emit('userJoined', {
        user,
        message: welcomeMessage
      });

    } catch (error) {
      console.error('Join error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle chat messages
  socket.on('chatMessage', ({ message, room }) => {
    try {
      const user = users.get(socket.id);
      
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // Validate message
      if (!message || message.trim() === '') {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      if (message.length > MAX_MESSAGE_LENGTH) {
        socket.emit('error', { message: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` });
        return;
      }

      // Create message
      const chatMessage = {
        id: uuidv4(),
        user: {
          id: user.id,
          username: user.username
        },
        text: message.trim(),
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        type: 'message'
      };

      // Store message
      messages.get(room).push(chatMessage);

      // Broadcast to room
      io.to(room).emit('newMessage', chatMessage);

    } catch (error) {
      console.error('Message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', ({ room, isTyping }) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(room).emit('userTyping', {
        userId: user.id,
        username: user.username,
        isTyping
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    
    if (user) {
      const room = user.room;
      const roomUsers = rooms.get(room);
      
      if (roomUsers && roomUsers.has(socket.id)) {
        roomUsers.delete(socket.id);
        
        // Send leave message
        const leaveMessage = {
          id: uuidv4(),
          user: { username: 'System', id: 'system' },
          text: `${user.username} has left the room`,
          timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
          type: 'system'
        };

        messages.get(room).push(leaveMessage);
        
        // Broadcast to room
        socket.to(room).emit('userLeft', {
          userId: user.id,
          username: user.username,
          message: leaveMessage
        });
      }
      
      users.delete(socket.id);
    }
    
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// REST API endpoints
app.get('/api/rooms', (req, res) => {
  try {
    const roomList = Array.from(rooms.keys()).map(room => ({
      name: room,
      userCount: rooms.get(room).size
    }));
    
    res.json({ success: true, rooms: roomList });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/rooms/:room/messages', (req, res) => {
  try {
    const { room } = req.params;
    const roomMessages = messages.get(room) || [];
    
    res.json({ success: true, messages: roomMessages });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Serve main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Access the chat at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
