# Course Management API - Setup Guide

## 📋 Overview

This guide will help you set up and run the Course Management API for the Women Walnut Learning Management System.

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**
- **Git** (optional)

### 2. Installation Steps

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Update .env with your configuration
# Edit the .env file with your MongoDB URI and JWT secret

# Start the server
npm start

# OR for development with auto-reload
npm run dev
```

### 3. Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/womenwalnut
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=30d
```

## 📦 Dependencies

The following packages are required:

```json
{
  "express": "Web framework",
  "mongoose": "MongoDB ODM",
  "dotenv": "Environment variables",
  "cors": "Cross-origin resource sharing",
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT authentication",
  "express-validator": "Request validation"
}
```

## 🗂️ Project Structure

```
backend/
├── server.js                    # Main entry point
├── package.json                 # Dependencies
├── .env                         # Environment variables (create this)
├── .env.example                 # Environment template
├── models/
│   ├── Course.js               # Course data model
│   └── User.js                 # User data model
├── controllers/
│   ├── courseController.js     # Course business logic
│   └── authController.js       # Authentication logic
├── routes/
│   ├── courseRoutes.js         # Course API routes
│   ├── userRoutes.js           # User API routes
│   └── authRoutes.js           # Auth API routes
├── middleware/
│   ├── authMiddleware.js       # JWT verification
│   └── roleMiddleware.js       # Role-based access
├── config/
│   └── database.js             # MongoDB connection
├── test-course-api.js          # API test script
├── API_DOCUMENTATION.md        # Full API documentation
└── COURSE_API_SUMMARY.md       # Quick reference
```

## 🔧 Running the Server

### Start Production Server
```bash
npm start
```

### Start Development Server (with auto-reload)
```bash
npm run dev
```

Server will run on: `http://localhost:5000`

## 🧪 Testing the APIs

### Option 1: Using the Test Script
```bash
npm test
```

This will run automated tests for all course endpoints.

### Option 2: Using Postman/Thunder Client

1. Import the API endpoints from `API_DOCUMENTATION.md`
2. First register/login to get a JWT token
3. Add the token to Authorization header: `Bearer <your_token>`
4. Test the course endpoints

### Option 3: Using cURL

```bash
# Register admin user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "password123",
    "department": "IT",
    "role": "admin"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'

# Create course (replace YOUR_TOKEN with actual token)
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course",
    "description": "Test Description",
    "riskLevel": "Low"
  }'
```

## 📝 API Endpoints

### Course Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/courses` | Create course | Admin |
| GET | `/api/courses` | Get all courses | Private |
| GET | `/api/courses/:id` | Get single course | Private |
| PUT | `/api/courses/:id` | Update course | Admin |
| DELETE | `/api/courses/:id` | Delete course | Admin |
| GET | `/api/courses/risk/:level` | Get by risk level | Private |
| GET | `/api/courses/my-courses` | Get my courses | Admin |

See `API_DOCUMENTATION.md` for detailed request/response examples.

## 🔐 Authentication Flow

1. **Register** a new user (admin or employee)
2. **Login** to receive JWT token
3. **Include token** in all API requests: `Authorization: Bearer <token>`
4. Token expires based on `JWT_EXPIRE` setting (default: 30 days)

## 🛠️ Troubleshooting

### Server won't start
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Ensure port 5000 is not in use

### Authentication errors
- Verify JWT_SECRET is set in .env
- Check token format: `Bearer <token>`
- Ensure user has correct role (admin for CRUD operations)

### Database connection errors
- Verify MongoDB is running: `mongod --version`
- Check MONGODB_URI in .env
- Ensure database name is correct

### Validation errors
- Check request body matches schema
- Verify required fields are included
- Check data types match requirements

## 📚 Documentation Files

- **API_DOCUMENTATION.md** - Complete API reference with examples
- **COURSE_API_SUMMARY.md** - Quick reference guide
- **SETUP_GUIDE.md** - This file
- **README.md** - Project overview

## 🔄 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Start MongoDB
4. ✅ Run the server
5. ✅ Test authentication endpoints
6. ✅ Test course CRUD operations
7. Consider adding:
   - Course enrollment system
   - Progress tracking
   - Quiz submission and grading
   - File uploads for course materials

## 💡 Tips

- Use `npm run dev` during development for auto-reload
- Check server console for error messages
- Use the test script for quick API validation
- Review logs for debugging
- Keep JWT_SECRET secure in production

## 📞 Support

For issues or questions, refer to:
- API_DOCUMENTATION.md for API details
- Error messages in server console
- MongoDB logs for database issues

---

**Happy coding! 🚀**
