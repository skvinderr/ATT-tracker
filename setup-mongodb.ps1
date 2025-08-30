# MongoDB Installation Script for Windows
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Green
Write-Host "MongoDB Setup for College Attendance Tracker" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Red
    pause
    exit 1
}

# Function to check if MongoDB is already installed
function Test-MongoDBInstalled {
    try {
        $mongoPath = Get-Command mongod -ErrorAction SilentlyContinue
        return $null -ne $mongoPath
    }
    catch {
        return $false
    }
}

# Function to download and install MongoDB
function Install-MongoDB {
    Write-Host "Downloading MongoDB Community Server..." -ForegroundColor Yellow
    
    $mongoUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.5-signed.msi"
    $downloadPath = "$env:TEMP\mongodb-installer.msi"
    
    try {
        # Download MongoDB installer
        Invoke-WebRequest -Uri $mongoUrl -OutFile $downloadPath -UseBasicParsing
        
        Write-Host "Installing MongoDB..." -ForegroundColor Yellow
        
        # Install MongoDB silently
        Start-Process msiexec.exe -Wait -ArgumentList "/i `"$downloadPath`" /quiet /norestart INSTALLLOCATION=`"C:\Program Files\MongoDB\Server\7.0\`" ADDLOCAL=`"ServerNoService,Client`""
        
        # Add MongoDB to PATH
        $mongoPath = "C:\Program Files\MongoDB\Server\7.0\bin"
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
        
        if ($currentPath -notlike "*$mongoPath*") {
            [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$mongoPath", "Machine")
            Write-Host "Added MongoDB to system PATH" -ForegroundColor Green
        }
        
        # Refresh current session PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-Host "MongoDB installed successfully!" -ForegroundColor Green
        
        # Clean up
        Remove-Item $downloadPath -Force -ErrorAction SilentlyContinue
        
    }
    catch {
        Write-Host "Error installing MongoDB: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Function to start MongoDB as a service
function Start-MongoDBService {
    Write-Host "Setting up MongoDB service..." -ForegroundColor Yellow
    
    # Create MongoDB data directory
    $dataPath = "C:\data\db"
    if (-not (Test-Path $dataPath)) {
        New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
        Write-Host "Created MongoDB data directory: $dataPath" -ForegroundColor Green
    }
    
    # Create MongoDB log directory
    $logPath = "C:\data\log"
    if (-not (Test-Path $logPath)) {
        New-Item -ItemType Directory -Path $logPath -Force | Out-Null
        Write-Host "Created MongoDB log directory: $logPath" -ForegroundColor Green
    }
    
    # Create MongoDB configuration file
    $configPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
    $configContent = @"
systemLog:
  destination: file
  path: C:\data\log\mongod.log
storage:
  dbPath: C:\data\db
net:
  port: 27017
  bindIp: 127.0.0.1
"@
    
    Set-Content -Path $configPath -Value $configContent -Force
    Write-Host "Created MongoDB configuration file" -ForegroundColor Green
    
    # Install MongoDB as Windows service
    try {
        & "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --config "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg" --install --serviceName "MongoDB"
        
        # Start MongoDB service
        Start-Service MongoDB
        Set-Service MongoDB -StartupType Automatic
        
        Write-Host "MongoDB service installed and started successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Error setting up MongoDB service: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "You may need to start MongoDB manually" -ForegroundColor Yellow
    }
}

# Function to test MongoDB connection
function Test-MongoDBConnection {
    Write-Host "Testing MongoDB connection..." -ForegroundColor Yellow
    
    try {
        # Wait a moment for service to start
        Start-Sleep -Seconds 3
        
        # Test connection using mongosh or mongo
        $testCommand = 'db.adminCommand("ping")'
        
        if (Get-Command mongosh -ErrorAction SilentlyContinue) {
            $result = & mongosh --quiet --eval $testCommand 2>$null
        } else {
            $result = & mongo --quiet --eval $testCommand 2>$null
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ MongoDB connection successful!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ MongoDB connection failed" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "✗ MongoDB connection test failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main installation process
Write-Host "Checking MongoDB installation..." -ForegroundColor Cyan

if (Test-MongoDBInstalled) {
    Write-Host "✓ MongoDB is already installed" -ForegroundColor Green
    
    # Check if service is running
    $mongoService = Get-Service MongoDB -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -eq "Running") {
        Write-Host "✓ MongoDB service is running" -ForegroundColor Green
    } else {
        Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
        try {
            Start-Service MongoDB
            Write-Host "✓ MongoDB service started" -ForegroundColor Green
        }
        catch {
            Write-Host "Could not start MongoDB service. You may need to start it manually." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "MongoDB not found. Installing..." -ForegroundColor Yellow
    Install-MongoDB
    Start-MongoDBService
}

# Test connection
if (Test-MongoDBConnection) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "MongoDB Setup Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open a new PowerShell window" -ForegroundColor White
    Write-Host "2. Navigate to your project directory" -ForegroundColor White
    Write-Host "3. Run: npm run seed" -ForegroundColor White
    Write-Host "4. Run: npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Your application will be available at: http://localhost:5000" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "MongoDB Setup Issues" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual installation may be required:" -ForegroundColor Yellow
    Write-Host "1. Download MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor White
    Write-Host "2. Install with default settings" -ForegroundColor White
    Write-Host "3. Start MongoDB service from Services.msc" -ForegroundColor White
    Write-Host ""
    Write-Host "Alternative: Use MongoDB Atlas (cloud)" -ForegroundColor Cyan
    Write-Host "1. Create account at: https://www.mongodb.com/cloud/atlas" -ForegroundColor White
    Write-Host "2. Create free cluster" -ForegroundColor White
    Write-Host "3. Update MONGODB_URI in .env file" -ForegroundColor White
}

pause
