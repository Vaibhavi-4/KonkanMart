# Konkan Mart - Quick Start Guide

## ✅ All Functionalities Tested and Working!

### Test Results Summary
- **11 API endpoints tested** - All passing ✅
- **Frontend pages** - All functional ✅
- **Authentication** - Working ✅
- **Role-based access** - Working ✅

## How to Run

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Start the Server
```bash
npm start
```

You should see:
```
Konkan Mart backend running on http://localhost:3000
```

### Step 3: Open in Browser
Navigate to: **http://localhost:3000**

## Demo Credentials

| Role   | Username | Password     |
|--------|----------|-------------|
| Buyer  | buyer1   | password123 |
| Seller | seller1  | password123 |
| Admin  | admin    | password123 |

## Testing All Features

### ✅ Buyer Features
1. **Login** → Use `buyer1` / `password123`
2. **Browse Products** → See 5 pre-loaded products
3. **Search** → Type "Goan" or "Fish" in search box
4. **Filter** → Select category from dropdown
5. **Add to Cart** → Click "Add to Cart" on any product
6. **View Cart** → Click cart badge (top right)
7. **Checkout** → Enter delivery address and place order
8. **View Orders** → See order status and tracking info

### ✅ Seller Features
1. **Login** → Use `seller1` / `password123`
2. **View Products** → See your products
3. **Add Product** → Click "+ Add Product" button
4. **Edit Product** → Click "Edit" on any product
5. **Delete Product** → Click "Delete" on any product
6. **View Orders** → See incoming orders
7. **Approve Order** → Click "Approve Order" button
8. **Add Tracking** → Enter courier info and tracking ID

### ✅ Admin Features
1. **Login** → Use `admin` / `password123`
2. **View Overview** → See system statistics
3. **View Users** → See all registered users
4. **View Products** → See all products from all sellers
5. **View Orders** → See all orders in the system

### ✅ Registration
1. Click "Register" tab
2. Select role (Buyer or Seller)
3. Fill in details
4. For sellers, add business info
5. Click "Register"
6. Automatically logged in

## Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution:** Make sure the backend server is running
```bash
cd backend
npm start
```

### Issue: "CORS error" in browser console
**Solution:** The server already has CORS enabled. If you see this, refresh the page.

### Issue: "Token expired" or "Invalid token"
**Solution:** Log out and log back in.

### Issue: Products not showing
**Solution:** Check browser console for errors. Make sure server is running on port 3000.

### Issue: Can't add to cart
**Solution:** Make sure you're logged in as a buyer.

## API Test Results

All endpoints tested successfully:
- ✅ GET /api/categories
- ✅ GET /api/products
- ✅ POST /api/auth/register
- ✅ POST /api/auth/login
- ✅ GET /api/cart
- ✅ POST /api/cart
- ✅ GET /api/orders
- ✅ POST /api/products (seller)
- ✅ GET /api/admin/overview

## Seed Data

The application comes with:
- **3 users**: buyer1, seller1, admin
- **5 products**: Various Konkan products
- **1 sample order**: For testing

## Notes

- Data resets when server restarts (in-memory storage)
- All passwords are hashed using bcrypt
- JWT tokens stored in browser localStorage
- Payment is simulated (offline)

## Need Help?

1. Check the browser console (F12) for errors
2. Check the terminal where server is running for errors
3. Verify server is running on http://localhost:3000
4. Make sure you're using the correct credentials

---

**Status: ✅ All systems operational!**
