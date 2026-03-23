# Backend Quick Fix

The issue is that Mongoose virtuals (totalQuestions, moduleCount) aren't being included in the JSON response by default.

## Option 1: Update Course Model (Recommended)

Already configured correctly in Course.js line 80-82:
```javascript
{
  timestamps: true,
  toJSON: { virtuals: true },  // ✅ Already set
  toObject: { virtuals: true } // ✅ Already set  
}
```

## Option 2: Ensure .lean() is NOT used

The controllers should NOT use `.lean()` when querying courses because that strips virtuals.

Current code is fine - it doesn't use .lean()

## Real Issue: Frontend Console

Check browser console for actual errors. The page might be blank due to:
1. JavaScript errors in frontend
2. API authentication issues
3. CORS issues

## Quick Test:

Run this in browser console when on /admin/courses page:
```javascript
console.log('Checking API...');
fetch('http://localhost:5000/api/courses', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(d => console.log('API Response:', d))
.catch(e => console.error('API Error:', e));
```

This will show the actual error!
