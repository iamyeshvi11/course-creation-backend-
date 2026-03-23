# Backend Changes Required - Video Upload Fix

## ⚠️ IMPORTANT: Apply These Changes to Your Backend

The backend code has been modified locally to fix the video upload save issue. Since the backend is not in a Git repository, you need to ensure these changes are applied.

## Changes Made

### 1. `models/Course.js` - Line 50-57

**CHANGE THIS:**
```javascript
metadata: {
  fileSize: Number, // in bytes
  mimeType: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  uploadedAt: Date
}
```

**TO THIS:**
```javascript
metadata: {
  fileSize: Number, // in bytes
  mimeType: String,
  uploadedBy: String, // User ID as string (more flexible)
  uploadedAt: Date
}
```

### 2. `controllers/courseController.js` - Enhanced createCourse function

The entire `createCourse` function has been enhanced. Here are the key changes:

#### Add logging after validation (around line 19):
```javascript
// Log course data for debugging
console.log('Creating course with data:', {
  title,
  moduleCount: modules?.length,
  riskLevel
});
```

#### Add module cleaning BEFORE creating course (around line 35):
```javascript
// Validate and clean up modules data
const cleanedModules = modules.map((module, idx) => {
  console.log(`Processing module ${idx}:`, {
    title: module.title,
    contentBlockCount: module.contentBlocks?.length,
    quizCount: module.quiz?.length
  });

  // Clean up content blocks - ensure they're objects with required fields
  const contentBlocks = (module.contentBlocks || []).map((block, blockIdx) => {
    // If block is a string, convert to text block
    if (typeof block === 'string') {
      return {
        type: 'text',
        content: block
      };
    }
    
    // Validate required fields
    if (!block.type || !block.content) {
      console.error(`Invalid content block at module ${idx}, block ${blockIdx}:`, block);
      throw new Error(`Content block at module ${idx + 1}, block ${blockIdx + 1} is missing required fields (type or content)`);
    }

    return {
      type: block.type,
      content: block.content,
      title: block.title || undefined,
      fileUrl: block.fileUrl || undefined,
      duration: block.duration || undefined,
      thumbnailUrl: block.thumbnailUrl || undefined,
      metadata: block.metadata || undefined
    };
  });

  return {
    title: module.title,
    contentBlocks,
    quiz: module.quiz || []
  };
});
```

#### Use cleanedModules in Course.create (around line 85):
```javascript
const course = await Course.create({
  title,
  description,
  riskLevel,
  createdBy: req.user.id,
  modules: cleanedModules, // Use cleaned modules instead of raw modules
  passThreshold: passThreshold || 70,
  estimatedDuration,
  tags,
  aiGenerated,
  ...categoryData,
  isMandatory: isMandatory !== undefined ? isMandatory : categoryData.isMandatory
});
```

#### Enhanced error handling in catch block (around line 72):
```javascript
} catch (error) {
  console.error('Create course error:', error);
  
  // Handle mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  res.status(500).json({
    success: false,
    message: 'Failed to create course',
    error: error.message
  });
}
```

## Verification

After applying these changes:

1. **Restart your backend server**:
   ```bash
   npm start
   # or
   node server.js
   ```

2. **Check for syntax errors**:
   ```bash
   node -c models/Course.js
   node -c controllers/courseController.js
   ```

3. **Test the fix**:
   - Generate a course
   - Add a video content block
   - Upload a video file
   - Click "Save Course"
   - Should work without errors!

## Files to Modify
- ✅ `models/Course.js` - Change uploadedBy type
- ✅ `controllers/courseController.js` - Add validation and error handling

## Why This Fix Works

1. **Type Mismatch Fixed**: Changed `uploadedBy` from ObjectId to String
2. **Data Validation**: Ensures all content blocks have required fields
3. **Better Errors**: Returns specific field-level validation errors
4. **Logging**: Helps debug future issues

---

**Status**: Changes documented - Apply to backend
**Priority**: HIGH - Required for video upload feature to work
