# College Attendance Tracker

A comprehensive web application for college students to track their class attendance, maintain the mandatory 75% attendance requirement, and manage their academic schedule efficiently.

## Features

### Core Features
- **User Authentication**: Secure registration and login for students and administrators
- **Student Dashboard**: Visual attendance overview with progress bars and analytics
- **75% Attendance Monitor**: Color-coded warnings and predictions
- **Mark Attendance**: Easy attendance marking for daily classes
- **Subject Management**: Track attendance per subject with detailed analytics
- **Timetable Integration**: Branch-wise and semester-based class schedules
- **Admin Panel**: Complete management system for students, subjects, and timetables
- **Reports**: Detailed attendance reports with export functionality

### Advanced Features
- **Smart Predictions**: Calculate classes you can miss and must attend
- **Visual Analytics**: Charts and graphs for attendance trends
- **Responsive Design**: Mobile-first responsive interface
- **Real-time Updates**: Live attendance percentages and notifications
- **Email Notifications**: Password reset and attendance alerts
- **Dark/Light Theme**: User preference-based themes

## Technology Stack

### Backend
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email services
- **Helmet** for security headers
- **CORS** for cross-origin requests

### Frontend
- **Vanilla JavaScript** (ES6+)
- **Bootstrap 5** for responsive design
- **Chart.js** for data visualization
- **Bootstrap Icons** for iconography

## Installation and Setup

### Prerequisites

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (version 5.0 or higher)
   - **Option A: Local Installation**
     - Download from: https://www.mongodb.com/try/download/community
     - Install MongoDB Community Server
     - Start MongoDB service
   
   - **Option B: MongoDB Atlas (Cloud)**
     - Create account at: https://www.mongodb.com/cloud/atlas
     - Create a free cluster
     - Get connection string

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

### Step 1: Download and Setup Project

```bash
# If you have the project files
cd college-attendance-tracker

# Install dependencies
npm install
```

### Step 2: Environment Configuration

1. Copy the `.env` file and update the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Choose one)
# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/college_attendance_tracker

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college_attendance_tracker

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secure-jwt-secret-key-here-change-in-production
JWT_EXPIRES_IN=30d

# Email Configuration (For Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourcollegename.edu

# Application Settings
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET=your-session-secret-key-here
COOKIE_MAX_AGE=86400000
```

### Step 3: Database Setup

#### Option A: Local MongoDB Setup

1. **Install MongoDB Community Server**
   ```bash
   # Windows: Download installer from MongoDB website
   # macOS: brew install mongodb/brew/mongodb-community
   # Ubuntu: sudo apt-get install mongodb
   ```

2. **Start MongoDB service**
   ```bash
   # Windows: MongoDB should start automatically after installation
   # macOS: brew services start mongodb/brew/mongodb-community
   # Ubuntu: sudo systemctl start mongod
   ```

3. **Verify MongoDB is running**
   ```bash
   # Connect to MongoDB shell
   mongosh
   # or older versions:
   mongo
   ```

#### Option B: MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Whitelist your IP address
6. Get the connection string and update `.env`

### Step 4: Seed Database with Sample Data

```bash
# Seed the database with sample branches, users, and subjects
npm run seed
```

This will create:
- 5 engineering branches (CSE, ECE, ME, CE, IT)
- 1 admin user: `admin@college.edu` / `Admin123`
- 15 sample students (3 per branch)
- Sample subjects for CSE branch
- Sample timetable and academic calendar

### Step 5: Start the Application

```bash
# Start development server
npm run dev

# Or start production server
npm start
```

The application will be available at: **http://localhost:5000**

## Usage Guide

### For Students

1. **Registration**
   - Go to the signup page
   - Fill in your details (name, email, phone, branch, semester)
   - Create a strong password
   - Login with your credentials

2. **Dashboard**
   - View overall attendance percentage
   - See subject-wise attendance breakdown
   - Check today's classes and upcoming schedule
   - Monitor 75% attendance requirement

3. **Mark Attendance**
   - Go to "Mark Attendance" page
   - Mark Present/Absent/Late for each class
   - View real-time attendance updates

4. **View Reports**
   - Access detailed attendance analytics
   - Export attendance reports
   - Track attendance trends

### For Administrators

1. **Login**
   - Use admin credentials: `admin@college.edu` / `Admin123`

2. **Student Management**
   - View all registered students
   - Approve/reject new registrations
   - Manage student accounts

3. **Subject Management**
   - Add new subjects
   - Assign faculty to subjects
   - Manage subject details

4. **Timetable Management**
   - Create branch-wise timetables
   - Update class schedules
   - Manage academic calendar

## API Documentation

### Authentication Endpoints

```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
POST /api/auth/logout       - User logout
GET  /api/auth/me          - Get current user
PUT  /api/auth/updateprofile - Update user profile
PUT  /api/auth/updatepassword - Update password
POST /api/auth/forgotpassword - Request password reset
PUT  /api/auth/resetpassword/:token - Reset password
```

### Sample API Requests

#### User Registration
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "StrongPass123",
  "phone": "9876543210",
  "role": "student",
  "branch": "branch_id",
  "semester": 5
}
```

#### User Login
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@college.edu",
  "password": "StrongPass123",
  "rememberMe": true
}
```

## Deployment

### Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   # Download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-production-jwt-secret
   heroku config:set MONGODB_URI=your-mongodb-atlas-connection-string
   # ... set other environment variables
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

### Local Production Setup

1. **Build for production**
   ```bash
   NODE_ENV=production npm start
   ```

2. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name "attendance-tracker"
   pm2 startup
   pm2 save
   ```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/attendance_tracker
    depends_on:
      - mongo
      
  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:27017
   ```
   **Solution**: Ensure MongoDB is installed and running
   ```bash
   # Windows: Check MongoDB service in Services
   # macOS: brew services start mongodb/brew/mongodb-community
   # Linux: sudo systemctl start mongod
   ```

2. **Port Already in Use**
   ```
   Error: listen EADDRINUSE :::5000
   ```
   **Solution**: Change port in `.env` file or kill process using port 5000
   ```bash
   # Find process using port 5000
   netstat -ano | findstr :5000
   # Kill process (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```

3. **Email Configuration Issues**
   - For Gmail, enable 2-factor authentication
   - Generate app password for EMAIL_PASSWORD
   - Use app password instead of regular password

### Development Tips

1. **Database GUI Tools**
   - MongoDB Compass (official GUI)
   - Robo 3T (free MongoDB GUI)

2. **API Testing**
   - Use Postman or Insomnia for API testing
   - Test endpoints with sample data

3. **Debugging**
   ```bash
   # View server logs
   npm run dev
   
   # Check database connection
   mongosh
   ```

## Project Structure

```
college-attendance-tracker/
├── backend/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── seed.js          # Database seeding
│   ├── controllers/
│   │   └── authController.js # Authentication logic
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── models/
│   │   ├── User.js          # User model
│   │   ├── Branch.js        # Branch model
│   │   ├── Subject.js       # Subject model
│   │   ├── Timetable.js     # Timetable model
│   │   └── AcademicCalendar.js # Calendar model
│   ├── routes/
│   │   └── auth.js          # Authentication routes
│   ├── utils/
│   │   ├── auth.js          # Auth utilities
│   │   └── sendEmail.js     # Email utilities
│   └── server.js            # Main server file
├── frontend/
│   ├── css/
│   │   └── style.css        # Custom styles
│   ├── js/
│   │   ├── app.js           # Main application
│   │   ├── auth.js          # Authentication
│   │   ├── dashboard.js     # Dashboard functionality
│   │   ├── attendance.js    # Attendance management
│   │   └── utils.js         # Utility functions
│   └── index.html           # Main HTML file
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Considerations

1. **Change default secrets** in production
2. **Use HTTPS** in production
3. **Regular security updates**
4. **Input validation** on all forms
5. **Rate limiting** to prevent abuse

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact: admin@yourcollegename.edu

---

**Happy Tracking! 🎓📊**
