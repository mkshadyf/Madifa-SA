import { runAllTests as runAuthTests } from './test-auth';
import { runAllTests as runVimeoSyncTests } from './test-vimeo-sync';
import { runAllTests as runCategoryTests } from './test-categories';

/**
 * Test suite runner for Madifa platform
 */
async function runTestSuite() {
  console.log('========================================');
  console.log('     MADIFA PLATFORM TEST SUITE         ');
  console.log('========================================');
  console.log('Date: ' + new Date().toISOString());
  console.log('----------------------------------------');
  
  try {
    // Authentication Tests
    console.log('\n📋 Running Authentication Tests...');
    await runAuthTests();
    console.log('✅ Authentication Tests Completed');
    
    // Category Management Tests
    console.log('\n📋 Running Category Management Tests...');
    await runCategoryTests();
    console.log('✅ Category Management Tests Completed');
    
    // Vimeo Sync Tests
    console.log('\n📋 Running Vimeo Sync Tests...');
    await runVimeoSyncTests();
    console.log('✅ Vimeo Sync Tests Completed');
    
    console.log('\n----------------------------------------');
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('----------------------------------------');
  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILED');
    console.error('Error:', error.message);
    console.error('----------------------------------------');
    process.exit(1);
  }
}

// Run test suite when this file is executed directly
if (import.meta.url.endsWith('/testSuite.ts')) {
  runTestSuite().catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

export { runTestSuite };