# Fix Port 3000 Already in Use Error

## Problem
```
Error: listen EADDRINUSE: address already in use :::3000
```

Port 3000 is already being used by another process.

## Quick Fix

### Option 1: Kill Node Processes (Recommended)

**PowerShell:**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Then start server:**
```bash
npm start
```

### Option 2: Find and Kill Specific Process

**Find process using port 3000:**
```bash
netstat -ano | findstr :3000
```

**Kill the process (replace PID with actual process ID):**
```bash
taskkill /PID <PID> /F
```

### Option 3: Use Different Port

**Edit `backend/server.js`:**
```javascript
const PORT = process.env.PORT || 3001; // Change to 3001 or any available port
```

**Then update frontend API_BASE in `frontend/auth.js`:**
```javascript
window.API_BASE = 'http://localhost:3001/api';
```

## Updated package.json Scripts

The `package.json` now includes:
- `npm run stop` - Kills all node processes
- `npm run restart` - Stops and restarts server

## Usage

**Start server:**
```bash
npm start
```

**Stop server:**
```bash
npm run stop
```

**Restart server:**
```bash
npm run restart
```

## Verify Port is Free

**Check if port 3000 is available:**
```bash
netstat -ano | findstr :3000
```

If nothing shows, port is free.

---

**Quick command to kill and restart:**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force; Start-Sleep -Seconds 1; cd backend; npm start
```
