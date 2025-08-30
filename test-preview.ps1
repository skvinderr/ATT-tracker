#!/usr/bin/env powershell

# College Attendance Tracker - Application Demo Test
# This script demonstrates the key features of the application

Write-Host "🎓 College Attendance Tracker - Application Test & Preview" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Start the server in the background
Write-Host "`n🚀 Starting the application server..." -ForegroundColor Yellow
$job = Start-Job -ScriptBlock { 
    Set-Location "C:\Users\sciad\college-attendance-tracker"
    npm start 
} -Name "DemoServer"

# Wait for server to start
Write-Host "⏳ Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "✅ Server should be running on http://localhost:3000" -ForegroundColor Green

# Test API Health
Write-Host "`n🔍 Testing API Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
    Write-Host "✅ API Health Check: SUCCESS" -ForegroundColor Green
    Write-Host "   Server Status: $($healthResponse.message)" -ForegroundColor White
    Write-Host "   Environment: $($healthResponse.environment)" -ForegroundColor White
    Write-Host "   Timestamp: $($healthResponse.timestamp)" -ForegroundColor White
} catch {
    Write-Host "❌ API Health Check: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Frontend Loading
Write-Host "`n🌐 Testing Frontend Loading..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend Loading: SUCCESS" -ForegroundColor Green
        Write-Host "   Status Code: $($frontendResponse.StatusCode)" -ForegroundColor White
        Write-Host "   Content Length: $($frontendResponse.RawContentLength) bytes" -ForegroundColor White
        
        # Check if it contains key elements
        if ($frontendResponse.Content -match "College Attendance") {
            Write-Host "   ✓ Page Title Found" -ForegroundColor Green
        }
        if ($frontendResponse.Content -match "loginForm") {
            Write-Host "   ✓ Login Form Found" -ForegroundColor Green
        }
        if ($frontendResponse.Content -match "dashboard") {
            Write-Host "   ✓ Dashboard Elements Found" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Frontend Loading: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Display sample login credentials
Write-Host "`n🔑 Sample Login Credentials:" -ForegroundColor Magenta
Write-Host "   👨‍💼 Admin Login:" -ForegroundColor White
Write-Host "      Email: admin@college.edu" -ForegroundColor Gray
Write-Host "      Password: Admin123" -ForegroundColor Gray
Write-Host "`n   🎓 Student Login:" -ForegroundColor White
Write-Host "      Email: studentcse1@college.edu" -ForegroundColor Gray
Write-Host "      Password: Student123" -ForegroundColor Gray

# Display feature overview
Write-Host "`n📱 Application Features:" -ForegroundColor Magenta
Write-Host "   ✅ User Authentication (Login/Register)" -ForegroundColor Green
Write-Host "   ✅ Student Dashboard with Attendance Overview" -ForegroundColor Green
Write-Host "   ✅ Subject-wise Attendance Tracking" -ForegroundColor Green
Write-Host "   ✅ Attendance Marking Interface" -ForegroundColor Green
Write-Host "   ✅ Profile Management" -ForegroundColor Green
Write-Host "   ✅ Responsive Design (Mobile & Desktop)" -ForegroundColor Green
Write-Host "   ✅ Real-time Attendance Charts" -ForegroundColor Green
Write-Host "   ✅ 75% Attendance Monitoring" -ForegroundColor Green

Write-Host "`n🌐 Access the Application:" -ForegroundColor Cyan
Write-Host "   Open your web browser and go to: http://localhost:3000" -ForegroundColor White

# Show server logs
Write-Host "`n📋 Server Status:" -ForegroundColor Yellow
$serverLogs = Receive-Job -Name "DemoServer"
if ($serverLogs) {
    Write-Host $serverLogs -ForegroundColor Gray
} else {
    Write-Host "   Server is starting up..." -ForegroundColor Gray
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "   2. Try logging in with the sample credentials above" -ForegroundColor White
Write-Host "   3. Explore the dashboard and attendance features" -ForegroundColor White
Write-Host "   4. Use Ctrl+C to stop this demo when done" -ForegroundColor White

Write-Host "`n⚠️  Note: Server is running in background job. Use 'Get-Job | Stop-Job' to stop." -ForegroundColor Yellow
