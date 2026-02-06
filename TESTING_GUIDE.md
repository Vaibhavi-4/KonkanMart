# Konkan Mart - Testing Guide

## Quick Test Commands

### 1. Run API Tests
```bash
cd backend
npm test
```

This will test all API endpoints automatically.

### 2. Manual Testing

#### Start Server
```bash
cd backend
npm start
```

#### Seed Database (if needed)
```bash
npm run seed
```

## Test Coverage

### ✅ Authentication Tests
- Register buyer
- Register seller  
- Login buyer
- Login seller
- Login admin

### ✅ Product Tests
- Get all products
- Filter by category
- Search products
- Get categories
- Create product (seller)
- Get product by ID
- Update product (seller)

### ✅ Cart Tests
- Get cart (buyer)
- Add to cart (buyer)
- Remove from cart (buyer)
- Stock validation

### ✅ Order Tests
- Create order (buyer)
- Get orders (buyer)
- Get orders (seller)
- Approve order (seller)
- Add tracking (seller)

### ✅ Admin Tests
- Get admin overview
- Get all users

## Manual Testing Scenarios

### Buyer Flow
1. **Login** as `buyer1` / `password123`
2. **Browse Products**
   - View all products
   - Search for "Goan"
   - Filter by category
3. **Add to Cart**
   - Select quantity
   - Click "Add to Cart"
   - Verify cart count updates
4. **View Cart**
   - Click cart badge
   - Verify items displayed
   - Check total calculation
5. **Checkout**
   - Click "Proceed to Checkout"
   - Enter delivery address
   - Verify seller contact info displayed
   - Place order
6. **View Orders**
   - Check order appears in "My Orders"
   - Verify order status
   - Check seller contact info

### Seller Flow
1. **Login** as `seller1` / `password123`
2. **View Products**
   - See only your products
3. **Add Product**
   - Click "+ Add Product"
   - Fill all fields
   - Submit
   - Verify product appears
4. **Edit Product**
   - Click "Edit" on a product
   - Update fields
   - Save
   - Verify changes
5. **Delete Product**
   - Click "Delete"
   - Confirm
   - Verify removal
6. **View Orders**
   - See incoming orders
7. **Approve Order**
   - Click "Approve Order"
   - Verify status changes
8. **Add Tracking**
   - Enter courier info
   - Enter tracking ID
   - Submit
   - Verify tracking info displayed

### Admin Flow
1. **Login** as `admin` / `password123`
2. **View Overview**
   - Check statistics cards
   - Verify counts
3. **View Users**
   - See all users table
   - Verify user details
4. **View Products**
   - See all products
   - Verify product details
5. **View Orders**
   - See all orders
   - Verify order details

## Known Issues Fixed

### ✅ ID Format Issues
- Backend now consistently returns `id` (string) instead of `_id`
- Frontend properly handles string IDs in onclick handlers

### ✅ Seller Product Filtering
- Fixed sellerId comparison (handles both ObjectId and string formats)
- Added null check for authentication

### ✅ Product Display
- Seller contact info properly displayed on product cards
- Seller info available in checkout modal
- Seller info included in order details

### ✅ Cart Functionality
- Fixed ObjectId conversion for cart operations
- Stock validation working correctly
- Cart count updates properly

## Test Results

Run `npm test` to see detailed test results:

```
[TEST] --- Authentication Tests ---
[TEST] ✓ Register Buyer
[TEST] ✓ Login Buyer
[TEST] ✓ Login Seller
[TEST] ✓ Login Admin

[TEST] --- Product Tests ---
[TEST] ✓ Get All Products
[TEST] ✓ Create Product (Seller)
...

Test Summary
============================================================
Passed: 25
Failed: 0
Total: 25
```

## Troubleshooting

### Tests Fail
1. Ensure server is running: `npm start`
2. Ensure database is seeded: `npm run seed`
3. Check MongoDB connection
4. Verify all dependencies installed: `npm install`

### Frontend Issues
1. Hard refresh browser (Ctrl+F5)
2. Check browser console for errors
3. Verify API_BASE is set correctly
4. Check authentication token in localStorage

### Backend Issues
1. Check server logs
2. Verify MongoDB connection
3. Check JWT_SECRET is set
4. Verify all routes are registered

## Next Steps

After running tests:
1. Review test results
2. Fix any failing tests
3. Test manually in browser
4. Verify all user flows work end-to-end
