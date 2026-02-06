# MongoDB Setup Guide for Konkan Mart

## Prerequisites

1. **Install MongoDB**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Install Node.js dependencies**
   ```bash
   cd backend
   npm install
   ```

## Setup Steps

### Option 1: Local MongoDB

1. **Start MongoDB service**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   # or
   mongod
   ```

2. **Verify MongoDB is running**
   - Default connection: `mongodb://localhost:27017`
   - The app will connect automatically

3. **Seed the database**
   ```bash
   cd backend
   npm run seed
   ```

4. **Start the server**
   ```bash
   npm start
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create free account** at https://www.mongodb.com/cloud/atlas

2. **Create a cluster** (free tier available)

3. **Get connection string**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

4. **Set environment variable**
   ```bash
   # Windows PowerShell
   $env:MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/konkanmart"
   
   # Mac/Linux
   export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/konkanmart"
   ```

5. **Update database.js** (optional - can use env var)
   - Or modify `backend/config/database.js` with your connection string

6. **Seed the database**
   ```bash
   cd backend
   npm run seed
   ```

7. **Start the server**
   ```bash
   npm start
   ```

## Database Structure

### Collections

1. **users** - User accounts (buyers, sellers, admins)
2. **products** - Product catalog
3. **orders** - Order records
4. **carts** - Shopping carts

### Seed Data

The seed script creates:
- 3 users (buyer1, seller1, admin)
- 5 sample products
- 1 sample order
- Empty carts for users

## Running Seed Script

```bash
cd backend
npm run seed
```

**Note:** The seed script will:
- Clear existing data
- Create fresh seed data
- Show demo credentials

## Environment Variables (Optional)

Create a `.env` file in `backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/konkanmart
PORT=3000
JWT_SECRET=your-secret-key-here
```

Then install `dotenv`:
```bash
npm install dotenv
```

And add to top of `server.js`:
```javascript
require('dotenv').config();
```

## Troubleshooting

### "MongoDB connection error"

**Solution:**
- Make sure MongoDB is running
- Check connection string
- Verify MongoDB port (default: 27017)

### "Cannot find module 'mongoose'"

**Solution:**
```bash
cd backend
npm install
```

### "Database name already exists"

**Solution:**
- This is normal - MongoDB will use existing database
- To reset: Delete database or run seed script (clears data)

### Connection timeout (Atlas)

**Solution:**
- Add your IP to Atlas whitelist (Network Access)
- Check connection string credentials
- Verify cluster is running

## Verification

After seeding, verify data:

```bash
# Using MongoDB Compass or mongo shell
use konkanmart
db.users.find()
db.products.find()
db.orders.find()
```

## Default Connection

- **Local:** `mongodb://localhost:27017/konkanmart`
- **Database name:** `konkanmart`
- **Collections:** users, products, orders, carts

---

**Ready to use!** The app will automatically connect to MongoDB when you start the server.
