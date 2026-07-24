<div align="center">
  <img src="./frontend/public/vite.svg" alt="MojMasti Logo" width="120" />
  <h1>MojMasti 🚀</h1>
  <p><strong>A Modern, Full-Stack Social Media Platform built with the MERN Stack</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

## 📖 Overview

**MojMasti** is a feature-rich, mobile-first social networking application. It seamlessly brings together modern social media functionalities, including post sharing, story updates, and profile management, all wrapped in a premium, glass-morphism user interface. 

Built on the MERN stack, MojMasti provides a highly responsive, Instagram-like experience across all devices.

## ✨ Key Features

- **📱 Mobile-First Premium UI**: Beautiful, fully responsive layout utilizing Tailwind CSS, Shadcn UI components, and smooth micro-animations.
- **🔐 Secure Authentication**: JWT-based authentication with Bcrypt password hashing.
- **📝 Post Management**: Create posts (images/videos) with Cloudinary integration, like, comment, and share.
- **📚 Interactive Stories**: Upload and view 24-hour stories with automatic expiration and view tracking.
- **🔖 Save & Explore**: Bookmark posts to your private "Saved" tab, and discover new content on the Explore feed.
- **👤 Dynamic Profiles**: Manage your bio, avatar, followers, following lists, and view your liked/saved posts in organized grids.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS, Shadcn UI, Custom CSS (Glass-morphism)
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v6
- **Icons**: Lucide React, React Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **File Storage**: Cloudinary, Multer
- **Security**: JSON Web Tokens (JWT), Bcrypt, Cookie Parser

---

## 🚀 Getting Started

Follow these steps to set up MojMasti locally for development.

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB Database (Local or MongoDB Atlas)
- Cloudinary Account (for image/video storage)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/MojMasti.git
cd MojMasti
```

### 3. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a .env file based on environment variables below
touch .env

# Start the development server
npm run dev
```

**Backend Environment Variables (`backend/.env`)**:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Frontend Setup
```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

**Frontend Environment Variables (`frontend/.env`)**:
```env
VITE_API_URL=http://localhost:8000
```

---

## 📂 Project Structure

```text
MojMasti/
├── backend/                  # Express.js Server
│   ├── controllers/          # Business logic for routes
│   ├── middlewares/          # JWT Auth & Multer setup
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express API endpoints
│   └── utils/                # Helper functions (Cloudinary, etc.)
│
└── frontend/                 # React UI Client
    ├── src/
    │   ├── components/       # Reusable React components (Post, Stories, etc.)
    │   ├── config/           # API Endpoint configurations
    │   ├── hooks/            # Custom React hooks (Data fetching)
    │   ├── redux/            # Redux store slices (Auth, Posts)
    │   └── utils/            # Frontend helper functions
```

---

## 🎨 UI/UX Design Philosophy
MojMasti departs from generic flat designs by incorporating:
- **Glass-morphism**: Semi-transparent, blurred backgrounds for overlays and sidebars.
- **Vibrant Gradients**: Carefully curated HSL color palettes that feel premium and inviting.
- **Fluid Layouts**: Edge-to-edge content on mobile, smoothly transitioning to a multi-column layout on desktop.

---

## 📄 License
This project is licensed under the MIT License.

<div align="center">
  <p>Made with ❤️ for connection.</p>
  <p>© 2024 MojMasti</p>
</div>