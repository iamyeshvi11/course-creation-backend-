/**
 * Simple Test Script for Course APIs
 * 
 * This script helps you test the course management APIs
 * Make sure the server is running before executing this script
 * 
 * Usage: node test-course-api.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let courseId = '';

// Helper function to make requests
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Test Functions
async function testRegister() {
  console.log('\n=== Testing User Registration ===');
  try {
    const response = await api.post('/auth/register', {
      name: 'Test Admin',
      email: `admin${Date.now()}@test.com`,
      password: 'password123',
      department: 'IT',
      role: 'admin',
    });
    console.log('✅ Registration successful');
    authToken = response.data.data.token;
    console.log('Token:', authToken.substring(0, 20) + '...');
    return response.data;
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
  }
}

async function testLogin() {
  console.log('\n=== Testing User Login ===');
  try {
    // Use an existing admin account or register first
    const response = await api.post('/auth/login', {
      email: 'admin@test.com',
      password: 'password123',
    });
    console.log('✅ Login successful');
    authToken = response.data.data.token;
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

async function testCreateCourse() {
  console.log('\n=== Testing Create Course ===');
  try {
    const response = await api.post('/courses', {
      title: 'Test Cybersecurity Course',
      description: 'This is a comprehensive test course for cybersecurity training',
      riskLevel: 'Medium',
      passThreshold: 75,
      modules: [
        {
          title: 'Introduction to Security',
          contentBlocks: [
            'What is information security?',
            'Why security matters',
            'Common security threats',
          ],
          quiz: [
            {
              question: 'What is the primary goal of information security?',
              options: [
                'To prevent all access',
                'To protect data confidentiality, integrity, and availability',
                'To monitor users',
                'To restrict internet usage',
              ],
              correctAnswer: 1,
              explanation: 'Information security focuses on protecting the CIA triad: Confidentiality, Integrity, and Availability.',
            },
          ],
        },
        {
          title: 'Password Security',
          contentBlocks: [
            'Creating strong passwords',
            'Password managers',
            'Multi-factor authentication',
          ],
          quiz: [
            {
              question: 'What makes a password strong?',
              options: [
                'Using your name',
                'Using "password123"',
                'A mix of uppercase, lowercase, numbers, and symbols',
                'Using the same password everywhere',
              ],
              correctAnswer: 2,
              explanation: 'Strong passwords use a combination of different character types and are unique.',
            },
          ],
        },
      ],
    });
    console.log('✅ Course created successfully');
    courseId = response.data.data._id;
    console.log('Course ID:', courseId);
    console.log('Course Title:', response.data.data.title);
    console.log('Modules:', response.data.data.moduleCount);
    console.log('Total Questions:', response.data.data.totalQuestions);
    return response.data;
  } catch (error) {
    console.error('❌ Create course failed:', error.response?.data || error.message);
  }
}

async function testGetAllCourses() {
  console.log('\n=== Testing Get All Courses ===');
  try {
    const response = await api.get('/courses?page=1&limit=10');
    console.log('✅ Get all courses successful');
    console.log('Total courses:', response.data.total);
    console.log('Current page:', response.data.currentPage);
    console.log('Courses returned:', response.data.count);
    return response.data;
  } catch (error) {
    console.error('❌ Get all courses failed:', error.response?.data || error.message);
  }
}

async function testGetSingleCourse() {
  console.log('\n=== Testing Get Single Course ===');
  if (!courseId) {
    console.log('⚠️  No course ID available. Create a course first.');
    return;
  }
  try {
    const response = await api.get(`/courses/${courseId}`);
    console.log('✅ Get single course successful');
    console.log('Course Title:', response.data.data.title);
    console.log('Risk Level:', response.data.data.riskLevel);
    console.log('Pass Threshold:', response.data.data.passThreshold);
    console.log('Modules:', response.data.data.modules.length);
    return response.data;
  } catch (error) {
    console.error('❌ Get single course failed:', error.response?.data || error.message);
  }
}

async function testUpdateCourse() {
  console.log('\n=== Testing Update Course ===');
  if (!courseId) {
    console.log('⚠️  No course ID available. Create a course first.');
    return;
  }
  try {
    const response = await api.put(`/courses/${courseId}`, {
      title: 'Updated Cybersecurity Course',
      riskLevel: 'High',
      passThreshold: 80,
    });
    console.log('✅ Course updated successfully');
    console.log('New Title:', response.data.data.title);
    console.log('New Risk Level:', response.data.data.riskLevel);
    console.log('New Pass Threshold:', response.data.data.passThreshold);
    return response.data;
  } catch (error) {
    console.error('❌ Update course failed:', error.response?.data || error.message);
  }
}

async function testGetCoursesByRiskLevel() {
  console.log('\n=== Testing Get Courses by Risk Level ===');
  try {
    const response = await api.get('/courses/risk/High');
    console.log('✅ Get courses by risk level successful');
    console.log('High risk courses found:', response.data.count);
    return response.data;
  } catch (error) {
    console.error('❌ Get courses by risk level failed:', error.response?.data || error.message);
  }
}

async function testGetMyCourses() {
  console.log('\n=== Testing Get My Courses ===');
  try {
    const response = await api.get('/courses/my-courses');
    console.log('✅ Get my courses successful');
    console.log('My courses count:', response.data.count);
    return response.data;
  } catch (error) {
    console.error('❌ Get my courses failed:', error.response?.data || error.message);
  }
}

async function testDeleteCourse() {
  console.log('\n=== Testing Delete Course ===');
  if (!courseId) {
    console.log('⚠️  No course ID available. Create a course first.');
    return;
  }
  try {
    const response = await api.delete(`/courses/${courseId}`);
    console.log('✅ Course deleted successfully');
    console.log('Message:', response.data.message);
    return response.data;
  } catch (error) {
    console.error('❌ Delete course failed:', error.response?.data || error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('======================================');
  console.log('   COURSE API TEST SUITE');
  console.log('======================================');
  console.log('Server URL:', BASE_URL);
  console.log('======================================\n');

  // Step 1: Register a new admin user
  await testRegister();

  // If registration fails, try login
  if (!authToken) {
    await testLogin();
  }

  if (!authToken) {
    console.error('\n❌ Cannot proceed without authentication token');
    console.log('Please ensure:');
    console.log('1. Server is running on port 5000');
    console.log('2. MongoDB is connected');
    console.log('3. You have admin credentials');
    return;
  }

  // Step 2: Create a test course
  await testCreateCourse();

  // Step 3: Get all courses
  await testGetAllCourses();

  // Step 4: Get single course
  await testGetSingleCourse();

  // Step 5: Update course
  await testUpdateCourse();

  // Step 6: Get courses by risk level
  await testGetCoursesByRiskLevel();

  // Step 7: Get my courses
  await testGetMyCourses();

  // Step 8: Delete course (optional - comment out to keep test data)
  // await testDeleteCourse();

  console.log('\n======================================');
  console.log('   TEST SUITE COMPLETED');
  console.log('======================================\n');
}

// Execute tests
runAllTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
