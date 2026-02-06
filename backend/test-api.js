// Use built-in fetch (Node 18+) or require node-fetch for older versions
const fetch = globalThis.fetch || require('node-fetch');

const API_BASE = 'http://localhost:3000/api';
let buyerToken = '';
let sellerToken = '';
let adminToken = '';
let testProductId = '';
let testOrderId = '';

// Test results
const results = {
    passed: 0,
    failed: 0,
    errors: []
};

function log(message) {
    console.log(`[TEST] ${message}`);
}

function assert(condition, message) {
    if (condition) {
        results.passed++;
        log(`✓ ${message}`);
    } else {
        results.failed++;
        results.errors.push(message);
        log(`✗ ${message}`);
    }
}

async function test(name, fn) {
    try {
        log(`\n--- ${name} ---`);
        await fn();
    } catch (error) {
        results.failed++;
        results.errors.push(`${name}: ${error.message}`);
        log(`✗ ${name} - Error: ${error.message}`);
    }
}

// Authentication Tests
async function testAuth() {
    await test('Register Buyer', async () => {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testbuyer',
                email: 'testbuyer@test.com',
                password: 'test123',
                role: 'buyer',
                name: 'Test Buyer'
            })
        });
        const data = await response.json();
        assert(response.ok || data.error, 'Buyer registration');
    });

    await test('Register Seller', async () => {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testseller',
                email: 'testseller@test.com',
                password: 'test123',
                role: 'seller',
                name: 'Test Seller',
                businessName: 'Test Business',
                contactInfo: 'Phone: 1234567890',
                paymentInfo: 'Bank: Test Bank'
            })
        });
        const data = await response.json();
        assert(response.ok || data.error, 'Seller registration');
    });

    await test('Login Buyer', async () => {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'buyer1',
                password: 'password123'
            })
        });
        const data = await response.json();
        assert(response.ok && data.token, 'Buyer login');
        if (data.token) buyerToken = data.token;
    });

    await test('Login Seller', async () => {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'seller1',
                password: 'password123'
            })
        });
        const data = await response.json();
        assert(response.ok && data.token, 'Seller login');
        if (data.token) sellerToken = data.token;
    });

    await test('Login Admin', async () => {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'password123'
            })
        });
        const data = await response.json();
        assert(response.ok && data.token, 'Admin login');
        if (data.token) adminToken = data.token;
    });
}

// Product Tests
async function testProducts() {
    await test('Get All Products', async () => {
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        assert(Array.isArray(products) && products.length > 0, 'Get products returns array');
    });

    await test('Get Products with Category Filter', async () => {
        const response = await fetch(`${API_BASE}/products?category=Fish%20Curry%20Base`);
        const products = await response.json();
        assert(Array.isArray(products), 'Category filter works');
    });

    await test('Get Products with Search', async () => {
        const response = await fetch(`${API_BASE}/products?search=Goan`);
        const products = await response.json();
        assert(Array.isArray(products), 'Search works');
    });

    await test('Get Categories', async () => {
        const response = await fetch(`${API_BASE}/categories`);
        const categories = await response.json();
        assert(Array.isArray(categories) && categories.length > 0, 'Get categories');
    });

    await test('Create Product (Seller)', async () => {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sellerToken}`
            },
            body: JSON.stringify({
                name: 'Test Product',
                category: 'Spice Kits',
                price: 199,
                description: 'Test description',
                stock: 10
            })
        });
        const product = await response.json();
        assert(response.ok && product.id, 'Create product');
        if (product.id) testProductId = product.id;
    });

    await test('Get Product by ID', async () => {
        if (!testProductId) return;
        const response = await fetch(`${API_BASE}/products/${testProductId}`);
        const product = await response.json();
        assert(response.ok && product.id === testProductId, 'Get product by ID');
    });

    await test('Update Product (Seller)', async () => {
        if (!testProductId) return;
        const response = await fetch(`${API_BASE}/products/${testProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sellerToken}`
            },
            body: JSON.stringify({
                name: 'Updated Test Product',
                price: 299
            })
        });
        assert(response.ok, 'Update product');
    });
}

// Cart Tests
async function testCart() {
    await test('Get Cart (Buyer)', async () => {
        const response = await fetch(`${API_BASE}/cart`, {
            headers: { 'Authorization': `Bearer ${buyerToken}` }
        });
        const cart = await response.json();
        assert(Array.isArray(cart), 'Get cart returns array');
    });

    await test('Add to Cart (Buyer)', async () => {
        // First get a product ID
        const productsResponse = await fetch(`${API_BASE}/products`);
        const products = await productsResponse.json();
        if (products.length === 0) {
            log('No products available for cart test');
            return;
        }
        const productId = products[0].id;

        const response = await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${buyerToken}`
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });
        const cart = await response.json();
        assert(response.ok && Array.isArray(cart), 'Add to cart');
    });

    await test('Remove from Cart (Buyer)', async () => {
        const productsResponse = await fetch(`${API_BASE}/products`);
        const products = await productsResponse.json();
        if (products.length === 0) return;
        const productId = products[0].id;

        const response = await fetch(`${API_BASE}/cart/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${buyerToken}` }
        });
        assert(response.ok, 'Remove from cart');
    });
}

// Order Tests
async function testOrders() {
    await test('Create Order (Buyer)', async () => {
        // First add item to cart
        const productsResponse = await fetch(`${API_BASE}/products`);
        const products = await productsResponse.json();
        if (products.length === 0) return;
        
        await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${buyerToken}`
            },
            body: JSON.stringify({
                productId: products[0].id,
                quantity: 1
            })
        });

        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${buyerToken}`
            },
            body: JSON.stringify({
                deliveryAddress: '123 Test Street, Test City'
            })
        });
        const orders = await response.json();
        assert(response.ok && Array.isArray(orders) && orders.length > 0, 'Create order');
        if (orders.length > 0) testOrderId = orders[0].id;
    });

    await test('Get Orders (Buyer)', async () => {
        const response = await fetch(`${API_BASE}/orders`, {
            headers: { 'Authorization': `Bearer ${buyerToken}` }
        });
        const orders = await response.json();
        assert(Array.isArray(orders), 'Get buyer orders');
    });

    await test('Get Orders (Seller)', async () => {
        const response = await fetch(`${API_BASE}/orders`, {
            headers: { 'Authorization': `Bearer ${sellerToken}` }
        });
        const orders = await response.json();
        assert(Array.isArray(orders), 'Get seller orders');
    });

    await test('Approve Order (Seller)', async () => {
        if (!testOrderId) return;
        const response = await fetch(`${API_BASE}/orders/${testOrderId}/approve`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${sellerToken}` }
        });
        assert(response.ok, 'Approve order');
    });

    await test('Add Tracking (Seller)', async () => {
        if (!testOrderId) return;
        const response = await fetch(`${API_BASE}/orders/${testOrderId}/tracking`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sellerToken}`
            },
            body: JSON.stringify({
                courierInfo: 'Test Courier',
                trackingId: 'TRACK123'
            })
        });
        assert(response.ok, 'Add tracking');
    });
}

// Admin Tests
async function testAdmin() {
    await test('Get Admin Overview', async () => {
        const response = await fetch(`${API_BASE}/admin/overview`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const overview = await response.json();
        assert(response.ok && overview.totalUsers !== undefined, 'Get admin overview');
    });

    await test('Get All Users (Admin)', async () => {
        const response = await fetch(`${API_BASE}/admin/users`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const users = await response.json();
        assert(Array.isArray(users), 'Get all users');
    });
}

// Run all tests
async function runTests() {
    console.log('='.repeat(60));
    console.log('Konkan Mart API Test Suite');
    console.log('='.repeat(60));

    await testAuth();
    await testProducts();
    await testCart();
    await testOrders();
    await testAdmin();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Total: ${results.passed + results.failed}`);

    if (results.errors.length > 0) {
        console.log('\nErrors:');
        results.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n' + '='.repeat(60));
    process.exit(results.failed > 0 ? 1 : 0);
}

// Check if server is running
fetch(`${API_BASE}/categories`)
    .then(() => runTests())
    .catch(err => {
        console.error('Error: Server is not running. Please start the server first:');
        console.error('  cd backend && npm start');
        process.exit(1);
    });
