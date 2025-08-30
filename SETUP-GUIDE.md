# 🎓 College Attendance Tracker - Complete Setup Guide for Beginners

This guide will help you set up and run the College Attendance Tracker application from scratch, even if you're new to web development.

## 📋 What You'll Need

Before we start, make sure you have:
- A Windows, Mac, or Linux computer
- Internet connection
- About 30 minutes of time

## 🚀 Step-by-Step Installation

### Step 1: Install Node.js

Node.js is required to run our application.

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Click the **LTS** version (recommended for most users)
   - Download and install it

2. **Verify Installation:**
   ```bash
   # Open Command Prompt (Windows) or Terminal (Mac/Linux)
   # Type this command:
   node --version
   
   # You should see something like: v18.17.0
   ```

### Step 2: Install MongoDB Database

We need MongoDB to store all our data.

#### Option A: Quick Setup with MongoDB Atlas (Recommended for Beginners)

1. **Create MongoDB Atlas Account:**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Click "Try Free"
   - Sign up with your email

2. **Create a Cluster:**
   - Choose "Create a deployment"
   - Select "M0 Sandbox" (Free tier)
   - Choose your preferred region
   - Click "Create Cluster"

3. **Set Database Access:**
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Create username and password (remember these!)
   - Choose "Read and write to any database"

4. **Set Network Access:**
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Confirm

5. **Get Connection String:**
   - Go back to "Clusters"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

#### Option B: Local MongoDB Installation

**For Windows:**
1. Run the MongoDB setup script we provided:
   ```powershell
   # Right-click PowerShell, select "Run as Administrator"
   # Navigate to your project folder
   cd C:\Users\YourUsername\college-attendance-tracker
   
   # Run the setup script
   .\setup-mongodb.ps1
   ```

**For Mac:**
```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**For Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 3: Setup the Application

1. **Download Project Files:**
   - You should already have the project folder with all files

2. **Open Command Prompt/Terminal:**
   ```bash
   # Navigate to the project folder
   cd C:\Users\YourUsername\college-attendance-tracker
   
   # Install all required packages
   npm install
   ```

3. **Configure Environment Variables:**
   - Open the `.env` file in a text editor
   - Update these settings:

   ```env
   # If using MongoDB Atlas:
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/college_attendance_tracker
   
   # If using local MongoDB:
   MONGODB_URI=mongodb://localhost:27017/college_attendance_tracker
   
   # Change these secrets (important for security):
   JWT_SECRET=MyCollegeApp2024SecretKey123
   SESSION_SECRET=MySessionSecret2024Key456
   
   # For email features (optional - you can skip this initially):
   EMAIL_USERNAME=your.email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

### Step 4: Add Sample Data

```bash
# This creates sample users, subjects, and data for testing
npm run seed
```

You should see output like:
```
✅ Database seeding completed successfully!

📋 Sample Login Credentials:
👨‍💼 Admin: admin@college.edu / Admin123
🎓 Student: studentcse1@college.edu / Student123
```

### Step 5: Start the Application

```bash
# Start the development server
npm run dev
```

You should see:
```
🚀 Server running in development mode on port 5000
📱 Frontend served at: http://localhost:5000
🔗 API available at: http://localhost:5000/api
MongoDB Connected: 127.0.0.1
```

### Step 6: Open Your Browser

1. Open your web browser
2. Go to: **http://localhost:5000**
3. You should see the login page!

## 🎯 Testing the Application

### Login as Student
- Email: `studentcse1@college.edu`
- Password: `Student123`

### Login as Admin
- Email: `admin@college.edu`
- Password: `Admin123`

## 🔧 Troubleshooting

### Problem: "MongoDB connection error"

**Solution 1: Check if MongoDB is running**
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
```

**Solution 2: Use MongoDB Atlas**
- Follow Option A in Step 2 above
- Update your `.env` file with the Atlas connection string

### Problem: "Port 5000 is already in use"

**Solution:**
```bash
# Change port in .env file
PORT=3000

# Or find what's using port 5000
# Windows:
netstat -ano | findstr :5000
# Mac/Linux:
lsof -i :5000
```

### Problem: "npm install" fails

**Solution:**
```bash
# Clear npm cache and try again
npm cache clean --force
npm install
```

## 📱 How to Use the Application

### For Students:

1. **Register Account:**
   - Click "Sign Up"
   - Fill your details
   - Choose your branch and semester
   - Create account

2. **View Dashboard:**
   - See your overall attendance percentage
   - Check which subjects need attention
   - View today's classes

3. **Mark Attendance:**
   - Go to "Mark Attendance"
   - Click Present/Absent for each class
   - See real-time updates

### For Administrators:

1. **Login as Admin:**
   - Use admin credentials
   - Access admin dashboard

2. **Manage Students:**
   - View all students
   - Add new students
   - Update student information

3. **Manage Subjects:**
   - Add new subjects
   - Assign teachers
   - Set class schedules

## 🌐 Deploying to the Internet

### Option 1: Heroku (Free Tier Available)

1. **Create Heroku Account:**
   - Go to: https://heroku.com
   - Sign up for free account

2. **Install Heroku CLI:**
   - Download from: https://devcenter.heroku.com/articles/heroku-cli

3. **Deploy Your App:**
   ```bash
   # Login to Heroku
   heroku login
   
   # Create new app
   heroku create your-college-app-name
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-production-secret
   heroku config:set MONGODB_URI=your-mongodb-atlas-uri
   
   # Deploy
   git init
   git add .
   git commit -m "Initial deployment"
   heroku git:remote -a your-college-app-name
   git push heroku main
   ```

### Option 2: Netlify + MongoDB Atlas

1. **Create Netlify Account:**
   - Go to: https://netlify.com
   - Connect your GitHub account

2. **Deploy Frontend:**
   - Upload your project to GitHub
   - Connect to Netlify
   - Deploy automatically

## 📊 Features Overview

### Student Features:
- ✅ **Dashboard**: Overview of attendance across all subjects
- ✅ **75% Monitor**: Color-coded warnings when attendance drops
- ✅ **Mark Attendance**: Easy one-click attendance marking
- ✅ **Progress Tracking**: Visual progress bars for each subject
- ✅ **Smart Predictions**: See how many classes you can miss
- ✅ **Responsive Design**: Works on phone, tablet, and computer

### Admin Features:
- ✅ **Student Management**: View and manage all students
- ✅ **Subject Management**: Add subjects and assign teachers
- ✅ **Timetable Management**: Create class schedules
- ✅ **Analytics**: View attendance statistics
- ✅ **Reports**: Generate attendance reports

### Technical Features:
- 🔐 **Secure Authentication**: JWT-based login system
- 📧 **Email Notifications**: Password reset emails
- 📱 **Mobile Responsive**: Works on all devices
- 📊 **Interactive Charts**: Visual attendance data
- 🎨 **Modern UI**: Bootstrap 5 design
- ⚡ **Fast Performance**: Optimized for speed

## 💡 Customization Tips

### Change Colors:
- Edit `frontend/css/style.css`
- Modify the `:root` CSS variables

### Add New Subjects:
- Login as admin
- Go to subject management
- Add new subjects and assign to branches

### Modify Attendance Requirements:
- Edit the percentage requirements in the code
- Change from 75% to any percentage you need

## 🆘 Getting Help

### If you encounter issues:

1. **Check the error messages** in your command prompt/terminal
2. **Look at the README.md** for detailed troubleshooting
3. **Search online** for the specific error message
4. **Ask for help** from your instructor or classmates

### Common Beginner Mistakes:

1. **Forgetting to start MongoDB** before running the app
2. **Not updating the .env file** with correct database details
3. **Using wrong login credentials** (check the seeded users)
4. **Firewall blocking** the application (check Windows Firewall)

## 🎉 Success Checklist

✅ Node.js installed and working  
✅ MongoDB installed and running  
✅ Project dependencies installed (`npm install`)  
✅ Environment variables configured (`.env` file)  
✅ Database seeded with sample data (`npm run seed`)  
✅ Application running (`npm run dev`)  
✅ Can access http://localhost:5000  
✅ Can login with sample credentials  
✅ Dashboard shows mock data  

## 📚 Learning Resources

To understand this project better:

- **JavaScript**: https://javascript.info/
- **Node.js**: https://nodejs.org/en/learn/
- **MongoDB**: https://university.mongodb.com/
- **Bootstrap**: https://getbootstrap.com/docs/
- **Express.js**: https://expressjs.com/

---

**Congratulations! 🎊 You've successfully set up a complete college attendance tracking system!**
