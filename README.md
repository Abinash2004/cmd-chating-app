# CLI Chat Application

A scalable, command-line based real-time chat application supporting one-to-one and group communication with persistent message storage and decoupled messaging architecture.

---

## Features

- Username-based CLI login with configurable ports  
- One-to-one and multi-user group chat support  
- Password-protected chat rooms  
- Real-time messaging using Socket.io  
- Conversation history stored and fetched from MongoDB  
- Paginated chat history in CLI  
- Switch between active conversations  
- Notifications for messages from inactive chats  
- Message queuing, scheduling and offline delivery using RabbitMQ  
- Graceful shutdown via CLI command

---

## Tech Stack

- **Node.js** – Server and CLI runtime  
- **Socket.io** – Real-time messaging  
- **MongoDB** – Persistent message storage  
- **RabbitMQ** – Decoupled and reliable message delivery

---

## Getting Started

```bash
# Install dependencies
npm install

# Run the application
node index.js --senderPort 4000 --receiverPort 5000 --contactNumber 0000000000
```
