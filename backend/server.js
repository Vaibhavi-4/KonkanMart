const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require("multer");
const crypto = require('crypto');
// const nodemailer = require('nodemailer');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const { Resend } = require('resend');
// const sendEmail = require('./utils/sendEmail');


const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'konkan-mart-secret-key-change-in-production';
const resend = new Resend(process.env.RESEND_API_KEY);
// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Helper function to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


// Helper function to check role
function checkRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

// Helper to convert ObjectId to string for response
function formatResponse(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  if (obj.sellerId && obj.sellerId._id) {
    obj.sellerId = obj.sellerId._id.toString();
  }
  if (obj.buyerId && obj.buyerId._id) {
    obj.buyerId = obj.buyerId._id.toString();
  }
  if (obj.userId && obj.userId._id) {
    obj.userId = obj.userId._id.toString();
  }
  if (obj.productId && obj.productId._id) {
    obj.productId = obj.productId._id.toString();
  }
  if (obj.items) {
    obj.items = obj.items.map(item => {
      if (item.productId && item.productId._id) {
        item.productId = item.productId._id.toString();
      }
      return item;
    });
  }
  return obj;
}

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role, name, businessName, contactInfo, paymentInfo } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (password.length < 6) {
  return res.status(400).json({ error: 'Password must be at least 6 characters' });
}


    if (!['buyer', 'seller'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be buyer or seller' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      username,
      email,
      password: hashedPassword,
      role,
      name: name || username
    };

    if (role === 'seller') {
      userData.businessName = businessName;
      userData.contactInfo = contactInfo;
      userData.paymentInfo = paymentInfo;
    }

    const newUser = await User.create(userData);

    // Create empty cart for buyer
    if (role === 'buyer') {
      await Cart.create({ userId: newUser._id, items: [] });
    }

    const token = jwt.sign({ 
      id: newUser._id.toString(), 
      username: newUser.username, 
      role: newUser.role 
    }, JWT_SECRET);

    res.json({ 
      token, 
      user: { 
        id: newUser._id.toString(), 
        username: newUser.username, 
        role: newUser.role, 
        name: newUser.name 
      } 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const username = req.body.username?.trim();
const password = req.body.password?.trim();


    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    if (password.length < 6) {
  return res.status(401).json({ error: 'Invalid credentials' });
}


    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ 
      id: user._id.toString(), 
      username: user.username, 
      role: user.role 
    }, JWT_SECRET);

    res.json({ 
      token, 
      user: { 
        id: user._id.toString(), 
        username: user.username, 
        role: user.role, 
        name: user.name 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: 'If email exists, reset link sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/forgotPassword.html?token=${token}`;
// console.log("CLIENT_URL:", process.env.CLIENT_URL);
// console.log("Reset link:", resetLink);
    try {
      await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: user.email,
  subject: 'Konkan Mart Password Reset',
  html: `
    <h3>Password Reset</h3>
    <a href="${resetLink}">${resetLink}</a>
  `
});
      console.log("Mail sent");
    } catch (mailError) {
      console.error("MAIL ERROR:", mailError);
    }

    return res.json({ message: 'If email exists, reset link sent.' });

  } catch (error) {
    console.error("MAIN ERROR:", error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

// app.get("/test-email", async (req, res) => {
//   try {
//     const info = await transporter.sendMail({
//       from: "cvaibhavi4444@gmail.com",
//       to: "cvaibhavi4444@gmail.com",
//       subject: "Direct Test Email",
//       html: "<h1>If you see this, Gmail works</h1>"
//     });

//     console.log("EMAIL SUCCESS:", info.response);
//     res.send("Email sent successfully");
//   } catch (err) {
//     console.error("EMAIL FAILED:", err);
//     res.status(500).send("Email failed");
//   }
// });
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
console.log("Token received:", token);

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: 'Password reset successful' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Reset failed' });
  }
});


// Update user profile
app.put('/api/users/:id', verifyToken, upload.single("profilePhoto"), async (req, res) => {

  try {
    const userId = req.params.id;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, email, phone, password } = req.body;

    const updateData = {};

if (name) updateData.name = name;
if (email) updateData.email = email;


    if (phone) updateData.contactInfo = phone; // FIX: phone mapping

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (req.file) {
  updateData.profilePhoto = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
}

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true } // optional but safer
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.contactInfo || ""
      }
    });

  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get current user
app.get('/api/users/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        contactInfo: user.contactInfo || "",
        profilePhoto: user.profilePhoto || "" 
        
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).populate('sellerId', 'businessName contactInfo paymentInfo');

    const productsWithSeller = products.map(product => {
      const productObj = formatResponse(product);
      if (product.sellerId) {
        productObj.seller = {
          businessName: product.sellerId.businessName,
          contactInfo: product.sellerId.contactInfo,
          paymentInfo: product.sellerId.paymentInfo
        };
        productObj.sellerId = product.sellerId._id.toString();
      }
      return productObj;
    });

    res.json(productsWithSeller);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'businessName contactInfo paymentInfo');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const productObj = formatResponse(product);
    if (product.sellerId) {
      productObj.seller = {
        businessName: product.sellerId.businessName,
        contactInfo: product.sellerId.contactInfo,
        paymentInfo: product.sellerId.paymentInfo
      };
    }
    res.json(productObj);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', verifyToken, checkRole('seller'), async (req, res) => {
  try {
    
      if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
     if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ error: "Invalid seller ID" });
    }


    let { name, category, price, description, stock, image } = req.body;

    if (!name || !category || !price || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    name = name.trim();
    description = description.trim();

    // ✅ LIMITS
    if (name.length > 80)
      return res.status(400).json({ error: 'Product name too long (max 80 chars)' });

    if (description.length > 300)
      return res.status(400).json({ error: 'Description too long (max 300 chars)' });

    price = parseFloat(price);
    stock = parseInt(stock);

    if (isNaN(price) || price <= 0 || price > 1000000)
      return res.status(400).json({ error: 'Invalid price range' });

    if (isNaN(stock) || stock < 1 || stock > 10000)
      return res.status(400).json({ error: 'Stock must be between 1 and 10000' });


    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    // ✅ Check for duplicate product by same seller
    const existingProduct = await Product.findOne({ sellerId, name: name.trim() });
    if (existingProduct) {
      return res.status(400).json({ error: 'You already have this product. Update the stock instead.' });
    }

    const newProduct = await Product.create({
      sellerId,
      name: name.trim(),
      category,
      price: parseFloat(price),
      description,
      stock: stock || 0,
      image: image || null
    });

    res.status(201).json(formatResponse(newProduct));

  } catch (error) {
    console.error('Create product error:', error);

    // Handle Mongo duplicate key error if you also added schema-level unique index
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You already have this product. Update the stock instead.' });
    }

    res.status(500).json({ error: 'Failed to create product' });
  }
});


app.put('/api/products/:id', verifyToken, checkRole('seller'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.sellerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not your product' });
    }

    let { name, category, price, description, stock, image } = req.body;

    if (!name || !category || !price || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    name = name.trim();
    description = description.trim();

    // ✅ LIMITS
    if (name.length > 80)
      return res.status(400).json({ error: 'Product name too long (max 80 chars)' });

    if (description.length > 300)
      return res.status(400).json({ error: 'Description too long (max 300 chars)' });

    price = parseFloat(price);
    stock = parseInt(stock);

    if (isNaN(price) || price <= 0 || price > 1000000)
      return res.status(400).json({ error: 'Invalid price range' });

    if (isNaN(stock) || stock < 1 || stock > 10000)
      return res.status(400).json({ error: 'Stock must be between 1 and 10000' });

    product.name = name;
    product.category = category;
    product.price = price;
    product.description = description;
    product.stock = stock;
    product.image = image || null;

    await product.save();

    res.json(formatResponse(product));

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});


app.delete('/api/products/:id', verifyToken, checkRole('seller'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not your product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Cart Routes
app.get('/api/cart', verifyToken, checkRole('buyer'), async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      cart = await Cart.create({ userId: userId, items: [] });
    }
    res.json(cart.items || []);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.post('/api/cart', verifyToken, checkRole('buyer'), async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const requestedQuantity = parseInt(quantity);
    if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    // Convert user ID string to ObjectId
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      cart = await Cart.create({ userId: userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId.toString());
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    const totalRequestedQuantity = currentCartQuantity + requestedQuantity;

    if (totalRequestedQuantity > product.stock) {
      return res.status(400).json({ 
        error: `Insufficient stock. Available: ${product.stock}, Requested: ${totalRequestedQuantity}` 
      });
    }

    if (existingItem) {
      existingItem.quantity = totalRequestedQuantity;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: requestedQuantity
      });
    }

    await cart.save();
    res.json(cart.items);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

app.delete('/api/cart/:productId', verifyToken, checkRole('buyer'), async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId.toString());
    await cart.save();

    res.json(cart.items);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Order Routes
app.post('/api/orders', verifyToken, checkRole('buyer'), async (req, res) => {
  try {
    console.log("Payment Mode received:", req.body.paymentMode); 
    const { deliveryAddress ,paymentMode} = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);
   const cart = await Cart.findOne({ userId: userId });
console.log("Fetched cart:", cart);

if (!cart || !cart.items || cart.items.length === 0) {
  return res.status(400).json({ error: 'Cart is empty' });
}


    if (!deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address required' });
    }

    // Group items by seller and validate stock
    const ordersBySeller = {};
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      
      
      // Validate stock before creating order
      if (item.quantity > product.stock) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }
      
      const sellerId = product.sellerId.toString();
      if (!ordersBySeller[sellerId]) {
        ordersBySeller[sellerId] = [];
      }
      ordersBySeller[sellerId].push({
        productId: product._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      });
    }

    // ✅ DECREASE STOCK WHEN ORDER IS PLACED
for (const item of cart.items) {
  const product = await Product.findById(item.productId);

  if (!product) continue;

  if (product.stock < item.quantity) {
    return res.status(400).json({ 
      error: `Insufficient stock for ${product.name}` 
    });
  }

  product.stock = product.stock - item.quantity;
  await product.save();
}


// console.log("ORDER BODY:", req.body);

    // Create orders for each seller
    const createdOrders = [];
    for (const [sellerId, items] of Object.entries(ordersBySeller)) {
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const seller = await User.findById(sellerId);

      const buyerId = new mongoose.Types.ObjectId(req.user.id);
      const order = await Order.create({
        buyerId: buyerId,
        sellerId: new mongoose.Types.ObjectId(sellerId),
        items: items,
        totalAmount,
        deliveryAddress,
        status: 'pending',
        paymentStatus: 'pending',
       paymentMode: req.body.paymentMode || "ONLINE"
      });

      const orderObj = formatResponse(order);
      if (seller) {
        orderObj.seller = {
          businessName: seller.businessName,
          contactInfo: seller.contactInfo,
          paymentInfo: seller.paymentInfo
        };
      }

      createdOrders.push(orderObj);
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(createdOrders);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// JSON payment submission (screenshot as base64, no multipart/form-data)
app.post("/api/orders/payment-json", verifyToken, checkRole('buyer'), async (req, res) => {
  try {
    const { orderId, screenshot, paymentMode } = req.body;


    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    if (paymentMode === "ONLINE" && (!screenshot || typeof screenshot !== "string")) {
  return res.status(400).json({ error: "Payment screenshot is required for online payment" });
}

    const order = await Order.findOneAndUpdate(
  { _id: orderId, buyerId: req.user.id },
  {
    paymentProof: paymentMode === "ONLINE" ? screenshot : null,
    paymentStatus: paymentMode === "COD" ? "pending" : "uploaded",
    paymentMode: paymentMode || "ONLINE"
  },
  { new: true }
);


    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, order });

  } catch (err) {
    console.error("Payment upload error:", err);
    res.status(500).json({ error: "Failed to upload payment" });
  }
});


app.get('/api/orders', verifyToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'buyer') {
      query.buyerId = new mongoose.Types.ObjectId(req.user.id);
    } else if (req.user.role === 'seller') {
      query.sellerId = new mongoose.Types.ObjectId(req.user.id);
    }

    const orders = await Order.find(query).populate('sellerId', 'businessName contactInfo paymentInfo');

    const ordersWithSeller = orders.map(order => {
      const orderObj = formatResponse(order);
      if (order.sellerId) {
        orderObj.seller = {
          businessName: order.sellerId.businessName,
          contactInfo: order.sellerId.contactInfo,
          paymentInfo: order.sellerId.paymentInfo
        };
        orderObj.sellerId = order.sellerId._id.toString();
      }
      return orderObj;
    });

    res.json(ordersWithSeller);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('sellerId', 'businessName contactInfo paymentInfo');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check access
    if (req.user.role === 'buyer' && order.buyerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'seller' && order.sellerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const orderObj = formatResponse(order);
    if (order.sellerId) {
      orderObj.seller = {
        businessName: order.sellerId.businessName,
        contactInfo: order.sellerId.contactInfo,
        paymentInfo: order.sellerId.paymentInfo
      };
    }

    res.json(orderObj);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.put('/api/orders/:id/approve', verifyToken, checkRole('seller'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.sellerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not your order' });
    }

    if (order.status === 'approved') {
      return res.status(400).json({ error: 'Order is already approved' });
    }

    // Validate stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });
      if (item.quantity > product.stock) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.name}. Available: ${product.stock}, Ordered: ${item.quantity}` 
        });
      }
    }

    // Update order status
    order.status = 'approved';
    order.paymentStatus = 'paid';
    order.estimatedShipDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await order.save();

    // Send email safely
    // try {
    //   const buyer = await User.findById(order.buyerId);
    //   if (buyer?.email) {
    //     await sendEmail(
    //       buyer.email,
    //       `Order #${order._id} Approved `,
    //       `Hello ${buyer.name},\n\nYour order #${order._id} has been approved by the seller.\nPayment status: ${order.paymentStatus}\nExpected delivery: 3–4 days.\n\nThank you for shopping with Konkan Mart!`
    //     );
    //   }
    // } catch (emailErr) {
    //   console.error("Email send failed, but order still approved:", emailErr);
    // }

    // Return single response
    res.json({
      success: true,
      message: 'Order approved successfully',
      order: formatResponse(order)
    });

  } catch (error) {
    console.error('Approve order error:', error);
    res.status(500).json({ error: 'Failed to approve order' });
  }
});


app.put('/api/orders/:id/tracking', verifyToken, checkRole('seller'), async (req, res) => {
  try {
    const { partnerNumber, courierAgency, trackingId } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.sellerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not your order' });
    }

    order.partnerNumber = partnerNumber;
    order.courierAgency = courierAgency;
    order.trackingId = trackingId || null;
    order.status = 'shipped';
order.shippedAt = new Date();
order.estimatedShipDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // +3 days



    await order.save();
    // Send email to buyer
// const buyer = await User.findById(order.buyerId);
// if (buyer?.email) {
//   const deliveryDate = order.estimatedShipDate ? new Date(order.estimatedShipDate).toDateString() : "In 3–4 days";
//   sendEmail(
//     buyer.email,
//     `Order #${order.id} Shipped 🚚`,
//     `Hello ${buyer.name},\n\nYour order #${order.id} has been shipped via ${order.courierAgency || 'N/A'}.\nTracking ID: ${order.trackingId || 'N/A'}\nExpected Delivery: ${deliveryDate}\n\nThank you for shopping with Konkan Mart!`
//   );
// }

    res.json(formatResponse(order));
  } catch (error) {
    console.error('Add tracking error:', error);
    res.status(500).json({ error: 'Failed to add tracking' });
  }
});


// Admin Routes
app.get('/api/admin/overview', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const approvedOrders = await Order.countDocuments({ status: 'approved' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });

    res.json({
      totalUsers,
      totalBuyers,
      totalSellers,
      totalProducts,
      totalOrders,
      pendingOrders,
      approvedOrders,
      shippedOrders
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

app.get('/api/admin/users', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}, 'username email role name createdAt');
    res.json(users.map(user => formatResponse(user)));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get categories
app.get('/api/categories', (req, res) => {
  const categories = [
    
    'Coastal Curry Mixes',
    'Kokum & Masala Blends',
    'Traditional Spice Combos',
    'Ready to Cook Sauces',
    'Fish Curry Base',
    'Veg & Coconut Gravies',
    'Special Spice Pastes',
    'Bamboo & Cane Work',
    'Clay & Terracotta Items',
    'Decor & Utility Crafts'
  ];
  res.json(categories);
});

// Start server
app.listen(PORT, () => {
  console.log(`Konkan Mart backend running on port ${PORT}`);
  console.log(`MongoDB: Make sure MongoDB is running on mongodb://localhost:27017`);
});
