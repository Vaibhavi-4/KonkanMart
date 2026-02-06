# Konkan Mart - E-commerce POC

A full-stack proof-of-concept e-commerce application for Konkan Mart, featuring authentic Konkan flavors and handcrafted treasures.

## Features

- **Three User Roles:**
  - **Buyer**: Browse products, add to cart, place orders, track deliveries
  - **Seller**: Add/manage products, view and approve orders, add tracking info
  - **Admin**: System overview, view all users, products, and orders

- **Product Categories:**
  - Spice Kits
  - Coastal Curry Mixes
  - Kokum & Masala Blends
  - Traditional Spice Combos
  - Ready to Cook Sauces
  - Fish Curry Base
  - Veg & Coconut Gravies
  - Special Spice Pastes
  - Bamboo & Cane Work
  - Clay & Terracotta Items
  - Decor & Utility Crafts

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **Data Store**: In-memory (JavaScript arrays/objects)

## Project Structure

```
.
├── backend/
│   ├── server.js          # Express server with all APIs
│   └── package.json        # Backend dependencies
├── frontend/
│   ├── index.html          # Login/Register page
│   ├── buyer.html          # Buyer dashboard
│   ├── seller.html         # Seller dashboard
│   ├── admin.html          # Admin dashboard
│   ├── styles.css          # Global styles
│   ├── auth.js             # Authentication logic
│   ├── buyer.js            # Buyer functionality
│   ├── seller.js           # Seller functionality
│   └── admin.js            # Admin functionality
└── README.md
```

## Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Start Server
```bash
npm start
```
Server runs on `http://localhost:3000`

### Step 3: Open Browser
Navigate to: **http://localhost:3000**

That's it! The backend serves the frontend automatically.

**For detailed instructions, see [RUN_INSTRUCTIONS.md](RUN_INSTRUCTIONS.md)**

## Demo Credentials

The application comes with pre-seeded demo accounts:

| Role   | Username | Password     |
|--------|----------|-------------|
| Buyer  | buyer1   | password123 |
| Seller | seller1  | password123 |
| Admin  | admin    | password123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (buyer/seller)
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (with optional query params: category, search)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (seller only)
- `PUT /api/products/:id` - Update product (seller only)
- `DELETE /api/products/:id` - Delete product (seller only)
- `GET /api/categories` - Get all product categories

### Cart
- `GET /api/cart` - Get user's cart (buyer only)
- `POST /api/cart` - Add item to cart (buyer only)
- `DELETE /api/cart/:productId` - Remove item from cart (buyer only)

### Orders
- `POST /api/orders` - Create order (buyer only)
- `GET /api/orders` - Get user's orders (role-based)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/approve` - Approve order (seller only)
- `PUT /api/orders/:id/tracking` - Add tracking info (seller only)

### Admin
- `GET /api/admin/overview` - Get system overview (admin only)
- `GET /api/admin/users` - Get all users (admin only)

## Usage Flow

### Buyer Flow
1. Register/Login as buyer
2. Browse products (search and filter by category)
3. Add products to cart
4. Proceed to checkout and enter delivery address
5. Place order (payment handled offline)
6. View order status and tracking information

### Seller Flow
1. Register/Login as seller (provide business info)
2. Add products with details (name, category, price, description, stock)
3. View incoming orders
4. Approve orders after payment confirmation
5. Add courier and tracking information

### Admin Flow
1. Login as admin
2. View system overview (counts of users, products, orders)
3. View all users, products, and orders in detail

## Seed Data

The application includes pre-loaded sample data:
- 3 users (1 buyer, 1 seller, 1 admin)
- 5 sample products across different categories
- 1 sample order

## Notes

- This is a POC (Proof of Concept) - not production-ready
- Data is stored in-memory and will reset on server restart
- JWT secret key should be changed in production
- Payment processing is simulated (offline)
- No database is used - all data is in JavaScript objects/arrays

## Development

To modify the application:
- Backend logic: `backend/server.js`
- Frontend pages: `frontend/*.html`
- Frontend logic: `frontend/*.js`
- Styling: `frontend/styles.css`

## License

This is a POC project for demonstration purposes.
