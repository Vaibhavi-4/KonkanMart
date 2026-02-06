// API base URL - use global from auth.js (loaded first)
// Reference window.API_BASE directly to avoid redeclaration
const API_BASE = window.API_BASE || 'http://localhost:3000/api';

let editingProductId = null;

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    await loadProducts();
    await loadOrders();
});

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const categories = await response.json();
        
        const categorySelect = document.getElementById('productCategory');
        const editCategorySelect = document.getElementById('editProductCategory');
        
        // Clear existing options except the first one (Select Category)
        while (categorySelect.children.length > 1) {
            categorySelect.removeChild(categorySelect.lastChild);
        }
        while (editCategorySelect.children.length > 0) {
            editCategorySelect.removeChild(editCategorySelect.lastChild);
        }
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option.cloneNode(true));
            editCategorySelect.appendChild(option.cloneNode(true));
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        alert('Failed to load categories. Please refresh the page.');
    }
}

// Load products
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        
        // Filter to show only seller's products
        const auth = checkAuth();
        if (!auth || !auth.user) {
            console.error('Not authenticated');
            return;
        }
        // Compare as strings to handle both ObjectId and string formats
        const myProducts = products.filter(p => String(p.sellerId) === String(auth.user.id));
        displayProducts(myProducts);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products
function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';

    if (products.length === 0) {
        productsList.innerHTML = '<p>No products yet. Add your first product!</p>';
        return;
    }

   products.forEach(product => {
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    productItem.style.display = 'flex';
    productItem.style.alignItems = 'flex-start';
    productItem.style.justifyContent = 'space-between';
    productItem.style.padding = '10px 0';
    productItem.style.borderBottom = '1px solid #ccc';

    productItem.innerHTML = `
        <div style="display:flex; align-items:flex-start; gap:10px;">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width:100px;height:100px;object-fit:cover;">` : ''}
            <div>
                <h3>${product.name}</h3>
                <div style="color: #666; font-size: 14px;">${product.category} | ₹${product.price} | Stock: ${product.stock}</div>
                <div style="color: #666; font-size: 12px; margin-top: 5px;">${product.description}</div>
            </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:5px;">
            <button class="btn-primary" onclick="editProduct('${product.id}')">Edit</button>
            <button class="btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
        </div>
    `;

    productsList.appendChild(productItem);
});


}


// Show add product modal
function showAddProduct() {
    document.getElementById('addProductModal').style.display = 'block';
    // Reset form
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productStock').value = '0';
    // Focus on first field
    document.getElementById('productName').focus();
}

// Close add product modal
function closeAddProduct() {
    document.getElementById('addProductModal').style.display = 'none';
}

// Add product
async function addProduct() {
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = document.getElementById('productPrice').value;
    const description = document.getElementById('productDescription').value.trim();
    const stock = document.getElementById('productStock').value;
    
    // Validation
    if (!name) {
        alert('Please enter product name');
        return;
    }
    
    if (!category || category === '') {
        alert('Please select a category');
        return;
    }
    
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
        alert('Please enter a valid price');
        return;
    }
    
    if (!description) {
        alert('Please enter product description');
        return;
    }
    
    const stockNum = parseInt(stock);
    if (stock === '' || isNaN(stockNum) || stockNum < 0) {
        alert('Please enter a valid stock quantity (0 or greater)');
        return;
    }
    
     // Check existing products first
    const productsListDiv = document.getElementById('productsList');
    const existing = Array.from(productsListDiv.querySelectorAll('h3')).find(h3 => h3.textContent === name);
    if (existing) {
        alert("You already have this product! Update the stock instead.");
        return;
    }

    try {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You are not logged in. Please login again.');
            window.location.href = '/index.html';
            return;
        }

        // Check if API_BASE is defined
        if (!API_BASE) {
            alert('API configuration error. Please refresh the page.');
            console.error('API_BASE is not defined');
            return;
        }

        const image = document.getElementById('productImage').value.trim();

const requestBody = { 
    name, 
    category, 
    price: parseFloat(price), 
    description, 
    stock: stockNum || 0,
    image: image || null   // Add this line
};


        console.log('Adding product:', requestBody);
        console.log('API URL:', `${API_BASE}/products`);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        console.log('Request headers:', { ...headers, 'Authorization': 'Bearer ***' });

        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `Server error: ${response.status} ${response.statusText}` };
            }
            console.error('Add product error:', errorData);
            alert(errorData.error || `Failed to add product. Status: ${response.status}`);
            return;
        }
        
        const newProduct = await response.json();
        console.log('Product added successfully:', newProduct);
        alert('Product added successfully!');
        closeAddProduct();
        await loadProducts();
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product: ' + error.message + '\nPlease check console for details.');
    }
}

// Edit product
async function editProduct(productId) {
    editingProductId = productId;
    
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`);
        const product = await response.json();
        
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductDescription').value = product.description;
        document.getElementById('editProductStock').value = product.stock;
        document.getElementById('editProductImage').value = product.image || '';

        
        document.getElementById('editProductModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Failed to load product');
    }
}

// Close edit product modal
function closeEditProduct() {
    document.getElementById('editProductModal').style.display = 'none';
    editingProductId = null;
}

// Update product
async function updateProduct() {
    if (!editingProductId) return;

    const name = document.getElementById('editProductName').value.trim();
    const category = document.getElementById('editProductCategory').value;
    const price = document.getElementById('editProductPrice').value;
    const description = document.getElementById('editProductDescription').value.trim();
    const stock = document.getElementById('editProductStock').value;
    const image = document.getElementById('editProductImage').value.trim();

    if (!name || !category || !price || !description) return alert('Please fill all required fields');

    try {
        const requestBody = {
            name,
            category,
            price: parseFloat(price),
            description,
            stock: parseInt(stock),
            image: image || null
        };

        const response = await fetch(`${API_BASE}/products/${editingProductId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const data = await response.json();
            return alert(data.error || 'Failed to update product');
        }

        alert('Product updated successfully!');
        closeEditProduct();
        await loadProducts();

    } catch (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product. Check console.');
    }
}


// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Failed to delete product');
            return;
        }
        
        alert('Product deleted successfully!');
        await loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
    }
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
        ordersList.innerHTML = '<p>No orders yet</p>';
        return;
    }
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        const statusClass = `status-${order.status}`;
        const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
        
        let actionButtons = '';
        if (order.status === 'pending') {
            actionButtons = `<button class="btn-success" onclick="approveOrder('${order.id}')">Approve Order</button>`;
        } else if (order.status === 'approved') {
    actionButtons = `
        <div style="margin-top:10px; display:flex; flex-direction:column; gap:6px;">
            <input type="text" id="partner-${order.id}" placeholder="Delivery Partner Number">
            <input type="text" id="agency-${order.id}" placeholder="Courier Agency Name">
            <input type="text" id="tracking-${order.id}" placeholder="Tracking ID">
            <button class="btn-primary" onclick="addTracking('${order.id}')">Add Tracking</button>
        </div>
    `;
}

        
        orderCard.innerHTML = `
            <h3>Order #${order.id}</h3>
            <div class="order-status ${statusClass}">${statusText}</div>
            <div style="margin: 10px 0;">
                <strong>Items:</strong>
                <ul style="margin: 5px 0; padding-left: 20px;">
                    ${order.items.map(item => `<li>${item.name} x ${item.quantity} = ₹${item.price * item.quantity}</li>`).join('')}
                </ul>
            </div>
            <div><strong>Total:</strong> ₹${order.totalAmount}</div>
            <div style="margin-top: 10px;"><strong>Delivery Address:</strong> ${order.deliveryAddress}</div>
<div style="margin-top: 5px;">
    <strong>Payment:</strong> ${order.paymentStatus}
</div>

${order.paymentProof ? `
    <div style="margin-top:10px">
        <strong>Payment Screenshot:</strong><br>
        <img 
  src="data:image/jpeg;base64,${order.paymentProof}" 
  style="width:140px;border:1px solid #ccc;border-radius:6px"
>

    </div>
` : '<div style="color:gray;font-size:12px">No payment screenshot uploaded</div>'}
${order.partnerNumber || order.courierAgency ? `
<div style="margin-top:10px;">
    <strong>Courier Agency:</strong> ${order.courierAgency || 'N/A'}<br>
    <strong>Partner No:</strong> ${order.partnerNumber || 'N/A'}<br>
    ${order.trackingId ? `<strong>Tracking ID:</strong> ${order.trackingId}` : '<span style="color:gray">Tracking not available</span>'}
</div>
` : ''}
            ${actionButtons}
            <div style="margin-top: 10px; font-size: 12px; color: #666;">Ordered on: ${new Date(order.createdAt).toLocaleString()}</div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// Approve order
async function approveOrder(orderId) {
    if (!confirm('Mark this order as approved and payment received?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/approve`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Failed to approve order');
            return;
        }
        
        alert('Order approved! Stock updated.');
        await loadOrders();
        await loadProducts(); // Reload products to show updated stock
    } catch (error) {
        console.error('Error approving order:', error);
        alert('Failed to approve order');
    }
}

// Add tracking
async function addTracking(orderId) {
    const partnerNumber = document.getElementById(`partner-${orderId}`).value;
    const courierAgency = document.getElementById(`agency-${orderId}`).value;
    const trackingId = document.getElementById(`tracking-${orderId}`).value;

    if (!partnerNumber || !courierAgency) {
    alert('Please enter courier partner and agency');
    return;
}


    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/tracking`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
    partnerNumber, 
    courierAgency, 
    trackingId: trackingId || null
})

        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Failed to add tracking');
            return;
        }

        alert('Tracking details added!');
        await loadOrders();
    } catch (error) {
        console.error('Error adding tracking:', error);
        alert('Failed to add tracking');
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const addModal = document.getElementById('addProductModal');
    const editModal = document.getElementById('editProductModal');
    if (event.target === addModal) {
        addModal.style.display = 'none';
    }
    if (event.target === editModal) {
        editModal.style.display = 'none';
    }
}
