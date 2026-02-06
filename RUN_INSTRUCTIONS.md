# Konkan Mart - Run Instructions

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local or Atlas)

## Quick Start

### Step 1: Install MongoDB

**Option A: Local MongoDB**
- Download: https://www.mongodb.com/try/download/community
- Start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Free account: https://www.mongodb.com/cloud/atlas
- Get connection string

**See [MONGODB_SETUP.md](MONGODB_SETUP.md) for detailed setup**

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- express
- cors
- jsonwebtoken
- bcryptjs
- mongoose

### Step 3: Seed the Database

```bash
npm run seed
```

This creates sample users, products, and orders.

### Step 4: Start the Server

```bash
npm start
```

You should see:
```
MongoDB Connected: localhost
Konkan Mart backend running on http://localhost:3000
```

### Step 5: Open in Browser

Navigate to: **http://localhost:3000**

The backend automatically serves the frontend files.

## Demo Credentials

| Role   | Username | Password     |
|--------|----------|-------------|
| Buyer  | buyer1   | password123 |
| Seller | seller1  | password123 |
| Admin  | admin    | password123 |

## Testing the Application

### Test Buyer Flow

1. Login as `buyer1` / `password123`
2. Browse products (you'll see seller contact info)
3. Search for "Goan" or filter by category
4. Add product to cart (try adding more than stock to see validation)
5. View cart
6. Proceed to checkout (seller contact info will appear)
7. Enter delivery address
8. Place order
9. View order status and seller contact info

### Test Seller Flow

1. Login as `seller1` / `password123`
2. View your products
3. Add a new product
4. Edit a product
5. View incoming orders
6. Approve an order (after payment confirmation)
7. Add courier and tracking ID

### Test Admin Flow

1. Login as `admin` / `password123`
2. View system overview (counts)
3. View all users
4. View all products
5. View all orders

### Test Registration

1. Go to Register tab
2. Register as a new buyer or seller
3. Login with new credentials

## Project Structure

```
Konkan Mart VP/
├── backend/
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── models/
│   │   ├── User.js          # User model
│   │   ├── Product.js       # Product model
│   │   ├── Order.js         # Order model
│   │   └── Cart.js          # Cart model
│   ├── server.js            # Express server with all APIs
│   ├── seed.js              # Database seed script
│   └── package.json         # Backend dependencies
├── frontend/
│   ├── index.html          # Login/Register page
│   ├── buyer.html          # Buyer dashboard
│   ├── seller.html         # Seller dashboard
│   ├── admin.html          # Admin dashboard
│   ├── styles.css          # Global styles
│   ├── auth.js             # Authentication logic
│   ├── buyer.js             # Buyer functionality
│   ├── seller.js            # Seller functionality
│   └── admin.js             # Admin functionality
└── README.md
```

## API Endpoints

### Base URL: `http://localhost:3000/api`

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

**Products:**
- `GET /products` - Get all products (with seller info)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (seller only)
- `PUT /products/:id` - Update product (seller only)
- `DELETE /products/:id` - Delete product (seller only)
- `GET /categories` - Get all categories

**Cart:**
- `GET /cart` - Get user's cart (buyer only)
- `POST /cart` - Add item to cart (buyer only, with stock validation)
- `DELETE /cart/:productId` - Remove item from cart (buyer only)

**Orders:**
- `POST /orders` - Create order (buyer only, includes seller info)
- `GET /orders` - Get user's orders (role-based, includes seller info)
- `GET /orders/:id` - Get order by ID (includes seller info)
- `PUT /orders/:id/approve` - Approve order (seller only)
- `PUT /orders/:id/tracking` - Add tracking info (seller only)

**Admin:**
- `GET /admin/overview` - Get system overview (admin only)
- `GET /admin/users` - Get all users (admin only)

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoDB connection error"**
- Make sure MongoDB is running
- Check connection string in `config/database.js`
- For local: `mongodb://localhost:27017/konkanmart`
- For Atlas: Use your connection string

**Solution:**
```bash
# Windows - Start MongoDB
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### Server won't start

**Error: Port 3000 already in use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change PORT in backend/server.js
```

### "Cannot connect to server"

- Make sure backend server is running
- Check if port 3000 is accessible
- Verify MongoDB is connected (check console)

### "Cannot find module 'mongoose'"

**Solution:**
```bash
cd backend
npm install
```

### Database not seeded

**Solution:**
```bash
cd backend
npm run seed
```

### "Token expired" or "Invalid token"

- Log out and log back in
- Clear browser localStorage if needed

### Products not showing

- Check browser console (F12) for errors
- Verify server is running on port 3000
- Check Network tab in DevTools
- Verify MongoDB has data: `db.products.find()` in mongo shell

### Seller info not showing

- Refresh the page
- Check browser console for errors
- Verify products API returns seller info

## Development

### Making Changes

- **Backend:** Edit `backend/server.js`, restart server
- **Models:** Edit files in `backend/models/`, restart server
- **Frontend:** Edit files in `frontend/`, refresh browser
- **Styles:** Edit `frontend/styles.css`

### Restart Server

```bash
# Stop: Ctrl+C in terminal
# Start: npm start
```

Or kill and restart:
```bash
# Windows PowerShell
Get-Process -Name node | Stop-Process -Force
cd backend
npm start
```

### Reset Database

```bash
cd backend
npm run seed
```

This will clear and reseed the database.

## Notes

- **Data persists** - MongoDB stores data permanently
- **JWT tokens** stored in browser localStorage
- **Payment is simulated** - Handled offline
- **MongoDB** - All data in MongoDB collections
- **Server runs on port 3000** by default
- **Database name:** `konkanmart`

## Production Considerations

This is a POC. For production:
- Use MongoDB Atlas or managed MongoDB
- Change JWT_SECRET to a secure random string
- Add environment variables for configuration
- Implement proper error handling
- Add input validation and sanitization
- Use HTTPS
- Add rate limiting
- Implement proper logging
- Add database indexes for performance

---

**Status: ✅ Ready to run with MongoDB!**
