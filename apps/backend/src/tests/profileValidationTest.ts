/**
 * Manual test script for Profile Validation.
 */
import { validateProfileUpdate } from '../validators/profileValidator';

console.log('🧪 Testing Profile Validation Logic...\n');

const tests = [
  {
    name: 'Valid Profile Update',
    body: { displayName: 'John Doe', bio: 'Supplying fresh vegetables.', district: 'Colombo' },
    expected: true
  },
  {
    name: 'Bio Too Long (>300 chars)',
    body: { bio: 'A'.repeat(301) },
    expected: false
  },
  {
    name: 'Invalid District',
    body: { district: 'London' },
    expected: false
  },
  {
    name: 'Profanity in Display Name',
    body: { displayName: 'Hacker John' },
    expected: false
  },
  {
    name: 'Large Image Metadata',
    body: { photoSize: 10 * 1024 * 1024 }, // 10MB
    expected: false
  },
  {
    name: 'Invalid MIME Type',
    body: { photoMimeType: 'application/pdf' },
    expected: false
  }
];

tests.forEach(test => {
  const result = validateProfileUpdate(test.body);
  const passed = result.valid === test.expected;
  console.log(`${passed ? '✅' : '❌'} ${test.name}`);
  if (!result.valid && !passed) {
    console.log(`   Error: ${result.error}`);
  }
});
