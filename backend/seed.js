const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const connectDB = require('./config/database');

async function seedDatabase() {
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('✓ Connected\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
    console.log('✓ Cleared\n');

    // Create users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const buyer = await User.create({
      username: 'buyer1',
      email: 'buyer1@konkanmart.com',
      password: hashedPassword,
      role: 'buyer',
      name: 'John Buyer'
    });

    const seller = await User.create({
      username: 'seller1',
      email: 'seller1@konkanmart.com',
      password: hashedPassword,
      role: 'seller',
      name: 'Spice Master',
      businessName: 'Konkan Spice House',
      contactInfo: 'Phone: +91-9876543210',
      paymentInfo: 'Bank: SBI, A/C: 1234567890'
    });

    const admin = await User.create({
      username: 'admin',
      email: 'admin@konkanmart.com',
      password: hashedPassword,
      role: 'admin',
      name: 'Admin User'
    });
    console.log('✓ Created 3 users\n');

    // Create products
    console.log('Creating products...');
    const products = await Product.insertMany([
      {
        sellerId: seller._id,
        name: 'Goan Fish Curry Spice Mix',
        category: 'Fish Curry Base',
        price: 299,
        description: 'Authentic Goan fish curry spice blend with kokum and coconut',
        stock: 50
      },
      {
        sellerId: seller._id,
        name: 'Coastal Masala Blend',
        category: 'Coastal Curry Mixes',
        price: 199,
        description: 'Traditional coastal curry masala for authentic taste',
        stock: 75
      },
      {
        sellerId: seller._id,
        name: 'Kokum & Tamarind Paste',
        category: 'Kokum & Masala Blends',
        price: 149,
        description: 'Tangy kokum and tamarind paste for curries',
        stock: 100
      },
      {
        sellerId: seller._id,
        name: 'Bamboo Serving Tray',
        category: 'Bamboo & Cane Work',
        price: 599,
        description: 'Handcrafted bamboo serving tray',
        stock: 25
      },
      {
        sellerId: seller._id,
        name: 'Terracotta Pot Set',
        category: 'Clay & Terracotta Items',
        price: 899,
        description: 'Set of 3 traditional terracotta pots',
        stock: 15
      }
    ]);
    console.log('✓ Created 5 products\n');

    // Create sample order
    console.log('Creating sample order...');
    await Order.create({
      buyerId: buyer._id,
      sellerId: seller._id,
      items: [{
        productId: products[0]._id,
        name: 'Goan Fish Curry Spice Mix',
        quantity: 2,
        price: 299
      }],
      totalAmount: 598,
      deliveryAddress: '123 Main St, Mumbai, Maharashtra 400001',
      status: 'pending',
      paymentStatus: 'pending'
    });
    console.log('✓ Created 1 order\n');

    // Create cart for buyer
    await Cart.create({
      userId: buyer._id,
      items: []
    });

    // Summary
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();

    console.log('='.repeat(50));
    console.log('✅ Database seeded successfully!');
    console.log('='.repeat(50));
    console.log(`Users: ${userCount}`);
    console.log(`Products: ${productCount}`);
    console.log(`Orders: ${orderCount}`);
    console.log('\nDemo Credentials:');
    console.log('  Buyer:  buyer1   / password123');
    console.log('  Seller: seller1  / password123');
    console.log('  Admin:  admin    / password123');
    console.log('='.repeat(50));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

seedDatabase();
