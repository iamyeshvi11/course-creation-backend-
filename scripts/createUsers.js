const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  department: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const createUsers = async () => {
  try {
    console.log('🔄 Creating users...\n');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists!');
    } else {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        department: 'Administration'
      });
      console.log('✅ Admin user created:', admin.email);
    }

    // Check if employee exists
    const existingEmployee = await User.findOne({ email: 'employee@example.com' });
    if (existingEmployee) {
      console.log('ℹ️  Employee user already exists!');
    } else {
      const employeePassword = await bcrypt.hash('employee123', 10);
      const employee = await User.create({
        name: 'John Employee',
        email: 'employee@example.com',
        password: employeePassword,
        role: 'employee',
        department: 'Engineering'
      });
      console.log('✅ Employee user created:', employee.email);
    }

    console.log('\n✅ User creation complete!');
    console.log('\n' + '='.repeat(50));
    console.log('LOGIN CREDENTIALS:');
    console.log('='.repeat(50));
    console.log('\n👤 Admin Account:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('\n👤 Employee Account:');
    console.log('   Email: employee@example.com');
    console.log('   Password: employee123');
    console.log('\n' + '='.repeat(50));
    console.log('\n🌐 Access the application at: http://localhost:3000');
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  }
};

createUsers();
