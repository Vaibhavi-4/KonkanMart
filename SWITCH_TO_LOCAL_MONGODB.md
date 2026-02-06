# Switch to Local MongoDB (Fix DNS Timeout)

## Quick Fix for DNS Timeout

The connection is already configured to use **local MongoDB** by default.

### Step 1: Install MongoDB Locally

**Download:**
- https://www.mongodb.com/try/download/community
- Choose: Windows x64, MSI installer

**Install:**
1. Run the installer
2. Choose "Complete" installation
3. Check "Install MongoDB as a Service"
4. Click "Install"

### Step 2: Start MongoDB Service

```bash
# Windows PowerShell (as Administrator)
net start MongoDB
```

**Or check in Services:**
1. Press `Win + R`
2. Type `services.msc`
3. Find "MongoDB" service
4. Right-click → Start

### Step 3: Verify MongoDB is Running

```bash
# Test connection
mongosh
# Or
mongo
```

If you see MongoDB shell, it's working!

### Step 4: Run Seed Script

```bash
cd backend
node seed.js
```

## Current Configuration

The `backend/config/database.js` is already set to use local MongoDB:

```javascript
const MONGODB_URI = 'mongodb://localhost:27017/konkanmart';
```

## Verify Installation

```bash
# Check if MongoDB service exists
sc query MongoDB

# Check if MongoDB is running
Get-Service MongoDB
```

## If MongoDB Service Not Found

**Reinstall MongoDB:**
1. Download installer again
2. Make sure to check "Install as Windows Service"
3. Complete installation
4. Run: `net start MongoDB`

## Benefits of Local MongoDB

✅ No network/DNS issues
✅ Faster connection
✅ Works offline
✅ No Atlas setup needed
✅ Better for development

## Switch Back to Atlas (Optional)

If you want to use Atlas later, edit `backend/config/database.js`:

```javascript
const MONGODB_URI = 'mongodb+srv://test:test@cluster0.xsuxqaq.mongodb.net/konkanmart?retryWrites=true&w=majority';
```

But for development, **local MongoDB is recommended!**

---

**After installing MongoDB, just run: `node seed.js`**
