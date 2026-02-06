# Fix DNS Timeout Error (ETIMEOUT)

## Problem
```
MongoDB connection error: queryTxt ETIMEOUT cluster0.xsuxqaq.mongodb.net
```

This is a DNS/network timeout when trying to connect to MongoDB Atlas.

## Quick Solutions

### Solution 1: Use Local MongoDB (Recommended for Development)

**Switch to local MongoDB to avoid network issues:**

1. **Install MongoDB locally:**
   - Download: https://www.mongodb.com/try/download/community
   - Install and start MongoDB service

2. **Update `backend/config/database.js`:**
   ```javascript
   const MONGODB_URI = 'mongodb://localhost:27017/konkanmart';
   ```

3. **Start MongoDB:**
   ```bash
   # Windows
   net start MongoDB
   ```

4. **Run seed:**
   ```bash
   cd backend
   node seed.js
   ```

### Solution 2: Fix Network/DNS Issues

**Check your internet connection:**
```bash
# Test DNS resolution
nslookup cluster0.xsuxqaq.mongodb.net

# Test connectivity
ping cluster0.xsuxqaq.mongodb.net
```

**If DNS fails:**
- Try using Google DNS: 8.8.8.8, 8.8.4.4
- Check if your ISP is blocking MongoDB Atlas
- Try a different network (mobile hotspot)

### Solution 3: Check MongoDB Atlas

1. **Verify cluster is running:**
   - Go to MongoDB Atlas dashboard
   - Check cluster status (should be "Running", not "Paused")
   - Free tier clusters pause after inactivity

2. **Check Network Access:**
   - Go to Network Access
   - Add IP: 0.0.0.0/0 (Allow from anywhere) for testing
   - Or add your current IP address

3. **Verify connection string:**
   - Go to Database → Connect
   - Get the latest connection string
   - Make sure it includes database name: `/konkanmart`

### Solution 4: Use Alternative Connection Method

**Try using standard connection (non-SRV) if SRV fails:**

Update connection string format:
```javascript
// Instead of mongodb+srv://
// Try: mongodb:// (if your cluster supports it)
```

## Recommended: Use Local MongoDB

For development, local MongoDB is faster and more reliable:

### Windows Setup:

1. **Download MongoDB:**
   - https://www.mongodb.com/try/download/community
   - Choose Windows x64 installer

2. **Install:**
   - Run installer
   - Choose "Complete" installation
   - Install as Windows Service

3. **Start MongoDB:**
   ```bash
   net start MongoDB
   ```

4. **Update connection:**
   ```javascript
   // backend/config/database.js
   const MONGODB_URI = 'mongodb://localhost:27017/konkanmart';
   ```

5. **Test:**
   ```bash
   cd backend
   node seed.js
   ```

## Verify Local MongoDB is Running

```bash
# Check if MongoDB service is running
sc query MongoDB

# Or check in Services (services.msc)
# Look for "MongoDB" service
```

## Connection String Options

**Local MongoDB:**
```javascript
mongodb://localhost:27017/konkanmart
```

**MongoDB Atlas (if network works):**
```javascript
mongodb+srv://username:password@cluster.mongodb.net/konkanmart?retryWrites=true&w=majority
```

## Test Connection

Create `test-connection.js`:
```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/konkanmart')
  .then(() => {
    console.log('✓ Connected!');
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ Error:', err.message);
    process.exit(1);
  });
```

Run:
```bash
node test-connection.js
```

---

**For development, local MongoDB is recommended!**
