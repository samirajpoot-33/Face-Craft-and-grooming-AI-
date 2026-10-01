# FaceCraft & Grooming AI - Backend API

Complete backend implementation for FaceCraft & Grooming AI Final Year Project.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [API Endpoints](#api-endpoints)
6. [Database Setup](#database-setup)
7. [Frontend Integration](#frontend-integration)
8. [Future ML Integration](#future-ml-integration)

---

## 🎯 Project Overview

This backend provides RESTful API endpoints for:
- User authentication (register, login, JWT)
- Face shape analysis with image upload
- User profile management
- Analysis history tracking

---

## 🛠 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database (via XAMPP)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **mysql2** - MySQL driver with connection pooling

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MySQL connection & pooling
│   ├── controllers/
│   │   ├── authController.js    # Register, login, profile
│   │   └── faceAnalysisController.js  # Face analysis logic
│   ├── middleware/
│   │   ├── auth.js              # JWT token verification
│   │   └── upload.js            # Multer file upload config
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   └── faceAnalysisRoutes.js # Face analysis endpoints
│   ├── uploads/                 # Uploaded images (gitignored)
│   ├── app.js                   # Express app configuration
│   └── server.js                # Server entry point
├── database/
│   └── schema.sql               # Database schema
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

### Folder Explanations

- **config/** - Configuration files (database connection, etc.)
- **controllers/** - Business logic (what happens when API is called)
- **middleware/** - Functions that run before routes (auth, file upload)
- **routes/** - API endpoint definitions
- **uploads/** - User uploaded images (created automatically)

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` file with your settings:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # Your XAMPP MySQL password (usually empty)
DB_NAME=facecraft_db
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
FRONTEND_URL=http://localhost:5173
```

### Step 3: Setup MySQL Database

1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Import `database/schema.sql` or run it manually
4. Database `facecraft_db` will be created with tables

### Step 4: Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:5000`

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe"
  }
}
```

#### 2. Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### 3. Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Face Analysis Endpoints

#### 1. Analyze Face (Protected)
```http
POST /api/face-analysis/analyze
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
  image: <file>
```

**Response:**
```json
{
  "success": true,
  "message": "Face analysis completed",
  "data": {
    "id": 1,
    "face_shape": "Oval",
    "confidence_score": 92.45,
    "image_path": "src/uploads/face-1234567890-123456789.jpg",
    "analysis_date": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Get Analysis History (Protected)
```http
GET /api/face-analysis/history
Authorization: Bearer <token>
```

#### 3. Get Analysis by ID (Protected)
```http
GET /api/face-analysis/:id
Authorization: Bearer <token>
```

---

## 🗄 Database Setup

### Tables Created

1. **users** - User accounts
   - id, username, email, password (hashed), full_name, timestamps

2. **face_analysis** - Face analysis results
   - id, user_id, image_path, face_shape, confidence_score, analysis_date

### Relationships

- One user can have many face analyses (1-to-many)
- Foreign key: `face_analysis.user_id` → `users.id`
- Cascade delete: Deleting user deletes all their analyses

---

## 🔗 Frontend Integration Guide

### Step 1: Store JWT Token

After login/register, store the token:

```javascript
// In your Login/Register component
const handleLogin = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to dashboard
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

### Step 2: Create API Utility

Create `src/utils/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make authenticated requests
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response.json();
};

// Register user
export const registerUser = async (userData) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Login user
export const loginUser = async (email, password) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

// Upload image and analyze face
export const analyzeFace = async (imageFile) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE_URL}/face-analysis/analyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};

// Get analysis history
export const getAnalysisHistory = async () => {
  return apiRequest('/face-analysis/history');
};
```

### Step 3: Use in Components

**In FaceShapeDetector.jsx:**

```javascript
import { analyzeFace } from '../utils/api';

const handleImageUpload = async (file) => {
  try {
    const result = await analyzeFace(file);
    
    if (result.success) {
      setFaceShape(result.data.face_shape);
      setConfidence(result.data.confidence_score);
    }
  } catch (error) {
    console.error('Analysis error:', error);
  }
};
```

### Step 4: Protected Routes

Create a ProtectedRoute component:

```javascript
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

Use it in your routes:

```javascript
<Route 
  path="/face-analyzer" 
  element={
    <ProtectedRoute>
      <FaceShapeDetector />
    </ProtectedRoute>
  } 
/>
```

---

## 🤖 Future Machine Learning Integration

### Why Python for ML?

1. **Rich ML Libraries**: TensorFlow, PyTorch, OpenCV, scikit-learn
2. **Face Detection**: Better support for face detection libraries
3. **Performance**: Optimized for numerical computations
4. **Ecosystem**: Mature ML/AI ecosystem

### Architecture: Microservices

```
┌─────────────┐         HTTP/REST         ┌─────────────┐
│             │ ─────────────────────────> │             │
│ Node.js API │                           │ Python ML   │
│  (Express)  │ <──────────────────────── │   Service   │
│             │      JSON Response        │  (Flask)    │
└─────────────┘                           └─────────────┘
     │                                          │
     │                                          │
     ▼                                          ▼
┌─────────────┐                         ┌─────────────┐
│   MySQL     │                         │   Models    │
│  Database   │                         │  (Saved)    │
└─────────────┘                         └─────────────┘
```

### How It Will Work

1. **User uploads image** → Node.js backend receives it
2. **Node.js sends image** → Python ML service (via HTTP POST)
3. **Python processes image** → Runs face detection model
4. **Python returns result** → JSON with face shape + confidence
5. **Node.js saves to DB** → Stores result in MySQL
6. **Node.js responds** → Returns result to frontend

### Example Python Service (Future)

```python
# Python Flask API (to be created later)
from flask import Flask, request, jsonify
import cv2
import numpy as np

app = Flask(__name__)

@app.route('/predict-face-shape', methods=['POST'])
def predict_face_shape():
    # Receive image from Node.js
    image_file = request.files['image']
    
    # Process with ML model
    face_shape = detect_face_shape(image_file)
    confidence = calculate_confidence()
    
    return jsonify({
        'face_shape': face_shape,
        'confidence_score': confidence
    })
```

### Node.js Integration (Future)

In `faceAnalysisController.js`, replace dummy data with:

```javascript
// Call Python ML service
const pythonResponse = await fetch('http://localhost:8000/predict-face-shape', {
    method: 'POST',
    body: formData, // Image file
});

const mlResult = await pythonResponse.json();
// Use mlResult.face_shape and mlResult.confidence_score
```

---

## 🔒 Security Notes

1. **JWT Secret**: Change `JWT_SECRET` in production
2. **Password Hashing**: Always use bcrypt (already implemented)
3. **File Upload**: Validate file types and sizes (already implemented)
4. **CORS**: Configure allowed origins in production
5. **Environment Variables**: Never commit `.env` file

---

## 📝 Testing the API

### Using Postman/Thunder Client

1. **Register User**: POST `/api/auth/register`
2. **Login**: POST `/api/auth/login` → Copy token
3. **Analyze Face**: POST `/api/face-analysis/analyze`
   - Headers: `Authorization: Bearer <token>`
   - Body: form-data, key: `image`, type: File

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Analyze (replace TOKEN with actual token)
curl -X POST http://localhost:5000/api/face-analysis/analyze \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@/path/to/image.jpg"
```

---

## 🐛 Troubleshooting

### Database Connection Error
- Check XAMPP MySQL is running
- Verify credentials in `.env`
- Ensure database exists: `CREATE DATABASE facecraft_db;`

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process: `npx kill-port 5000`

### File Upload Error
- Check `src/uploads/` folder exists
- Verify file size < 5MB
- Ensure file is an image (jpg, png, etc.)

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [JWT.io](https://jwt.io/) - JWT token decoder
- [Multer Documentation](https://github.com/expressjs/multer)

---

## 📄 License

Academic Project - Final Year Project

---

**Built with ❤️ for FaceCraft & Grooming AI**
