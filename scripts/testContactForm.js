/**
 * Contact Form Test Script
 * Tests the complete contact form flow without starting the dev server
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const mongoose = require('mongoose');

// Import Contact model
const Contact = require('../models/Contact');

// Test data
const testContact = {
  name: 'Test User',
  email: 'test@example.com',
  message: 'This is a test message to verify the contact form works correctly!',
  ipAddress: '127.0.0.1',
  status: 'new'
};

async function testContactForm() {
  console.log('🧪 Testing Contact Form Functionality\n');
  console.log('='.repeat(60));

  let connection;

  try {
    // Test 1: Environment Variables
    console.log('\n📋 Test 1: Checking environment variables...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in .env.local');
    }
    console.log('✅ MONGODB_URI is configured');

    // Test 2: MongoDB Connection
    console.log('\n🔌 Test 2: Testing MongoDB connection...');
    connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB');
    console.log(`   Database: ${connection.connection.name}`);

    // Test 3: Contact Model
    console.log('\n📝 Test 3: Testing Contact model...');
    const contact = new Contact(testContact);
    console.log('✅ Contact model instantiated correctly');

    // Test 4: Validation
    console.log('\n✔️  Test 4: Testing validation...');
    const validationError = contact.validateSync();
    if (validationError) {
      throw new Error(`Validation failed: ${validationError.message}`);
    }
    console.log('✅ Validation passed');

    // Test 5: Save to Database
    console.log('\n💾 Test 5: Testing database save...');
    const savedContact = await contact.save();
    console.log('✅ Contact saved to database');
    console.log(`   ID: ${savedContact._id}`);
    console.log(`   Name: ${savedContact.name}`);
    console.log(`   Email: ${savedContact.email}`);
    console.log(`   Created: ${savedContact.createdAt}`);

    // Test 6: Retrieve from Database
    console.log('\n🔍 Test 6: Testing database retrieval...');
    const retrieved = await Contact.findById(savedContact._id);
    if (!retrieved) {
      throw new Error('Could not retrieve saved contact');
    }
    console.log('✅ Contact retrieved successfully');

    // Test 7: Delete Test Data
    console.log('\n🗑️  Test 7: Cleaning up test data...');
    await Contact.findByIdAndDelete(savedContact._id);
    console.log('✅ Test data deleted');

    // Test 8: Verify Deletion
    console.log('\n✔️  Test 8: Verifying deletion...');
    const deleted = await Contact.findById(savedContact._id);
    if (deleted) {
      throw new Error('Test data was not properly deleted');
    }
    console.log('✅ Deletion verified');

    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ ALL TESTS PASSED!\n');
    console.log('Your contact form is ready to use:');
    console.log('   ✅ MongoDB connection works');
    console.log('   ✅ Contact model works');
    console.log('   ✅ Validation works');
    console.log('   ✅ Database operations work');
    console.log('   ✅ Data persistence verified');

    console.log('\n🚀 Next Steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Visit: http://localhost:3000');
    console.log('   3. Fill out the contact form');
    console.log('   4. Check submissions: node scripts/viewContacts.js\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED!\n');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');

    if (error.message.includes('MONGODB_URI')) {
      console.error('   - Check that .env.local exists and has MONGODB_URI');
      console.error('   - Verify MongoDB connection string is correct');
    } else if (error.message.includes('connect')) {
      console.error('   - Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)');
      console.error('   - Verify MongoDB user credentials are correct');
      console.error('   - Ensure cluster is running');
    } else if (error.message.includes('validation')) {
      console.error('   - Check Contact model schema');
      console.error('   - Verify required fields are present');
    } else {
      console.error('   - Check full error above');
      console.error('   - Review MongoDB connection settings');
    }

    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed\n');
    }
  }
}

// Run tests
testContactForm();
