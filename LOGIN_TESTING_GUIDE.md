# Login Testing Guide for Mentora

## Issue Analysis
The login is failing because:
1. The backend uses `Bun.password.verify()` to check hashed passwords
2. You need valid users in the database with properly hashed passwords
3. The credentials you're entering don't match any users in the database

## Testing Login

### Admin Login (Works without database)
- **User ID**: `admin123`
- **Password**: `secretpass`
- **Role**: Admin

### Student/Mentor Login (Requires database entries)

#### For Students:
- Endpoint: `POST http://localhost:8000/api/students/login`
- Body: `{ "srNo": "student_sr_number", "password": "student_password" }`

#### For Mentors:
- Endpoint: `POST http://localhost:8000/api/mentors/login`
- Body: `{ "empId": "employee_id", "password": "mentor_password" }`

## How to Create Test Users

### Option 1: Use the seed script
Check if there's a seed file:
```bash
cd server
bun run seed
```

### Option 2: Create a test student/mentor via API

#### Create Test Student:
```bash
curl -X POST http://localhost:8000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "srNo": "TEST001",
    "password": "password123",
    "email": "student@test.com",
    "admissionYear": "2024",
    "section": "A"
  }'
```

#### Create Test Mentor:
```bash
curl -X POST http://localhost:8000/api/mentors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Mentor",
    "empId": "MENTOR001",
    "password": "password123",
    "email": "mentor@test.com"
  }'
```

## Quick Test Steps

1. **First, test Admin login** (no database needed):
   - Go to http://localhost:3000/login
   - Select "Admin"
   - Enter: `admin123` / `secretpass`
   - Should work immediately

2. **Check if there are existing users**:
   ```bash
   # List all students
   curl http://localhost:8000/api/students
   
   # List all mentors
   curl http://localhost:8000/api/mentors
   ```

3. **If no users exist, run the seed script or create test users**

## Debugging Steps

1. Open browser DevTools (F12) → Network tab
2. Try to login
3. Check the request to `/api/students/login` or `/api/mentors/login`
4. Look at the response - it will tell you:
   - "Student not found" → User doesn't exist in database
   - "Invalid credentials" → Password is wrong
   - Success → Returns student/mentor data

## Next Steps

Would you like me to:
1. Create a seed script to populate test users?
2. Create an API endpoint to register new users?
3. Check if there's existing seed data?
