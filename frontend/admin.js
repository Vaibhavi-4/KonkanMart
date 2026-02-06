// API base URL - use global from auth.js (loaded first)
// Reference window.API_BASE directly to avoid redeclaration
const API_BASE = window.API_BASE || 'http://localhost:3000/api';

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadOverview();
    await loadUsers();
    await loadProducts();
    await loadOrders();
});

// Load overview
async function loadOverview() {
    try {
        const response = await fetch(`${API_BASE}/admin/overview`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) return;
        
        const overview = await response.json();
        
        document.getElementById('totalUsers').textContent = overview.totalUsers;
        document.getElementById('totalBuyers').textContent = overview.totalBuyers;
        document.getElementById('totalSellers').textContent = overview.totalSellers;
        document.getElementById('totalProducts').textContent = overview.totalProducts;
        document.getElementById('totalOrders').textContent = overview.totalOrders;
        document.getElementById('pendingOrders').textContent = overview.pendingOrders;
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) return;
        
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Display users
function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    if (users.length === 0) {
        usersList.innerHTML = '<p>No users</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            ${users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.name}</td>
                    <td><span class="order-status status-${user.role}">${user.role}</span></td>
                    <td>${new Date(user.createdAt).toLocaleString()}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    usersList.appendChild(table);
}

// Load products
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products
function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';
    
    if (products.length === 0) {
        productsList.innerHTML = '<p>No products</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Seller ID</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            ${products.map(product => `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>₹${product.price}</td>
                    <td>${product.stock}</td>
                    <td>${product.sellerId}</td>
                    <td>${new Date(product.createdAt).toLocaleString()}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    productsList.appendChild(table);
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) return;
        
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Display orders
function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p>No orders</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Buyer ID</th>
                <th>Seller ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Tracking</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            ${orders.map(order => `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.buyerId}</td>
                    <td>${order.sellerId}</td>
                    <td>${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                    <td>₹${order.totalAmount}</td>
                    <td><span class="order-status status-${order.status}">${order.status}</span></td>
                    <td>${order.paymentStatus}</td>
                    <td>${order.trackingId || 'N/A'}</td>
                    <td>${new Date(order.createdAt).toLocaleString()}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    ordersList.appendChild(table);
}
