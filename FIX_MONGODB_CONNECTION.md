# Fix MongoDB Connection Timeout

## Problem
```
MongooseError: Operation `users.deleteMany()` buffering timed out after 10000ms
```

This means MongoDB connection is not established before trying to use models.

## Solutions

### Solution 1: Fix Connection String (Most Common)

**Your current connection string might be missing the database name.**

Update `backend/config/database.js`:

```javascript
const MONGODB_URI = 'mongodb+srv://test:test@cluster0.xsuxqaq.mongodb.net/konkanmart?retryWrites=true&w=majority';
```

**Key points:**
- Include database name: `/konkanmart` (before the `?`)
- Add connection options: `?retryWrites=true&w=majority`

### Solution 2: Check MongoDB Atlas Settings

1. **Network Access (IP Whititelist)**
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for testing
   - Or add your current IP address

2. **Database User**
   - Go to Database Access
   - Verify username/password are correct
   - User should have "Read and write to any database" permission

3. **Cluster Status**
   - Make sure your cluster is running (not paused)
   - Free tier clusters pause after inactivity

### Solution 3: Test Connection

**Test your connection string:**

```bash
# In Node.js REPL or create test-connection.js
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://test:test@cluster0.xsuxqaq.mongodb.net/konkanmart?retryWrites=true&w=majority')
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Error:', err));
```

### Solution 4: Use Local MongoDB (Alternative)

If Atlas is causing issues, use local MongoDB:

1. **Install MongoDB locally**
2. **Update `backend/config/database.js`:**
```javascript
const MONGODB_URI = 'mongodb://localhost:27017/konkanmart';
```

3. **Start MongoDB service:**
```bash
# Windows
net start MongoDB
```

## Quick Fix

**Update your connection string in `backend/config/database.js`:**

```javascript
const MONGODB_URI = 'mongodb+srv://test:test@cluster0.xsuxqaq.mongodb.net/konkanmart?retryWrites=true&w=majority';
```

**Key changes:**
- Added `/konkanmart` (database name)
- Added `?retryWrites=true&w=majority` (connection options)

Then run:
```bash
cd backend
node seed.js
```

## Verify Connection

After fixing, you should see:
```
Connecting to MongoDB...
MongoDB Connected: cluster0-shard-00-00.xsuxqaq.mongodb.net
Database: konkanmart
Clearing existing data...
```

## Common Issues

### Issue: "Authentication failed"
**Fix:** Check username/password in connection string

### Issue: "IP not whitelisted"
**Fix:** Add your IP to Atlas Network Access

### Issue: "Connection timeout"
**Fix:** 
- Check cluster is running
- Verify connection string format
- Check network/firewall settings

### Issue: "Database name missing"
**Fix:** Add `/konkanmart` before `?` in connection string

---

**The seed script has been updated to wait for connection before using models.**
