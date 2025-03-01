# YouTube Backend Project Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Installation & Setup](#installation--setup)
5. [Environment Variables](#environment-variables)
6. [Project Structure](#project-structure)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [Authentication & Authorization](#authentication--authorization)
10. [Middleware](#middleware)
11. [Error Handling](#error-handling)
12. [Deployment](#deployment)
13. [Contributing](#contributing)
14. [License](#license)

---

## Introduction
This project is a backend API for a YouTube-like video-sharing platform, built using the MERN stack with Node.js and Express.js. It provides functionalities for video uploading, streaming, commenting, liking, user authentication, and more.

## Features
- User authentication (JWT-based login/register/logout)
- Video upload, processing, and streaming
- Comments and likes on videos
- Playlist management
- Real-time notifications (if implemented with Socket.IO)
- Advanced search using MongoDB Atlas Search
- Adaptive Bitrate Streaming (HLS/DASH support)

## Technology Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Authentication:** JSON Web Token (JWT)
- **Storage:** Cloud storage (if applicable) or local file system
- **Streaming:** HLS/DASH for adaptive bitrate streaming

## Installation & Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/youtube-backend.git
   cd youtube-backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables (see `.env.sample`). Create a `.env` file and configure your MongoDB URL, JWT secrets, etc.
4. Start the development server:
   ```sh
   npm run dev
   ```

## Environment Variables
The following environment variables should be set in a `.env` file:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUD_STORAGE_KEY=your_cloud_storage_key
```

## Project Structure
```
youtube-backend/
│-- src/
│   │-- controllers/       # Handles API logic
│   │-- middlewares/       # Authentication & other middlewares
│   │-- models/            # Mongoose models
│   │-- routes/            # Express routes
│   │-- utils/             # Helper functions
│   │-- app.js             # Main app configuration
│   │-- index.js           # Server entry point
│-- public/                # Static assets (if applicable)
│-- .env                   # Environment variables
│-- package.json           # Project metadata & dependencies
```

## API Endpoints
### Authentication
- **POST `/api/auth/register`** – Register a new user
- **POST `/api/auth/login`** – User login
- **POST `/api/auth/logout`** – User logout

### User
- **GET `/api/users/:id`** – Get user profile
- **PUT `/api/users/:id`** – Update user profile

### Video
- **POST `/api/videos/upload`** – Upload a new video
- **GET `/api/videos/:id`** – Get video details
- **DELETE `/api/videos/:id`** – Delete a video

### Comment
- **POST `/api/comments/:videoId`** – Add a comment
- **GET `/api/comments/:videoId`** – Get comments on a video

### Like
- **POST `/api/likes/:videoId`** – Like/unlike a video

### Playlist
- **POST `/api/playlists`** – Create a new playlist
- **GET `/api/playlists/:id`** – Get a playlist
- **PUT `/api/playlists/:id`** – Update playlist details
- **DELETE `/api/playlists/:id`** – Delete a playlist

## Database Schema
### User Schema
```js
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String,
  profilePic: String,
  subscribers: Number,
  createdAt: Date
}
```

### Video Schema
```js
{
  _id: ObjectId,
  title: String,
  description: String,
  videoUrl: String,
  thumbnailUrl: String,
  owner: ObjectId (ref: User),
  createdAt: Date
}
```

### Comment Schema
```js
{
  _id: ObjectId,
  videoId: ObjectId (ref: Video),
  userId: ObjectId (ref: User),
  text: String,
  createdAt: Date
}
```

### Like Schema
```js
{
  _id: ObjectId,
  videoId: ObjectId (ref: Video),
  userId: ObjectId (ref: User),
  createdAt: Date
}
```

### Playlist Schema
```js
{
  _id: ObjectId,
  name: String,
  userId: ObjectId (ref: User),
  videos: [ObjectId] (ref: Video),
  createdAt: Date
}
```

## Authentication & Authorization
- Users must register and log in to upload videos, comment, or like videos.
- JWT-based authentication is used for secure API access.
- Middleware ensures protected routes for logged-in users.

## Middleware
- `auth.middleware.js` – Verifies JWT tokens
- `error.middleware.js` – Handles errors

## Error Handling
- Centralized error handling middleware ensures proper error responses.
- Standardized error codes for authentication, validation, and database errors.

## Deployment
### Using Docker
1. Build the Docker image:
   ```sh
   docker build -t youtube-backend .
   ```
2. Run the container:
   ```sh
   docker run -p 5000:5000 youtube-backend
   ```

### Deployment to Vercel/Heroku
- Use `dotenv` for managing environment variables.
- Set up CI/CD for automatic deployments.

## Contributing
Feel free to submit issues and pull requests to improve the project.

## License
This project is licensed under the MIT License.

