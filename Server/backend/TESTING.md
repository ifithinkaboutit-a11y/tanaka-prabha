# Testing Guide for Tanak Prabha API

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Test Environment**
   ```bash
   cp .env.test.example .env.test
   ```
   Update `.env.test` with your test database credentials.

3. **Database Setup**
   - Create a separate test database or use a test schema
   - Run the schema.sql to create tables
   - Tests will automatically clean up test data

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Test Structure

```
src/tests/
├── setup.js              # Test configuration and setup
├── helpers.js            # Test utilities and database helpers
├── fixtures.js           # Test data and constants
└── routes/
    └── auth.test.js      # Authentication API tests
```

## Test Coverage

### Authentication Routes
- ✅ POST /api/auth/send-otp
  - Send OTP with valid phone number
  - Format phone number correctly
  - Reject invalid phone formats
  - Enforce rate limiting
  - Store OTP in database

- ✅ POST /api/auth/verify-otp
  - Verify valid OTP and return JWT
  - Create new user if doesn't exist
  - Reject invalid OTP
  - Reject expired OTP
  - Prevent OTP reuse
  - Validate input fields

- ✅ POST /api/auth/resend-otp
  - Resend OTP successfully
  - Prevent too frequent resends
  - Validate phone number

- ✅ GET /api/auth/verify-token
  - Verify valid JWT token
  - Reject missing token
  - Reject invalid token
  - Reject malformed header

## Test Data

### Valid Test Phone Numbers
- 9999888777
- 9999888776
- 9999888775
- All numbers starting with 91999 are used for testing

### Test Cleanup
Tests automatically clean up data:
- Delete OTPs with phone numbers like '91999%' or '9999%'
- Delete test users and related data
- Run cleanup before and after tests

## Writing New Tests

### Example Test Template

```javascript
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import { cleanupDatabase, closeDatabase } from '../helpers.js';

describe('Your Feature Tests', () => {
    beforeAll(async () => {
        await cleanupDatabase();
    });

    afterAll(async () => {
        await cleanupDatabase();
        await closeDatabase();
    });

    test('should do something', async () => {
        const response = await request(app)
            .post('/api/your-endpoint')
            .send({ data: 'value' })
            .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
    });
});
```

## Common Issues

### Tests Hanging
- Check database connections are properly closed
- Use `--forceExit` flag in jest config
- Ensure all async operations complete

### Database Connection Errors
- Verify DATABASE_URL in .env.test
- Check database is accessible
- Ensure schema is created

### Rate Limiting Issues
- Tests may fail if rate limits are hit
- Clean up between tests
- Use different phone numbers for each test

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

## Coverage Reports

After running `npm run test:coverage`, view the report:
- Open `coverage/lcov-report/index.html` in a browser
- Check console output for summary

### Target Coverage
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean test data after tests
3. **Assertions**: Use meaningful assertions
4. **Error Cases**: Test both success and error scenarios
5. **Edge Cases**: Test boundary conditions
6. **Performance**: Keep tests fast (< 5s each)

## Debugging Tests

### Run Single Test File
```bash
npm test -- auth.test.js
```

### Run Single Test Case
```bash
npm test -- -t "should verify OTP successfully"
```

### Verbose Output
```bash
npm test -- --verbose
```

### Debug Mode
Add `debugger;` in test and run:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Future Improvements

- [ ] Add integration tests for all models
- [ ] Add performance/load tests
- [ ] Add E2E tests with real SMS
- [ ] Mock external services
- [ ] Add snapshot testing for API responses
- [ ] Set up continuous integration
- [ ] Add mutation testing
