# Real-Time Chat Application

A professional, feature-rich real-time chat application built with Node.js, Express, and Socket.io.

## Features

✅ **Real-time messaging** - Instant message delivery using WebSockets
✅ **Multiple chat rooms** - Join different rooms for different topics
✅ **User presence** - See who's online in each room
✅ **Typing indicators** - Know when others are typing
✅ **Message history** - View previous messages when joining a room
✅ **System notifications** - Get notified when users join/leave
✅ **Responsive design** - Works on desktop and mobile devices
✅ **REST API** - Access room information and messages programmatically
✅ **Professional UI** - Clean, modern interface with smooth animations

## Tech Stack

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Real-time**: WebSocket protocol
- **Styling**: Custom CSS with CSS variables
- **Utilities**: UUID for unique IDs, Moment.js for timestamps

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/sutharson20069/chat.git
cd chat

# Install dependencies
npm install

# Start the server
npm start

# For development with auto-restart
npm run dev
```

## Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter your username and select a room
3. Start chatting in real-time!

## API Endpoints

### GET /api/rooms
Returns a list of all available rooms and their user counts.

**Response:**
```json
{
  "success": true,
  "rooms": [
    {
      "name": "general",
      "userCount": 5
    },
    {
      "name": "technology",
      "userCount": 2
    }
  ]
}
```

### GET /api/rooms/:room/messages
Returns all messages for a specific room.

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "abc123",
      "user": {
        "id": "user123",
        "username": "John"
      },
      "text": "Hello everyone!",
      "timestamp": "2023-11-15 14:30:25",
      "type": "message"
    }
  ]
}
```

## Socket.io Events

### Client to Server

- `join` - Join a chat room
  ```json
  {
    "username": "John",
    "room": "general"
  }
  ```

- `chatMessage` - Send a chat message
  ```json
  {
    "message": "Hello!",
    "room": "general"
  }
  ```

- `typing` - Indicate typing status
  ```json
  {
    "room": "general",
    "isTyping": true
  }
  ```

### Server to Client

- `joined` - Successfully joined a room
- `userJoined` - Another user joined the room
- `userLeft` - A user left the room
- `newMessage` - New message received
- `userTyping` - User typing indicator
- `error` - Error occurred

## Project Structure

```
chat-app/
├── server.js              # Main server file
├── public/
│   └── index.html         # Frontend HTML/CSS/JS
├── package.json           # Project dependencies
├── .env                   # Environment variables
└── README.md              # Documentation
```

## Deployment

### Heroku

```bash
heroku create
git push heroku main
heroku open
```

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Security Features

- Input validation for usernames and messages
- Message length limits to prevent abuse
- Error handling and graceful shutdown
- CORS configuration for security

## Future Enhancements

- User authentication with JWT
- Message persistence with database
- Private messaging between users
- File and image sharing
- Message reactions and emojis
- User profiles and avatars
- Message editing and deletion
- Admin/moderator roles

## License

MIT License - Free to use, modify, and distribute.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For questions or issues, please contact the maintainer or open a GitHub issue.
