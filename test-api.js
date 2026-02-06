// Test script for Konkan Mart API
const http = require('http');

const API_BASE = 'http://localhost:3000/api';

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Konkan Mart API...\n');

  try {
    // Test 1: Get categories
    console.log('1. Testing GET /api/categories');
    const categories = await makeRequest('/api/categories');
    console.log(`   Status: ${categories.status}`);
    console.log(`   Result: ${categories.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    if (categories.status === 200) {
      console.log(`   Categories: ${categories.data.length} found\n`);
    } else {
      console.log(`   Error: ${JSON.stringify(categories.data)}\n`);
    }

    // Test 2: Get products
    console.log('2. Testing GET /api/products');
    const products = await makeRequest('/api/products');
    console.log(`   Status: ${products.status}`);
    console.log(`   Result: ${products.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    if (products.status === 200) {
      console.log(`   Products: ${products.data.length} found\n`);
    } else {
      console.log(`   Error: ${JSON.stringify(products.data)}\n`);
    }

    // Test 3: Register buyer
    console.log('3. Testing POST /api/auth/register (buyer)');
    const registerBuyer = await makeRequest('/api/auth/register', 'POST', {
      username: 'testbuyer',
      email: 'testbuyer@test.com',
      password: 'test123',
      role: 'buyer',
      name: 'Test Buyer'
    });
    console.log(`   Status: ${registerBuyer.status}`);
    console.log(`   Result: ${registerBuyer.status === 200 || registerBuyer.status === 201 ? '✅ PASS' : '❌ FAIL'}`);
    let buyerToken = null;
    if (registerBuyer.status === 200) {
      buyerToken = registerBuyer.data.token;
      console.log(`   Token received: ${buyerToken ? 'Yes' : 'No'}\n`);
    } else {
      console.log(`   Error: ${JSON.stringify(registerBuyer.data)}\n`);
    }

    // Test 4: Login
    console.log('4. Testing POST /api/auth/login');
    const login = await makeRequest('/api/auth/login', 'POST', {
      username: 'buyer1',
      password: 'password123'
    });
    console.log(`   Status: ${login.status}`);
    console.log(`   Result: ${login.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    let token = null;
    if (login.status === 200) {
      token = login.data.token;
      console.log(`   Token received: ${token ? 'Yes' : 'No'}\n`);
    } else {
      console.log(`   Error: ${JSON.stringify(login.data)}\n`);
    }

    if (!token) {
      console.log('❌ Cannot continue tests without authentication token\n');
      return;
    }

    // Test 5: Get cart
    console.log('5. Testing GET /api/cart');
    const cart = await makeRequest('/api/cart', 'GET', null, token);
    console.log(`   Status: ${cart.status}`);
    console.log(`   Result: ${cart.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    if (cart.status === 200) {
      console.log(`   Cart items: ${cart.data.length}\n`);
    } else {
      console.log(`   Error: ${JSON.stringify(cart.data)}\n`);
    }

    // Test 6: Add to cart
    console.log('6. Testing POST /api/cart');
    const addToCart = await makeRequest('/api/cart', 'POST', {
      productId: 1,
      quantity: 2
    }, token);
    console.log(`   Status: ${addToCart.status}`);
    console.log(`   Result: ${addToCart.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    if (addToCart.status !== 200) {
      console.log(`   Error: ${JSON.stringify(addToCart.data)}\n`);
    } else {
      console.log(`   Cart updated\n`);
    }

    // Test 7: Get orders
    console.log('7. Testing GET /api/orders');
    const orders = await makeRequest('/api/orders', 'GET', null, token);
    console.log(`   Status: ${orders.status}`);
    console.log(`   Result: ${orders.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    if (orders.status === 200) {
      console.log(`   Orders: ${orders.data.length} found\n`);
    } else {
      console.log(`   Error: ${JSON.stringify(orders.data)}\n`);
    }

    // Test 8: Login as seller
    console.log('8. Testing login as seller');
    const sellerLogin = await makeRequest('/api/auth/login', 'POST', {
      username: 'seller1',
      password: 'password123'
    });
    console.log(`   Status: ${sellerLogin.status}`);
    console.log(`   Result: ${sellerLogin.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    let sellerToken = null;
    if (sellerLogin.status === 200) {
      sellerToken = sellerLogin.data.token;
      console.log(`   Seller token received: ${sellerToken ? 'Yes' : 'No'}\n`);
    } else {
      console.log(`   Error: ${JSON.stringify(sellerLogin.data)}\n`);
    }

    if (sellerToken) {
      // Test 9: Create product (seller)
      console.log('9. Testing POST /api/products (seller)');
      const createProduct = await makeRequest('/api/products', 'POST', {
        name: 'Test Product',
        category: 'Spice Kits',
        price: 199,
        description: 'Test product description',
        stock: 10
      }, sellerToken);
      console.log(`   Status: ${createProduct.status}`);
      console.log(`   Result: ${createProduct.status === 200 || createProduct.status === 201 ? '✅ PASS' : '❌ FAIL'}`);
      if (createProduct.status !== 200 && createProduct.status !== 201) {
        console.log(`   Error: ${JSON.stringify(createProduct.data)}\n`);
      } else {
        console.log(`   Product created\n`);
      }
    }

    // Test 10: Login as admin
    console.log('10. Testing login as admin');
    const adminLogin = await makeRequest('/api/auth/login', 'POST', {
      username: 'admin',
      password: 'password123'
    });
    console.log(`   Status: ${adminLogin.status}`);
    console.log(`   Result: ${adminLogin.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    let adminToken = null;
    if (adminLogin.status === 200) {
      adminToken = adminLogin.data.token;
      console.log(`   Admin token received: ${adminToken ? 'Yes' : 'No'}\n`);
    } else {
      console.log(`   Error: ${JSON.stringify(adminLogin.data)}\n`);
    }

    if (adminToken) {
      // Test 11: Admin overview
      console.log('11. Testing GET /api/admin/overview');
      const overview = await makeRequest('/api/admin/overview', 'GET', null, adminToken);
      console.log(`   Status: ${overview.status}`);
      console.log(`   Result: ${overview.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
      if (overview.status === 200) {
        console.log(`   Overview data received: ${JSON.stringify(overview.data)}\n`);
      } else {
        console.log(`   Error: ${JSON.stringify(overview.data)}\n`);
      }
    }

    console.log('✅ All tests completed!\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error('   Make sure the server is running on http://localhost:3000');
  }
}

// Wait a bit for server to start, then run tests
setTimeout(() => {
  runTests();
}, 2000);
