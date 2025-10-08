# 🗨️ Yappers Chat System

A full-stack real-time chat platform built with **Angular**, **Node.js**, **Express**, **Socket.IO**, and **MongoDB**.  
Yappers supports **group management**, **channels**, **avatars**, **file uploads**, and **live chat** with persistent message history.

---

## 🚀 Features

- 🔐 **Authentication** via local session
- 💬 **Real-time group chat** using Socket.IO
- 🧑‍🤝‍🧑 **Group and channel management**
- 🖼️ **Image and avatar uploads** via Multer
- 🧾 **Persistent message history** (MongoDB)
- 🧠 **RESTful API + WebSocket layer**
- ⚙️ **Jest + Supertest** API testing
- 📹 **PeerJS video call support (optional)**

---

## 📂 Repository Structure

yappers/
├── src/ # Angular Frontend
│ ├── app/
│ │ ├── components/ # UI Components
│ │ ├── pages/ # Main feature pages (Chat, Groups, Video)
│ │ ├── services/ # Auth, Chat, Upload, Group services
│ │ ├── models/ # Shared TypeScript interfaces
│ │ ├── app.routes.ts # Angular route configuration
│ └── index.html
│
└── server/ # Node.js Backend
├── routes/ # REST API endpoints
├── uploads/ # Uploaded images & avatars
├── tests/ # Jest & Supertest API tests
├── db.js # MongoDB connection
├── index.js # Main server entry point
├── socket.js # Socket.IO real-time logic
└── package.json


---

## ⚙️ Setup and Installation

### 🧱 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [Angular CLI](https://angular.io/cli)
- npm (comes with Node.js)

---

### 🖥️ Backend Setup

1. **Navigate to the server directory**
   ```bash
   cd server


Install dependencies

npm install


Create an .env file

MONGO_URI=mongodb://localhost:27017/yappers
PORT=3000


Start MongoDB (if not already running)

mongod


Run the server

npm start


Server runs at:
http://localhost:3000

💻 Frontend Setup

Navigate to the src directory

cd src


Install dependencies

npm install


Start the Angular app

npm start


Frontend runs at:
http://localhost:4200

🧠 Data Structures
🧑 User

Client (TypeScript Interface):

export interface Session {
  username: string;
  role: 'user' | 'group-admin' | 'super-admin';
  avatarUrl?: string | null;
}


Server (MongoDB):

{
  "_id": "ObjectId('...')",
  "username": "Jack",
  "avatarUrl": "http://localhost:3000/uploads/avatars/jack.jpg"
}

👥 Group

Client:

export interface Group {
  _id: string;
  name: string;
  ownerUsername: string;
  members: string[];
  channels: string[];
  joinRequests: string[];
}


Server:

{
  "_id": "ObjectId('...')",
  "name": "Developers",
  "ownerUsername": "Jack",
  "members": ["Jack", "Emily"],
  "channels": ["General", "Backend"],
  "joinRequests": []
}

💬 Channel

Channels are stored as string arrays:

"channels": ["General", "Frontend", "Backend"]

💭 Message

Client:

export interface ChatMessage {
  username: string;
  message?: string;
  imageUrl?: string;
  avatarUrl?: string | null;
  groupId: string;
  channel: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
}


Server:

{
  "_id": "ObjectId('...')",
  "username": "Jack",
  "message": "Hello team!",
  "imageUrl": null,
  "avatarUrl": "http://localhost:3000/uploads/avatars/jack.jpg",
  "groupId": "ObjectId('...')",
  "channel": "General",
  "timestamp": "2025-10-09T10:00:00Z",
  "type": "text"
}

🛰️ Client and Server Responsibilities
Layer	Responsibilities
Server	- RESTful CRUD API
- Real-time messaging via Socket.IO
- Image and avatar uploads via Multer
- MongoDB persistence
Client	- Handles authentication (AuthService)
- Uploads images (UploadService)
- Fetches and displays groups and chats
- Manages message history and socket events
🔁 API Endpoints
Method	Route	Body / Params	Response	Purpose
GET	/api/ping	–	{ success: true }	Health check
GET	/api/users	–	[users]	List all users
GET	/api/groups	–	[groups]	Retrieve all groups
POST	/api/groups	{ name, ownerUsername }	{ success: true }	Create a new group
POST	/api/groups/:id/channels	{ name }	{ success: true }	Add a new channel
POST	/api/groups/:id/request	{ username }	{ success: true }	Request to join a group
POST	/api/groups/:id/approve	{ username }	{ success: true }	Approve join request
POST	/api/groups/:id/leave	{ username }	{ success: true }	Leave a group
DELETE	/api/groups/:id	–	{ success: true }	Delete a group
POST	/api/upload	FormData(file)	{ url }	Upload chat image
POST	/api/upload/avatar	FormData(file, username)	{ url }	Upload avatar image
🧩 Angular Architecture
Components

GroupsComponent – Displays groups, allows creation/joining.

ChatComponent – Handles live messaging and channel switching.

VideosComponent – Manages PeerJS video calls.

NavbarComponent – Displays user info and navigation.

Services

AuthService – Handles session management and roles.

ChatService – Connects to Socket.IO for live chat.

UploadService – Handles file and avatar uploads.

GroupService – Manages groups, channels, and membership.

Models

Shared data structures: Session, Group, ChatMessage, etc.

Routing

Handles navigation between main pages (Groups → Chat → Video).

🔄 Client–Server Interaction Flow

Login

AuthService.login() saves session locally.

Avatar and role stored in localStorage.

Fetch Groups

GroupsComponent calls GET /api/groups.

Displays available groups.

Join Channel

ChatComponent calls ChatService.joinChannel().

Emits joinChannel Socket.IO event.

Server returns last 50 messages from MongoDB.

Send Message

ChatService.sendMessage() emits via Socket.IO.

Server broadcasts to all users in the channel.

Message stored in MongoDB.

🧪 Running Tests

To run all backend tests:

cd server
npm test


Tests are located in the /server/tests folder and use Jest + Supertest for REST and socket validation.

🧱 Tech Stack
Layer	Technology
Frontend	Angular 20, RxJS, TypeScript
Backend	Node.js, Express, Socket.IO, PeerJS
Database	MongoDB
Uploads	Multer
Testing	Jest, Supertest
🧾 License

This project is licensed under the MIT License.
Feel free to modify, extend, and use for educational or commercial purposes.

👤 Author

Jack R. Carrall
Griffith University – ICT Project: Yappers Chat System
