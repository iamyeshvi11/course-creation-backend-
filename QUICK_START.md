# Quick Start Guide

## ✅ Your Server is Running!

```
Server: http://localhost:5000
Status: ✅ RUNNING
MongoDB: ✅ CONNECTED
```

---

## 🚀 Quick Commands

### Start Server
```bash
cd d:\Womenwalnut\backend
node server.js
```

### Check if Running
```bash
curl http://localhost:5000
```

### Stop Server
```bash
# Find the process
netstat -ano | findstr :5000

# Kill it
taskkill /F /PID <PID>
```

---

## 🔑 Test Authentication

### 1. Register Admin
```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Admin\",\"email\":\"admin@test.com\",\"password\":\"password123\",\"department\":\"IT\",\"role\":\"admin\"}"
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@test.com\",\"password\":\"password123\"}"
```

Save the token!

---

## 📚 Test Course APIs

### Create Course
```bash
curl -X POST http://localhost:5000/api/courses ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Test Course\",\"description\":\"Test\",\"riskLevel\":\"Low\"}"
```

### Get All Courses
```bash
curl http://localhost:5000/api/courses -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Course
```bash
curl http://localhost:5000/api/courses/COURSE_ID -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Course
```bash
curl -X PUT http://localhost:5000/api/courses/COURSE_ID ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Updated Title\"}"
```

### Delete Course
```bash
curl -X DELETE http://localhost:5000/api/courses/COURSE_ID ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 Important Files

```
backend/
├── server.js                # Main server file
├── .env                     # Your configuration
├── config/
│   └── database.js         # DB connection
├── middleware/
│   ├── authMiddleware.js   # JWT auth
│   └── roleMiddleware.js   # Roles
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── courseRoutes.js     # Course endpoints
│   └── userRoutes.js       # User endpoints
└── models/
    ├── User.js             # User schema
    └── Course.js           # Course schema
```

---

## 🔧 Common Issues

### Port 5000 in use
```bash
netstat -ano | findstr :5000
taskkill /F /PID <PID>
```

### MongoDB not connected
```bash
# Check MongoDB
tasklist | findstr mongod

# Start MongoDB
net start MongoDB
```

### Module not found
```bash
npm install
```

---

## 📖 Full Documentation

- **SETUP_COMPLETE.md** - Setup summary and fixes
- **API_DOCUMENTATION.md** - All API endpoints with examples
- **COURSE_API_SUMMARY.md** - Course API reference
- **FIX_NODE_VERSION.md** - Node.js version issues

---

## ✨ What's Working

✅ Server running on port 5000
✅ MongoDB connected
✅ Authentication (register/login)
✅ Course CRUD APIs
✅ User management
✅ Reports
✅ JWT protection
✅ Role-based access

---

## 🎯 Next Steps

1. Test authentication endpoints
2. Create courses
3. Test all CRUD operations
4. Build frontend
5. Deploy!

---

**Server URL:** http://localhost:5000
**API Base:** http://localhost:5000/api
