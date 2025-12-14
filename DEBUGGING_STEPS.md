# 🔧 DEBUGGING STEPS

## Current Issue
The backend API works perfectly when tested directly, but Next.js auth is failing.

## What We Know
1. ✅ Backend server is running on port 8000
2. ✅ Database has mentors and students (seed was successful)
3. ✅ Direct API test works: `POST /mentors/login` returns 200
4. ❌ Next.js auth fails with "Mentor not found"

## Next Steps to Debug

### 1. Check Server Logs
Look at your **backend server terminal** (the one running `bun run dev` in the server folder)
- You should see login attempts being logged
- Look for any errors or 404s

### 2. Try Admin Login First
Admin login doesn't need the database:
- User ID: `admin123`
- Password: `secretpass`
- Role: Admin

If admin works, the issue is specifically with the database connection.

### 3. Check the Browser Console
Open DevTools (F12) → Console tab
- You should now see detailed logs like:
  - "=== Login Attempt ==="
  - "Role: mentor"
  - "Calling URL: http://localhost:8000/mentors/login"
  - "Response status: 200" (if successful)

### 4. Check Network Tab
DevTools → Network tab:
- Look for the POST request to `/mentors/login`
- Check the Request Headers
- Check the Request Payload
- Check the Response

## Test Credentials Again

### Student
- ID: `CA242711`
- Password: `password`

### Mentor  
- ID: `MNT001`
- Password: `password`

### Admin
- ID: `admin123`
- Password: `secretpass`

## What I Added
- Added detailed console logging in `auth.ts`
- Now you'll see exactly what URL is being called
- You'll see the response status
- You'll see any error messages

## Try This Now
1. Open http://localhost:3000/login
2. Open DevTools (F12) → Console
3. Try logging in as Admin first
4. Check the console logs
5. Tell me what you see!
