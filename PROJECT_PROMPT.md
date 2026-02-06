# Konkan Mart - Project Creation Prompt

## Prompt for AI/Developer

Build a working full-stack POC e-commerce app called "Konkan Mart" using Node.js + JavaScript.

### Requirements

**Single repo with:**
- `/backend` → Node.js + Express
- `/frontend` → HTML, CSS, Vanilla JS

**Use in-memory data store (JS arrays/objects)**

**Preload sample data:**
- Sample users (buyer1, seller1, admin - all password: password123)
- Sample products (5+ products across categories)
- Sample orders (1 order)

**Simple auth (JWT) with role-based access**

### Roles & Flows

**Buyer:**
- Register / Login
- Browse & search products
- Add to cart (with stock validation)
- Enter delivery address
- Place order
- Payment handled offline
- View order status & delivery tracking
- See seller contact info on products and orders

**Seller:**
- Register as business / Login (with businessName, contactInfo, paymentInfo)
- Add products (name, category, price, description, stock)
- View orders
- Approve order after payment
- Add courier & tracking ID
- Seller contact info visible to buyers

**Admin:**
- Login only
- View all users, products, and orders
- Dashboard counts (POC level)

### Product Categories (Seed Data)
1. Spice Kits
2. Coastal Curry Mixes
3. Kokum & Masala Blends
4. Traditional Spice Combos
5. Ready to Cook Sauces
6. Fish Curry Base
7. Veg & Coconut Gravies
8. Special Spice Pastes
9. Bamboo & Cane Work
10. Clay & Terracotta Items
11. Decor & Utility Crafts

### Backend APIs

**Auth:**
- POST /api/auth/register (buyer/seller)
- POST /api/auth/login

**Products:**
- GET /api/products (with seller info)
- GET /api/products/:id
- POST /api/products (seller only)
- PUT /api/products/:id (seller only)
- DELETE /api/products/:id (seller only)
- GET /api/categories

**Cart:**
- GET /api/cart (buyer)
- POST /api/cart (buyer, with stock validation)
- DELETE /api/cart/:productId (buyer)

**Orders:**
- POST /api/orders (buyer, includes seller info)
- GET /api/orders (role-based, includes seller info)
- GET /api/orders/:id (includes seller info)
- PUT /api/orders/:id/approve (seller)
- PUT /api/orders/:id/tracking (seller)

**Admin:**
- GET /api/admin/overview
- GET /api/admin/users

### Frontend Pages

- `index.html` - Login / Register
- `buyer.html` - Buyer dashboard (products, cart, orders, seller info)
- `seller.html` - Seller dashboard (products CRUD, orders, approve, tracking)
- `admin.html` - Admin dashboard (overview, users, products, orders)

**Use fetch() for API calls**

### Key Features

- Stock validation when adding to cart
- Seller contact info visible on products and orders
- JWT authentication with role-based access
- In-memory data store
- Responsive UI
- Clean, commented code

### Output Expectations

- Clear folder structure
- Working backend + frontend
- Seed data included
- Run instructions
- Clean, commented, readable code

**Do not over-engineer. Focus on a working demo.**
