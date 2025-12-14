# 🎯 Solution: How to Fix Login Error

## Root Cause
The login error occurs because there are no users in your database. The seed file exists but hasn't been run yet.

## ✅ SOLUTION: Run the Seed Script

### Step 1: Seed the Database
Open a **new terminal** and run:

```powershell
cd "c:\Users\NITHIN SHETTY\OneDrive\Desktop\mentora\server"
bun run seed
```

This will create test users in your database with these credentials:

### Step 2: Use These Test Credentials

#### 👨‍🎓 **Student Login**
- **User ID (SR No)**: `CA242711` OR `UU246020`
- **Password**: `password`
- **Role**: Select "Student"

#### 👨‍🏫 **Mentor Login**
- **User ID (Emp ID)**: `MNT001` OR `MNT002`
- **Password**: `password`
- **Role**: Select "Mentor"

#### 👨‍💼 **Admin Login** (No database needed)
- **User ID**: `admin123`
- **Password**: `secretpass`
- **Role**: Select "Admin"

## 📝 Quick Test Procedure

1. **Run the seed script** (see Step 1 above)
2. **Refresh your login page** at http://localhost:3000/login
3. **Try logging in** with one of the credentials above
4. **Success!** You should be redirected to the appropriate dashboard

## 🔍 Verify Database Contents

After running seed, you can verify users were created:

```powershell
# Check students
curl http://localhost:8000/api/students

# Check mentors
curl http://localhost:8000/api/mentors
```

## 🐛 If Still Having Issues

1. **Check if MongoDB is connected**
   - Look at your server terminal
   - Should see "Connected to MongoDB..."

2. **Check server logs**
   - Any error messages when trying to login?
   
3. **Check browser DevTools**
   - F12 → Network tab
   - Look at the login request response

## 📊 Summary of Changes Made

1. ✅ Fixed API URLs to use `http://localhost:8000`
2. ✅ Added `.env.local` with proper configuration
3. ✅ Improved error handling in login flow
4. ✅ Identified seed script with test credentials

## 🚀 Next Steps

After successful login:
- **Student** → Student Dashboard with events
- **Mentor** → Mentor Dashboard with mentee management
- **Admin** → Admin Dashboard with verification tools
