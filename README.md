# Chatapp

A real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO.

## Tech Stack

**Client:** React, Vite, Tailwind CSS, Framer Motion, Socket.IO Client
**Server:** Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT Auth

## Features

- Real-time messaging via WebSockets
- User authentication (register/login) with JWT
- One-on-one and group chats
- Image/file uploads
- Emoji and sticker picker
- Message forwarding
- Campaign/ broadcast messaging

## Setup

### Prerequisites

- Node.js (v18+)
- MongoDB connection string

### 1. Clone & install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Environment variables

**server/.env** - configure your MongoDB URI, JWT secret, and EmailJS credentials (see `.env` file).

**client/.env** - set the API URL (default: `http://localhost:5000`).

### 3. Run

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5000`.

## License

MIT
