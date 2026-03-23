# Course API Quick Reference

## API Endpoints Summary

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/courses` | Admin | Create a new course |
| GET | `/api/courses` | Private | Get all courses (with filters & pagination) |
| GET | `/api/courses/:id` | Private | Get single course by ID |
| PUT | `/api/courses/:id` | Admin | Update a course |
| DELETE | `/api/courses/:id` | Admin | Delete a course |
| GET | `/api/courses/risk/:riskLevel` | Private | Get courses by risk level |
| GET | `/api/courses/my-courses` | Admin | Get courses created by current admin |

## Quick Start

### 1. Prerequisites
- Node.js installed
- MongoDB running
- Environment variables configured (.env file)

### 2. Required Environment Variables
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/womenwalnut
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

### 3. Installation
```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken express-validator
```

### 4. Start Server
```bash
node server.js
```

## API Usage Examples

### Create Course (POST /api/courses)
```javascript
// Request
{
  "title": "Cybersecurity Basics",
  "description": "Introduction to cybersecurity",
  "riskLevel": "Low",
  "passThreshold": 70,
  "modules": [
    {
      "title": "Module 1",
      "contentBlocks": ["Content 1", "Content 2"],
      "quiz": [
        {
          "question": "What is cybersecurity?",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": 1,
          "explanation": "Explanation here"
        }
      ]
    }
  ]
}

// Response (201)
{
  "success": true,
  "message": "Course created successfully",
  "data": { /* course object */ }
}
```

### Get All Courses (GET /api/courses)
```javascript
// Request with query params
GET /api/courses?riskLevel=Medium&page=1&limit=10&sortBy=createdAt&order=desc

// Response (200)
{
  "success": true,
  "count": 10,
  "total": 25,
  "totalPages": 3,
  "currentPage": 1,
  "data": [ /* array of courses */ ]
}
```

### Get Single Course (GET /api/courses/:id)
```javascript
// Request
GET /api/courses/65f1234567890abcdef12345

// Response (200)
{
  "success": true,
  "data": { /* course object with full details */ }
}
```

### Update Course (PUT /api/courses/:id)
```javascript
// Request (partial update)
{
  "title": "Updated Title",
  "riskLevel": "High"
}

// Response (200)
{
  "success": true,
  "message": "Course updated successfully",
  "data": { /* updated course object */ }
}
```

### Delete Course (DELETE /api/courses/:id)
```javascript
// Request
DELETE /api/courses/65f1234567890abcdef12345

// Response (200)
{
  "success": true,
  "message": "Course deleted successfully"
}
```

## File Structure

```
backend/
├── server.js                           # Main server file
├── models/
│   ├── Course.js                       # Course model schema
│   └── User.js                         # User model schema
├── controllers/
│   ├── courseController.js             # Course CRUD operations
│   └── authController.js               # Authentication logic
├── routes/
│   ├── courseRoutes.js                 # Course route definitions
│   ├── userRoutes.js                   # User routes
│   └── authRoutes.js                   # Auth routes
├── middleware/
│   ├── authMiddleware.js               # JWT authentication
│   └── roleMiddleware.js               # Role-based authorization
├── config/
│   └── database.js                     # MongoDB connection
└── .env                                # Environment variables
```

## Features Implemented

✅ **Create Course** - Admins can create courses with modules and quizzes
✅ **Get All Courses** - Retrieve courses with filtering and pagination
✅ **Get Single Course** - View complete course details
✅ **Update Course** - Modify existing courses (creator or admin)
✅ **Delete Course** - Remove courses (creator or admin)
✅ **Filter by Risk Level** - Get courses by Low/Medium/High risk
✅ **Get My Courses** - Admins see their created courses
✅ **Authentication & Authorization** - JWT-based security
✅ **Input Validation** - Request body validation
✅ **Error Handling** - Comprehensive error responses
✅ **Pagination** - Efficient data retrieval
✅ **Population** - Auto-populate creator details

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control (Admin/Employee)
- Authorization checks for update/delete
- Input validation and sanitization
- Protected routes

## Response Format

All responses follow this structure:

```javascript
// Success Response
{
  "success": true,
  "message": "Optional message",
  "data": { /* response data */ }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (optional)"
}
```

## Status Codes

- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (No token or invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource doesn't exist)
- `500` - Server Error (Internal errors)

## Authentication Flow

1. **Register/Login** → Get JWT token
2. **Include token in headers** → `Authorization: Bearer <token>`
3. **Access protected routes** → Token is validated
4. **Role checked** → Admin vs Employee permissions

## Testing Tips

1. First register/login to get a JWT token
2. Use the token in Authorization header for all requests
3. Admin role required for create/update/delete operations
4. Use Postman, Thunder Client, or cURL for testing
5. Check API_DOCUMENTATION.md for detailed examples

## Common Issues & Solutions

**Issue:** "Not authorized, no token"
- **Solution:** Include `Authorization: Bearer <token>` header

**Issue:** "User role 'employee' is not authorized"
- **Solution:** Use admin account for course management

**Issue:** "Course not found"
- **Solution:** Verify course ID exists in database

**Issue:** "Validation error"
- **Solution:** Check request body matches required schema

## Next Steps

1. ✅ Course CRUD APIs completed
2. Consider adding: Enrollment system, Progress tracking, Quiz submissions
3. Add file upload for course materials
4. Implement course search functionality
5. Add course categories/tags
6. Create dashboard analytics

---

For detailed documentation, see `API_DOCUMENTATION.md`
