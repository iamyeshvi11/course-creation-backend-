# Quiz Submission API Documentation

## Overview
This document describes the quiz submission API that handles employee course quiz submissions, scoring, and status management.

## Endpoint

### POST /api/courses/assignments/:id/submit

Submit quiz answers for a course assignment.

## Request

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### URL Parameters
- `id` (string, required): Assignment ID

### Request Body
```json
{
  "answers": [
    {
      "moduleIndex": 0,
      "questionIndex": 0,
      "selectedAnswer": 2
    },
    {
      "moduleIndex": 0,
      "questionIndex": 1,
      "selectedAnswer": 1
    },
    {
      "moduleIndex": 1,
      "questionIndex": 0,
      "selectedAnswer": 3
    }
  ],
  "timeTaken": 15
}
```

#### Fields
- **answers** (array, required): Array of answer objects
  - **moduleIndex** (number): Index of the module (0-based)
  - **questionIndex** (number): Index of the question within the module (0-based)
  - **selectedAnswer** (number): Index of the selected answer option (0-based)
  
- **timeTaken** (number, optional): Time taken to complete quiz in minutes

## Logic Flow

### 1. Input Validation
- Validates that `answers` array is provided and not empty
- Verifies assignment exists
- Checks authorization (employee can only submit their own assignments)

### 2. Answer Comparison & Scoring
```javascript
// For each answer submitted:
const module = course.modules[answer.moduleIndex];
const question = module.quiz[answer.questionIndex];
const isCorrect = question.correctAnswer === answer.selectedAnswer;

// Calculate percentage score:
score = (correctAnswers / totalQuestions) * 100
```

### 3. Status Determination
```javascript
if (score >= course.passThreshold) {
  status = 'Completed'
  completionDate = current timestamp
  finalScore = score
} else {
  status = 'Failed'
  finalScore = score
  // Employee can retry - no restrictions
}
```

### 4. Attempt Storage
Each submission is stored as an attempt with:
- **attemptNumber**: Auto-incremented (1, 2, 3, ...)
- **score**: Percentage score for this attempt
- **answers**: Array of submitted answers with correctness flags
- **completedAt**: Timestamp of submission
- **timeTaken**: Duration in minutes

### 5. Retake Logic
- **If Failed**: 
  - Status set to 'Failed'
  - Employee can submit again (unlimited retakes)
  - Each submission creates a new attempt
  - Best score and attempt count are tracked

- **If Completed**:
  - Status set to 'Completed'
  - Completion date recorded
  - Employee can still review course but typically no retake needed

## Response

### Success Response (200 OK)

#### Passed (score >= passThreshold)
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "employeeId": "64a1b2c3d4e5f6g7h8i9j0k2",
    "courseId": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
      "title": "Cybersecurity Awareness Training",
      "passThreshold": 70
    },
    "status": "Completed",
    "score": 85,
    "completionDate": "2026-03-02T15:30:00.000Z",
    "attempts": [
      {
        "attemptNumber": 1,
        "score": 85,
        "answers": [
          {
            "moduleIndex": 0,
            "questionIndex": 0,
            "selectedAnswer": 2,
            "isCorrect": true
          },
          {
            "moduleIndex": 0,
            "questionIndex": 1,
            "selectedAnswer": 1,
            "isCorrect": false
          }
        ],
        "completedAt": "2026-03-02T15:30:00.000Z",
        "timeTaken": 15
      }
    ],
    "attemptCount": 1,
    "deadline": "2026-03-10T00:00:00.000Z"
  },
  "message": "Congratulations! You passed the course!"
}
```

#### Failed (score < passThreshold)
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "employeeId": "64a1b2c3d4e5f6g7h8i9j0k2",
    "courseId": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
      "title": "Cybersecurity Awareness Training",
      "passThreshold": 70
    },
    "status": "Failed",
    "score": 55,
    "completionDate": null,
    "attempts": [
      {
        "attemptNumber": 1,
        "score": 55,
        "answers": [...],
        "completedAt": "2026-03-02T15:30:00.000Z",
        "timeTaken": 12
      }
    ],
    "attemptCount": 1,
    "bestScore": 55,
    "deadline": "2026-03-10T00:00:00.000Z"
  },
  "message": "Quiz submitted. Unfortunately, you did not meet the pass threshold. You can try again."
}
```

### Error Responses

#### 400 Bad Request - Missing answers
```json
{
  "success": false,
  "message": "Answers array is required"
}
```

#### 403 Forbidden - Not authorized
```json
{
  "success": false,
  "message": "Not authorized to submit this assignment"
}
```

#### 404 Not Found - Assignment not found
```json
{
  "success": false,
  "message": "Assignment not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to submit quiz",
  "error": "Error details"
}
```

## Features

### ✅ Answer Comparison
- Compares each submitted answer with the correct answer from the course
- Tracks which answers were correct/incorrect
- Calculates accuracy percentage

### ✅ Score Calculation
```
Score = (Number of Correct Answers / Total Questions) × 100
```
- Rounded to nearest whole number
- Stored for each attempt

### ✅ Pass/Fail Determination
```
if (score >= passThreshold) → Completed
else → Failed (can retake)
```

### ✅ Retake Support
- Unlimited retakes for failed attempts
- Each attempt is tracked separately
- Virtual fields track:
  - `attemptCount`: Total number of attempts
  - `bestScore`: Highest score achieved across all attempts

### ✅ Attempt Tracking
Each attempt stores:
- Attempt number (auto-incremented)
- Score achieved
- All answers with correctness flags
- Completion timestamp
- Time taken

## Usage Examples

### Example 1: First Attempt (Pass)
```bash
curl -X POST http://localhost:5000/api/courses/assignments/64abc123/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"moduleIndex": 0, "questionIndex": 0, "selectedAnswer": 2},
      {"moduleIndex": 0, "questionIndex": 1, "selectedAnswer": 0},
      {"moduleIndex": 1, "questionIndex": 0, "selectedAnswer": 1}
    ],
    "timeTaken": 18
  }'
```

**Result**: If score >= 70%, status becomes "Completed"

### Example 2: Retake After Failure
```bash
# First attempt scored 55% (Failed)
# Employee can immediately retry by calling the same endpoint again

curl -X POST http://localhost:5000/api/courses/assignments/64abc123/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"moduleIndex": 0, "questionIndex": 0, "selectedAnswer": 2},
      {"moduleIndex": 0, "questionIndex": 1, "selectedAnswer": 1},
      {"moduleIndex": 1, "questionIndex": 0, "selectedAnswer": 1}
    ],
    "timeTaken": 22
  }'
```

**Result**: New attempt created. If score >= 70%, status changes to "Completed"

## Database Schema

### Assignment Model
```javascript
{
  employeeId: ObjectId,
  courseId: ObjectId,
  status: "Assigned" | "In Progress" | "Completed" | "Failed",
  score: Number (0-100),
  completionDate: Date,
  attempts: [
    {
      attemptNumber: Number,
      score: Number,
      answers: [
        {
          moduleIndex: Number,
          questionIndex: Number,
          selectedAnswer: Number,
          isCorrect: Boolean
        }
      ],
      completedAt: Date,
      timeTaken: Number
    }
  ]
}
```

## Implementation Details

### File Locations
- **Controller**: `backend/controllers/courseController.js` - `submitQuiz()` function
- **Model**: `backend/models/Assignment.js` - `submitAttempt()` method
- **Route**: `backend/routes/courseRoutes.js` - POST `/assignments/:id/submit`

### Key Methods
```javascript
// Assignment model instance method
assignmentSchema.methods.submitAttempt = async function(answers, timeTaken) {
  // 1. Fetch course with correct answers
  // 2. Compare submitted answers
  // 3. Calculate score percentage
  // 4. Determine pass/fail status
  // 5. Store attempt
  // 6. Update assignment status
  // 7. Save to database
}
```

## Security
- Authentication required (Bearer token)
- Authorization check: Employee can only submit their own assignments
- Input validation on answers array
- Assignment ownership verification

## Notes
- Attempts are never deleted - full history preserved
- `bestScore` virtual field automatically tracks highest score
- No limit on number of retakes
- Time taken is optional but recommended for analytics
- Correct answers are never returned to prevent cheating
