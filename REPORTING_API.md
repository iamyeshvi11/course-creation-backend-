# Reporting APIs Documentation

## Overview
Comprehensive reporting APIs for training course management system with detailed analytics and statistics.

---

## API Endpoints

### 1. Overview Statistics

**Endpoint:** `GET /api/reports/overview`  
**Access:** Admin only  
**Description:** Get overall system statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCourses": 25,
    "totalEmployees": 150,
    "totalAssignments": 500,
    "completedAssignments": 350,
    "inProgressAssignments": 100,
    "failedAssignments": 30,
    "overdueAssignments": 20,
    "overdueEmployees": 15,
    "completionPercentage": 70,
    "averageScore": 82
  }
}
```

**Fields:**
- `totalCourses`: Total number of courses in the system
- `totalEmployees`: Total number of employees (role: 'employee')
- `totalAssignments`: Total course assignments
- `completedAssignments`: Successfully completed assignments
- `inProgressAssignments`: Assignments currently in progress
- `failedAssignments`: Failed assignments (can retry)
- `overdueAssignments`: Assignments past deadline (not completed)
- `overdueEmployees`: Unique count of employees with overdue assignments
- `completionPercentage`: Overall completion rate (completed/total * 100)
- `averageScore`: Average score across all completed assignments

---

### 2. Department-wise Statistics

**Endpoint:** `GET /api/reports/department-stats`  
**Access:** Admin only  
**Description:** Get completion statistics grouped by department

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "department": "Engineering",
      "totalAssignments": 120,
      "completedAssignments": 95,
      "inProgressAssignments": 15,
      "failedAssignments": 5,
      "overdueAssignments": 5,
      "completionPercentage": 79.17,
      "averageScore": 85.5,
      "totalEmployees": 30
    },
    {
      "department": "Sales",
      "totalAssignments": 80,
      "completedAssignments": 65,
      "inProgressAssignments": 10,
      "failedAssignments": 3,
      "overdueAssignments": 2,
      "completionPercentage": 81.25,
      "averageScore": 78.2,
      "totalEmployees": 20
    }
  ]
}
```

**Fields:**
- `department`: Department name
- `totalAssignments`: Total assignments for this department
- `completedAssignments`: Completed count
- `inProgressAssignments`: In progress count
- `failedAssignments`: Failed count
- `overdueAssignments`: Overdue count
- `completionPercentage`: Completion rate for this department
- `averageScore`: Average score for completed assignments
- `totalEmployees`: Number of unique employees in this department

**Sort Order:** Descending by completion percentage

---

### 3. Risk-Level Compliance Statistics

**Endpoint:** `GET /api/reports/risk-compliance`  
**Access:** Admin only  
**Description:** Get compliance statistics grouped by course risk level

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "riskLevel": "Low",
      "totalAssignments": 150,
      "completedAssignments": 130,
      "inProgressAssignments": 15,
      "failedAssignments": 3,
      "assignedAssignments": 2,
      "overdueAssignments": 5,
      "complianceRate": 86.67,
      "averageScore": 88.5,
      "totalCourses": 8,
      "totalEmployees": 75
    },
    {
      "riskLevel": "Medium",
      "totalAssignments": 200,
      "completedAssignments": 150,
      "inProgressAssignments": 30,
      "failedAssignments": 10,
      "assignedAssignments": 10,
      "overdueAssignments": 8,
      "complianceRate": 75.0,
      "averageScore": 82.3,
      "totalCourses": 10,
      "totalEmployees": 90
    },
    {
      "riskLevel": "High",
      "totalAssignments": 150,
      "completedAssignments": 70,
      "inProgressAssignments": 55,
      "failedAssignments": 17,
      "assignedAssignments": 8,
      "overdueAssignments": 12,
      "complianceRate": 46.67,
      "averageScore": 76.8,
      "totalCourses": 7,
      "totalEmployees": 80
    }
  ]
}
```

**Fields:**
- `riskLevel`: Low, Medium, or High
- `totalAssignments`: Total assignments for this risk level
- `completedAssignments`: Completed count
- `inProgressAssignments`: In progress count
- `failedAssignments`: Failed count
- `assignedAssignments`: Newly assigned (not started) count
- `overdueAssignments`: Overdue count
- `complianceRate`: Completion rate (completed/total * 100)
- `averageScore`: Average score for completed assignments
- `totalCourses`: Number of courses with this risk level
- `totalEmployees`: Unique employees assigned courses of this risk level

**Note:** All three risk levels always included in response, even if no data exists

---

### 4. Overdue Employees List

**Endpoint:** `GET /api/reports/overdue-employees`  
**Access:** Admin only  
**Description:** Get detailed list of employees with overdue courses

**Response:**
```json
{
  "success": true,
  "count": 15,
  "totalOverdueAssignments": 25,
  "data": [
    {
      "employeeId": "64abc123...",
      "employeeName": "John Doe",
      "employeeEmail": "john@example.com",
      "department": "Engineering",
      "overdueCourses": [
        {
          "courseId": "64def456...",
          "courseTitle": "Cybersecurity Awareness",
          "riskLevel": "High",
          "deadline": "2026-02-15T00:00:00.000Z",
          "status": "In Progress",
          "daysOverdue": 15
        },
        {
          "courseId": "64ghi789...",
          "courseTitle": "Data Privacy",
          "riskLevel": "Medium",
          "deadline": "2026-02-20T00:00:00.000Z",
          "status": "Assigned",
          "daysOverdue": 10
        }
      ],
      "totalOverdue": 2
    }
  ]
}
```

**Fields:**
- `employeeId`: Employee's user ID
- `employeeName`: Employee's full name
- `employeeEmail`: Employee's email address
- `department`: Employee's department
- `overdueCourses`: Array of overdue course assignments
  - `courseId`: Course ID
  - `courseTitle`: Course title
  - `riskLevel`: Course risk level
  - `deadline`: Original deadline
  - `status`: Current status (Assigned or In Progress)
  - `daysOverdue`: Number of days past deadline
- `totalOverdue`: Total overdue courses for this employee

**Sort Order:** Descending by total overdue count

---

### 5. Course-wise Statistics

**Endpoint:** `GET /api/reports/course-stats`  
**Access:** Admin only  
**Description:** Get statistics for each course

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "courseId": "64abc123...",
      "courseTitle": "Cybersecurity Awareness",
      "riskLevel": "High",
      "passThreshold": 75,
      "totalAssignments": 50,
      "completedAssignments": 35,
      "inProgressAssignments": 10,
      "failedAssignments": 3,
      "completionRate": 70.0,
      "averageScore": 82.5,
      "totalAttempts": 58
    }
  ]
}
```

**Fields:**
- `courseId`: Course ID
- `courseTitle`: Course title
- `riskLevel`: Course risk level
- `passThreshold`: Minimum passing score
- `totalAssignments`: Total times this course was assigned
- `completedAssignments`: Successful completions
- `inProgressAssignments`: Currently in progress
- `failedAssignments`: Failed attempts
- `completionRate`: Completion percentage
- `averageScore`: Average score of completed assignments
- `totalAttempts`: Total quiz attempts across all assignments

**Sort Order:** Descending by completion rate

---

### 6. Employee-wise Statistics

**Endpoint:** `GET /api/reports/employee-stats`  
**Access:** Admin only  
**Description:** Get statistics for each employee

**Query Parameters:**
- `department` (optional): Filter by department

**Response:**
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "employeeId": "64abc123...",
      "employeeName": "John Doe",
      "employeeEmail": "john@example.com",
      "department": "Engineering",
      "totalAssignments": 8,
      "completedAssignments": 7,
      "inProgressAssignments": 1,
      "failedAssignments": 0,
      "overdueAssignments": 0,
      "completionRate": 87.5,
      "averageScore": 88.5
    }
  ]
}
```

**Fields:**
- `employeeId`: Employee's user ID
- `employeeName`: Employee's full name
- `employeeEmail`: Employee's email
- `department`: Employee's department
- `totalAssignments`: Total courses assigned to this employee
- `completedAssignments`: Courses completed
- `inProgressAssignments`: Courses in progress
- `failedAssignments`: Failed courses
- `overdueAssignments`: Overdue courses
- `completionRate`: Completion percentage
- `averageScore`: Average score across completed courses

**Sort Order:** Descending by completion rate

**Example with Filter:**
```
GET /api/reports/employee-stats?department=Engineering
```

---

### 7. Trend Statistics

**Endpoint:** `GET /api/reports/trends`  
**Access:** Admin only  
**Description:** Get time-based trending data

**Query Parameters:**
- `period` (optional): Number of days to include (default: 30)

**Response:**
```json
{
  "success": true,
  "period": "30 days",
  "data": {
    "assignments": [
      {
        "_id": "2026-02-01",
        "count": 15
      },
      {
        "_id": "2026-02-02",
        "count": 12
      }
    ],
    "completions": [
      {
        "_id": "2026-02-01",
        "count": 8,
        "averageScore": 85.5
      },
      {
        "_id": "2026-02-02",
        "count": 10,
        "averageScore": 82.3
      }
    ]
  }
}
```

**Fields:**
- `period`: Time period covered
- `assignments`: Array of assignment counts by date
  - `_id`: Date (YYYY-MM-DD)
  - `count`: Number of assignments created on that date
- `completions`: Array of completion counts by date
  - `_id`: Date (YYYY-MM-DD)
  - `count`: Number of courses completed on that date
  - `averageScore`: Average score for that date

**Example:**
```
GET /api/reports/trends?period=7
```

---

### 8. Export Report Data

**Endpoint:** `GET /api/reports/export`  
**Access:** Admin only  
**Description:** Export report data for CSV download

**Query Parameters:**
- `type` (optional): Report type - `overview`, `department`, or `employees` (default: overview)

**Response:**
```json
{
  "success": true,
  "count": 500,
  "data": [
    {
      "department": "Engineering",
      "employeeName": "John Doe",
      "courseTitle": "Cybersecurity",
      "status": "Completed",
      "score": 85,
      "deadline": "2026-03-01T00:00:00.000Z",
      "completionDate": "2026-02-28T15:30:00.000Z"
    }
  ],
  "message": "Report data ready for export"
}
```

**Export Types:**
- `department`: Department-level data with employee and course details
- `employees`: Employee assignments with course information
- `overview` (default): All assignments with full details

**Example:**
```
GET /api/reports/export?type=department
```

---

## Usage Examples

### JavaScript/Axios

```javascript
// Get overview statistics
const getOverview = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    'http://localhost:5000/api/reports/overview',
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  console.log(response.data.data);
};

// Get department statistics
const getDepartmentStats = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    'http://localhost:5000/api/reports/department-stats',
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  console.log(response.data.data);
};

// Get overdue employees
const getOverdueEmployees = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    'http://localhost:5000/api/reports/overdue-employees',
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  console.log(response.data.data);
};

// Get employee stats filtered by department
const getEmployeeStats = async (department) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `http://localhost:5000/api/reports/employee-stats?department=${department}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  console.log(response.data.data);
};

// Export report data
const exportReport = async (type) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `http://localhost:5000/api/reports/export?type=${type}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  // Convert to CSV
  const data = response.data.data;
  const csv = convertToCSV(data);
  downloadCSV(csv, `${type}_report.csv`);
};
```

### cURL

```bash
# Get overview
curl -X GET http://localhost:5000/api/reports/overview \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get department stats
curl -X GET http://localhost:5000/api/reports/department-stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get risk compliance
curl -X GET http://localhost:5000/api/reports/risk-compliance \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get overdue employees
curl -X GET http://localhost:5000/api/reports/overdue-employees \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get trends for last 7 days
curl -X GET "http://localhost:5000/api/reports/trends?period=7" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Export department report
curl -X GET "http://localhost:5000/api/reports/export?type=department" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Key Metrics Explained

### Completion Percentage
```
Completion % = (Completed Assignments / Total Assignments) × 100
```

### Compliance Rate (Risk-level)
```
Compliance Rate = (Completed Assignments / Total Assignments) × 100
```
Measured separately for each risk level

### Average Score
```
Average Score = Sum of all scores / Number of completed assignments
```
Only includes assignments with status = 'Completed'

### Days Overdue
```
Days Overdue = (Current Date - Deadline) / (24 hours)
```
Rounded down to whole days

---

## Report Use Cases

### 1. Executive Dashboard
Use `/overview` to display high-level KPIs:
- Total courses available
- Employee participation rate
- Overall completion percentage
- Average performance score

### 2. Department Performance
Use `/department-stats` to:
- Compare department performance
- Identify departments needing support
- Track department-wise compliance

### 3. Risk Management
Use `/risk-compliance` to:
- Monitor high-risk course compliance
- Ensure critical training completion
- Track risk-level performance

### 4. Follow-up Actions
Use `/overdue-employees` to:
- Send reminder emails
- Identify employees needing attention
- Track overdue assignments by priority

### 5. Course Effectiveness
Use `/course-stats` to:
- Identify difficult courses (low completion, low scores)
- Find popular courses
- Optimize course content based on performance

### 6. Employee Progress Tracking
Use `/employee-stats` to:
- Individual performance reviews
- Identify top performers
- Find employees needing support

### 7. Trend Analysis
Use `/trends` to:
- Track assignment velocity
- Monitor completion trends
- Identify patterns over time

---

## Error Responses

All endpoints return standard error format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details"
}
```

Common error codes:
- `401`: Unauthorized (no token)
- `403`: Forbidden (not admin)
- `500`: Internal server error

---

## Performance Considerations

- All reports use MongoDB aggregation pipeline for efficiency
- Large datasets may take a few seconds to compute
- Consider caching report results for frequently accessed data
- Export endpoint may timeout for very large datasets (> 10,000 records)

---

## Security

- All endpoints require authentication (Bearer token)
- All endpoints require admin role
- No sensitive data (passwords) included in responses
- Aggregation queries optimized to prevent performance attacks

---

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Scheduled report emails
- [ ] Custom date range filters
- [ ] PDF report generation
- [ ] Chart data endpoints
- [ ] Predictive analytics
- [ ] Comparison reports (period-over-period)
- [ ] Custom report builder

---

**Last Updated:** 2026-03-02  
**API Version:** 1.0.0
