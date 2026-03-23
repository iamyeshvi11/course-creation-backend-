# Course Management API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All course endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Course Endpoints

### 1. Create Course
Create a new course (Admin only).

**Endpoint:** `POST /api/courses`

**Access:** Private/Admin

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "title": "Cybersecurity Fundamentals",
  "description": "Learn the basics of cybersecurity, including threat detection, prevention, and best practices.",
  "riskLevel": "Medium",
  "passThreshold": 70,
  "modules": [
    {
      "title": "Introduction to Cybersecurity",
      "contentBlocks": [
        "What is cybersecurity?",
        "Common threats and vulnerabilities",
        "Security principles"
      ],
      "quiz": [
        {
          "question": "What is the primary goal of cybersecurity?",
          "options": [
            "To hack systems",
            "To protect systems from threats",
            "To create viruses",
            "To monitor users"
          ],
          "correctAnswer": 1,
          "explanation": "The primary goal is to protect systems, networks, and data from cyber threats."
        }
      ]
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "title": "Cybersecurity Fundamentals",
    "description": "Learn the basics of cybersecurity...",
    "riskLevel": "Medium",
    "passThreshold": 70,
    "createdBy": {
      "_id": "65f0987654321abcdef09876",
      "name": "John Admin",
      "email": "admin@example.com"
    },
    "modules": [...],
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:30:00.000Z",
    "moduleCount": 1,
    "totalQuestions": 1
  }
}
```

---

### 2. Get All Courses
Retrieve all courses with optional filtering and pagination.

**Endpoint:** `GET /api/courses`

**Access:** Private (All authenticated users)

**Query Parameters:**
- `riskLevel` (optional): Filter by risk level (Low, Medium, High)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `sortBy` (optional): Field to sort by (default: createdAt)
- `order` (optional): Sort order - asc or desc (default: desc)

**Example Request:**
```
GET /api/courses?riskLevel=Medium&page=1&limit=10&sortBy=createdAt&order=desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "totalPages": 3,
  "currentPage": 1,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "Cybersecurity Fundamentals",
      "description": "Learn the basics of cybersecurity...",
      "riskLevel": "Medium",
      "passThreshold": 70,
      "createdBy": {
        "_id": "65f0987654321abcdef09876",
        "name": "John Admin",
        "email": "admin@example.com"
      },
      "modules": [...],
      "moduleCount": 3,
      "totalQuestions": 15,
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-15T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Single Course
Retrieve a specific course by ID.

**Endpoint:** `GET /api/courses/:id`

**Access:** Private (All authenticated users)

**Example Request:**
```
GET /api/courses/65f1234567890abcdef12345
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "title": "Cybersecurity Fundamentals",
    "description": "Learn the basics of cybersecurity...",
    "riskLevel": "Medium",
    "passThreshold": 70,
    "createdBy": {
      "_id": "65f0987654321abcdef09876",
      "name": "John Admin",
      "email": "admin@example.com"
    },
    "modules": [
      {
        "_id": "65f1234567890abcdef12346",
        "title": "Introduction to Cybersecurity",
        "contentBlocks": [
          "What is cybersecurity?",
          "Common threats and vulnerabilities"
        ],
        "quiz": [
          {
            "_id": "65f1234567890abcdef12347",
            "question": "What is the primary goal of cybersecurity?",
            "options": [
              "To hack systems",
              "To protect systems from threats",
              "To create viruses",
              "To monitor users"
            ],
            "correctAnswer": 1,
            "explanation": "The primary goal is to protect systems..."
          }
        ]
      }
    ],
    "moduleCount": 1,
    "totalQuestions": 1,
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Course not found"
}
```

---

### 4. Update Course
Update an existing course (Admin only, creator or any admin).

**Endpoint:** `PUT /api/courses/:id`

**Access:** Private/Admin (Course creator or any admin)

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:** (All fields are optional - only send fields to update)
```json
{
  "title": "Advanced Cybersecurity",
  "description": "Updated description",
  "riskLevel": "High",
  "passThreshold": 80,
  "modules": [
    {
      "title": "Updated Module",
      "contentBlocks": ["New content"],
      "quiz": []
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "title": "Advanced Cybersecurity",
    "description": "Updated description",
    "riskLevel": "High",
    "passThreshold": 80,
    "createdBy": {
      "_id": "65f0987654321abcdef09876",
      "name": "John Admin",
      "email": "admin@example.com"
    },
    "modules": [...],
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T12:45:00.000Z"
  }
}
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Not authorized to update this course"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Course not found"
}
```

---

### 5. Delete Course
Delete a course (Admin only, creator or any admin).

**Endpoint:** `DELETE /api/courses/:id`

**Access:** Private/Admin (Course creator or any admin)

**Example Request:**
```
DELETE /api/courses/65f1234567890abcdef12345
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Not authorized to delete this course"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Course not found"
}
```

---

## Additional Course Endpoints

### 6. Get Courses by Risk Level
Get all courses filtered by a specific risk level.

**Endpoint:** `GET /api/courses/risk/:riskLevel`

**Access:** Private (All authenticated users)

**Parameters:**
- `riskLevel`: Must be one of: Low, Medium, High

**Example Request:**
```
GET /api/courses/risk/High
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "Advanced Security",
      "description": "High-level security course",
      "riskLevel": "High",
      "createdBy": {
        "_id": "65f0987654321abcdef09876",
        "name": "John Admin",
        "email": "admin@example.com"
      },
      "modules": [...],
      "createdAt": "2024-03-15T10:30:00.000Z"
    }
  ]
}
```

---

### 7. Get My Courses
Get all courses created by the current admin user.

**Endpoint:** `GET /api/courses/my-courses`

**Access:** Private/Admin

**Example Request:**
```
GET /api/courses/my-courses
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "My Course 1",
      "description": "Course I created",
      "riskLevel": "Medium",
      "createdBy": "65f0987654321abcdef09876",
      "modules": [...],
      "createdAt": "2024-03-15T10:30:00.000Z"
    }
  ]
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Course title is required",
    "Risk level must be Low, Medium, or High"
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "User role 'employee' is not authorized to access this route"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Course not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

## Data Models

### Course Schema
```javascript
{
  title: String (required, max 200 chars),
  description: String (required, max 2000 chars),
  riskLevel: String (required, enum: ['Low', 'Medium', 'High']),
  createdBy: ObjectId (required, ref: User),
  modules: [Module Schema],
  passThreshold: Number (required, 0-100, default: 70),
  createdAt: Date,
  updatedAt: Date
}
```

### Module Schema
```javascript
{
  title: String (required),
  contentBlocks: [String] (required),
  quiz: [Question Schema]
}
```

### Question Schema
```javascript
{
  question: String (required),
  options: [String] (required),
  correctAnswer: Number (required, min: 0),
  explanation: String (optional)
}
```

---

## Testing with cURL

### Create Course
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course",
    "description": "This is a test course",
    "riskLevel": "Low",
    "passThreshold": 70,
    "modules": []
  }'
```

### Get All Courses
```bash
curl -X GET http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Course
```bash
curl -X GET http://localhost:5000/api/courses/COURSE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Course
```bash
curl -X PUT http://localhost:5000/api/courses/COURSE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Course Title"
  }'
```

### Delete Course
```bash
curl -X DELETE http://localhost:5000/api/courses/COURSE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

1. **Authentication Required**: All endpoints require a valid JWT token
2. **Admin Access**: Create, Update, and Delete operations require admin role
3. **Pagination**: The Get All Courses endpoint supports pagination
4. **Filtering**: Courses can be filtered by risk level
5. **Validation**: All input data is validated before processing
6. **Error Handling**: Comprehensive error messages for debugging
7. **Timestamps**: All courses include createdAt and updatedAt timestamps
8. **Population**: Creator information is automatically populated in responses
