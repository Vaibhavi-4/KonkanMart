# Debug Guide: Add Product Issue

## Changes Made

1. **Added comprehensive error handling** in `addProduct()` function
2. **Added authentication check** before making API call
3. **Added API_BASE validation**
4. **Added detailed console logging** for debugging
5. **Changed button type** to `button` to prevent form submission
6. **Improved error messages** with specific details

## How to Debug

### Step 1: Open Browser Console
1. Open the seller dashboard
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab

### Step 2: Try Adding a Product
1. Click "+ Add Product" button
2. Fill in all fields:
   - Product Name: "Test Product"
   - Category: Select any category (NOT "Select Category")
   - Price: 199
   - Description: "Test description"
   - Stock: 10
3. Click "Add Product"

### Step 3: Check Console Output
You should see logs like:
```
Adding product: {name: "Test Product", category: "Spice Kits", ...}
API URL: http://localhost:3000/api/products
Request headers: {Content-Type: "application/json", Authorization: "Bearer ***"}
Response status: 201
Product added successfully: {...}
```

### Step 4: Common Issues

#### Issue 1: "You are not logged in"
**Solution:** 
- Log out and log back in as seller
- Check if token exists: `localStorage.getItem('token')` in console

#### Issue 2: "API configuration error"
**Solution:**
- Check if API_BASE is defined: `window.API_BASE` in console
- Refresh the page

#### Issue 3: "Failed to add product. Status: 401"
**Solution:**
- Token expired or invalid
- Log out and log back in

#### Issue 4: "Failed to add product. Status: 403"
**Solution:**
- You're not logged in as a seller
- Check your role: `JSON.parse(localStorage.getItem('user')).role`

#### Issue 5: "Failed to add product. Status: 400"
**Solution:**
- Check the error message in console
- Usually means missing or invalid fields
- Make sure category is selected (not empty)

#### Issue 6: Network Error / CORS Error
**Solution:**
- Make sure backend server is running on port 3000
- Check: `http://localhost:3000/api/categories` in browser

## Test the API Directly

Open this in browser: `http://localhost:3000/test-add-product.html`

This will test the add product API directly without the form.

## Manual API Test

Open browser console and run:

```javascript
// Login first
const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username: 'seller1', password: 'password123'})
});
const loginData = await loginRes.json();
const token = loginData.token;

// Add product
const addRes = await fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        name: 'Test Product',
        category: 'Spice Kits',
        price: 199,
        description: 'Test',
        stock: 10
    })
});
const addData = await addRes.json();
console.log('Result:', addData);
```

## Files Modified

1. `frontend/seller.js` - Enhanced addProduct() function
2. `frontend/seller.html` - Added type="button" to buttons

## Next Steps

If it still fails:
1. Check browser console for exact error
2. Check Network tab in DevTools to see the API request
3. Share the error message from console
