# 🎥 YouTube Backend API

A comprehensive backend API for a YouTube-like video sharing platform built with Node.js, Express.js, and MongoDB. This project provides a complete set of features including user authentication, video management, social interactions, and advanced search capabilities.

## Postman Documentation
https://documenter.getpostman.com/view/38573702/2sB2qgdy9v

## 📋 Table of Contents

- [🎥 YouTube Backend API](#-youtube-backend-api)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🛠️ Technology Stack](#️-technology-stack)
  - [📁 Project Structure](#-project-structure)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
  - [📖 API Documentation](#-api-documentation)
    - [Authentication Endpoints](#authentication-endpoints)
    - [User Management](#user-management)
    - [Video Management](#video-management)
    - [Comment System](#comment-system)
    - [Like System](#like-system)
    - [Playlist Management](#playlist-management)
  - [🗄️ Database Schema](#️-database-schema)
  - [🔐 Authentication & Authorization](#-authentication--authorization)
  - [📤 File Upload & Storage](#-file-upload--storage)
  - [🔍 Search Functionality](#-search-functionality)
  - [🛡️ Security Features](#️-security-features)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)
  - [👥 Authors](#-authors)
  - [🙏 Acknowledgments](#-acknowledgments)

## ✨ Features

### 🔐 User Management
- **User Registration & Authentication** - Secure signup/login with JWT tokens
- **Profile Management** - Update profile information, avatar, and cover images
- **Password Management** - Change passwords securely
- **Account Deletion** - Complete account removal with cleanup
- **Channel Profiles** - Public channel pages with subscriber counts
- **Watch History** - Track and retrieve user's viewing history

### 🎬 Video Management
- **Video Upload** - Support for multiple video formats with automatic processing
- **Thumbnail Management** - Custom thumbnail upload and management
- **Video Metadata** - Title, description, category, and tags
- **Video Privacy** - Toggle publish/unpublish status
- **Video Streaming** - HLS (HTTP Live Streaming) support for adaptive bitrate
- **View Tracking** - Automatic view count increment
- **Video Search** - Advanced search with MongoDB Atlas Search

### 💬 Social Features
- **Comment System** - Hierarchical comments with replies
- **Like System** - Like/unlike videos and comments
- **Playlist Management** - Create, update, and manage video playlists
- **Subscription System** - Subscribe to channels (schema ready)

### 🔍 Advanced Search
- **Full-Text Search** - Search across video titles, descriptions, categories, and tags
- **Autocomplete** - Real-time search suggestions with fuzzy matching
- **Filtering** - Filter by category, tags, and other criteria
- **Sorting** - Sort results by relevance, date, views, etc.

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **Password Hashing**: bcrypt

### Security & Performance
- **Security Headers**: Helmet.js
- **CORS**: Cross-Origin Resource Sharing
- **Rate Limiting**: Express Rate Limit
- **Input Validation**: Custom validation middleware

### Development Tools
- **Environment Management**: dotenv
- **File System**: Node.js fs module
- **Pagination**: mongoose-aggregate-paginate-v2

## 📁 Project Structure

\`\`\`
youtube-backend/
├── src/
│   ├── controllers/          # Request handlers and business logic
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── comment.controller.js
│   │   ├── like.controller.js
│   │   └── playlist.controller.js
│   ├── middlewares/          # Custom middleware functions
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   ├── models/               # Mongoose data models
│   │   ├── user.model.js
│   │   ├── videos.model.js
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── playlist.model.js
│   │   ├── subscriptions.model.js
│   │   └── tweet.model.js
│   ├── routes/               # API route definitions
│   │   ├── user.routes.js
│   │   ├── video.routes.js
│   │   ├── comment.routes.js
│   │   ├── like.routes.js
│   │   └── playlist.routes.js
│   ├── utils/                # Utility functions and helpers
│   │   ├── apiError.js
│   │   ├── apiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   ├── db/                   # Database connection
│   │   └── index.js
│   ├── app.js                # Express app configuration
│   ├── index.js              # Server entry point
│   └── constant.js           # Application constants
├── public/
│   └── temp/                 # Temporary file storage
├── .env                      # Environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Project dependencies
└── README.md               # Project documentation
\`\`\`

## 🚀 Getting Started

### Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MongoDB** (v4.0.0 or higher)
- **Cloudinary Account** (for file storage)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/mdriyad45/youtube-backend.git
   cd youtube-backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Create required directories**
   \`\`\`bash
   mkdir -p public/temp
   \`\`\`

4. **Set up environment variables** (see [Environment Variables](#environment-variables))

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

The server will start on `http://localhost:4000` (or your specified PORT).

### Environment Variables

Create a `.env` file in the root directory with the following variables:

\`\`\`env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017
DB_NAME=youtubeBackend

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
\`\`\`

**Security Note**: Never commit your `.env` file to version control. Use strong, unique secrets for production.

## 📖 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/user/register` | Register a new user | ❌ |
| POST | `/api/v1/user/login` | User login | ❌ |
| GET | `/api/v1/user/logout` | User logout | ✅ |
| GET | `/api/v1/user/refresh-token` | Refresh access token | ✅ |

### User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/user/getUser` | Get current user profile | ✅ |
| PATCH | `/api/v1/user/update-account` | Update account details | ✅ |
| POST | `/api/v1/user/forget-password` | Change password | ✅ |
| PATCH | `/api/v1/user/update-avatar` | Update user avatar | ✅ |
| PATCH | `/api/v1/user/update-coverImage` | Update cover image | ✅ |
| GET | `/api/v1/user/channel/:username` | Get channel profile | ✅ |
| GET | `/api/v1/user/watch-history` | Get watch history | ✅ |

### Video Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/video/` | Search videos | ✅ |
| POST | `/api/v1/video/upload-video` | Upload a new video | ✅ |
| GET | `/api/v1/video/:_id` | Get video by ID | ✅ |
| PUT | `/api/v1/video/update-video/:_id` | Update video details | ✅ |
| GET | `/api/v1/video/delete-video/:_id` | Delete video | ✅ |
| PATCH | `/api/v1/video/:_id/toggle-publish` | Toggle publish status | ✅ |

### Comment System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/comment/:_videoId` | Add comment to video | ✅ |
| GET | `/api/v1/comment/:videoId` | Get video comments | ❌ |
| PATCH | `/api/v1/comment/update-comment/:_commentId` | Update comment | ✅ |
| DELETE | `/api/v1/comment/:_commentId` | Delete comment | ✅ |
| POST | `/api/v1/comment/reply-comment/:_parentCommentId` | Reply to comment | ✅ |
| PATCH | `/api/v1/comment/reply/:_replyId` | Update reply | ✅ |
| DELETE | `/api/v1/comment/reply/:_replyId` | Delete reply | ✅ |

### Like System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/like/video/:_videoId` | Toggle video like | ✅ |
| POST | `/api/v1/like/comment/:_commentId` | Toggle comment like | ✅ |
| GET | `/api/v1/like/videos` | Get liked videos | ✅ |

### Playlist Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/playlist/create-playlist` | Create new playlist | ✅ |
| GET | `/api/v1/playlist/:_playlistId` | Get playlist by ID | ✅ |
| POST | `/api/v1/playlist/update-playlist/:_playlistId` | Update playlist | ✅ |
| DELETE | `/api/v1/playlist/delete-playlist/:_playlistId` | Delete playlist | ✅ |
| PATCH | `/api/v1/playlist/add-video/:videoId/:playlistId` | Add video to playlist | ✅ |
| GET | `/api/v1/playlist/@:_userId/playlist` | Get user playlists | ✅ |

## 🗄️ Database Schema

### User Model
\`\`\`javascript
{
  username: String (unique, indexed),
  email: String (unique),
  fullname: String (indexed),
  avatar: String (required),
  coverImage: String,
  watchHistory: [ObjectId] (ref: Video),
  password: String (hashed),
  refreshToken: String,
  timestamps: true
}
\`\`\`

### Video Model
\`\`\`javascript
{
  videoFile: {
    secure_url: String,
    hls_url: String,
    public_id: String
  },
  thumbnailFile: {
    secure_url: String,
    public_id: String
  },
  title: String (required),
  description: String (required),
  category: [String],
  tags: [String],
  duration: Number (required),
  views: Number (default: 0),
  isPublished: Boolean (default: true),
  owner: ObjectId (ref: User),
  timestamps: true
}
\`\`\`

### Comment Model
\`\`\`javascript
{
  content: String (required),
  video: ObjectId (ref: Video),
  owner: ObjectId (ref: User),
  parentComment: ObjectId (ref: Comment),
  replies: [ObjectId] (ref: Comment),
  timestamps: true
}
\`\`\`

## 🔐 Authentication & Authorization

This API uses **JWT (JSON Web Tokens)** for authentication:

- **Access Tokens**: Short-lived tokens (1 day) for API access
- **Refresh Tokens**: Long-lived tokens (10 days) for token renewal
- **Secure Cookies**: Tokens stored in HTTP-only cookies
- **Password Hashing**: bcrypt with salt rounds for secure password storage

### Protected Routes
Most endpoints require authentication. Include the access token in:
- **Cookie**: `accessToken` (automatic)
- **Header**: `Authorization: Bearer <token>`

## 📤 File Upload & Storage

### Cloudinary Integration
- **Video Files**: Uploaded to `videos/` folder with HLS streaming support
- **Images**: Uploaded to `avatarImages/` and `coverImages/` folders
- **Automatic Optimization**: Quality and format optimization
- **Secure URLs**: All files served via HTTPS

### File Processing
- **Video Processing**: Automatic HLS generation for adaptive streaming
- **Image Optimization**: Automatic format conversion and compression
- **Cleanup**: Temporary files automatically removed after upload

## 🔍 Search Functionality

### MongoDB Atlas Search
- **Full-Text Search**: Search across video metadata
- **Autocomplete**: Real-time suggestions with fuzzy matching
- **Filtering**: Category, tags, and custom filters
- **Sorting**: Multiple sorting options (relevance, date, views)

### Search Parameters
\`\`\`javascript
{
  query: "search term",
  autocomplete: true/false,
  category: "category name",
  tags: "tag1,tag2",
  sortBy: "createdAt|views|relevance",
  limit: 10,
  skip: 0
}
\`\`\`

## 🛡️ Security Features

- **Helmet.js**: Security headers protection
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive request validation
- **JWT Security**: Secure token generation and validation
- **Password Security**: bcrypt hashing with salt
- **File Upload Security**: Type and size validation


### Environment Setup
1. Set up MongoDB Atlas or local MongoDB instance
2. Configure Cloudinary account and API keys
3. Set strong JWT secrets
4. Configure CORS origins for your frontend
5. Set up SSL certificates for HTTPS

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   \`\`\`bash
   git checkout -b feature/amazing-feature
   \`\`\`
3. **Commit your changes**
   \`\`\`bash
   git commit -m 'Add some amazing feature'
   \`\`\`
4. **Push to the branch**
   \`\`\`bash
   git push origin feature/amazing-feature
   \`\`\`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/mdriyad45)

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- MongoDB team for the powerful database
- Cloudinary for reliable file storage and processing
- All contributors who helped improve this project

---

**⭐ Star this repository if you found it helpful!**

For questions or support, please open an issue or contact [jakariyakabirriyad@gmail.com](mailto:your-email@example.com).
