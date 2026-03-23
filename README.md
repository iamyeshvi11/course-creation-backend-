# Node.js + Express Backend with MongoDB

A complete backend API with user authentication, JWT tokens, and role-based access control.

## Features

- ✅ User Registration & Login
- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Role-based Access Control (Admin/Employee)
- ✅ MongoDB Integration
- ✅ Input Validation
- ✅ Error Handling
- ✅ RESTful API Design

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   └── roleMiddleware.js    # Role-based access control
├── models/
│   └── User.js              # User schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   └── userRoutes.js        # User management endpoints
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── server.js                # Entry point
└── README.md
```

## Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables in .env:**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/your_database_name
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system.

5. **Run the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee",
  "department": "IT"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### User Management Routes (Admin Only)

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "admin",
  "department": "HR"
}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

## User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['admin', 'employee'], default: 'employee'),
  department: String (required),
  timestamps: true
}
```

## Authentication Flow

1. **Register:** User creates an account with name, email, password, role, and department
2. **Login:** User logs in with email and password
3. **Token:** Server returns JWT token
4. **Protected Routes:** Include token in Authorization header: `Bearer <token>`

## Role-Based Access Control

- **Employee:** Can access protected routes with valid token
- **Admin:** Can access admin-only routes (user management)

### Example Usage

```javascript
// Protect route (requires authentication)
router.get('/profile', protect, getProfile);

// Admin only route
router.get('/users', protect, authorize('admin'), getAllUsers);

// Multiple roles
router.get('/reports', protect, authorize('admin', 'manager'), getReports);
```

## Security Features

- Password hashing using bcryptjs
- JWT token-based authentication
- Role-based authorization
- Input validation using express-validator
- MongoDB injection prevention
- CORS enabled

## Error Handling

API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (in development)"
}
```

## Dependencies

- **express:** Web framework
- **mongoose:** MongoDB ODM
- **bcryptjs:** Password hashing
- **jsonwebtoken:** JWT authentication
- **dotenv:** Environment variables
- **cors:** Cross-origin resource sharing
- **express-validator:** Input validation

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"admin","department":"IT"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get current user (replace <TOKEN> with actual token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"

# Get all users (admin only)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <TOKEN>"
```

## License

ISC
