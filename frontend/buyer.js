// API base URL - use global from auth.js (loaded first)
// Reference window.API_BASE directly to avoid redeclaration
// --- LOGIN PROTECTION ---
const user = JSON.parse(localStorage.getItem('user') || 'null');
const token = localStorage.getItem('token');

if (!token || !user || user.role !== 'buyer') {
    alert('You must be logged in as a buyer to access this page.');
    window.location.href = '/login.html'; // redirect to login
}
if (token && user && user.role === 'buyer') {
    const welcomeEl = document.getElementById('welcomeUser');
    if (welcomeEl) {
        welcomeEl.textContent = `Hello, ${user.name || user.username}!`;
    }
}

const API_BASE = `${window.location.origin}/api`;
let selectedOrderIds = []; // store all order IDs
let selectedOrderId = null; // optional, first order ID

 // optional: first order ID for single payment



// Load products on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    await loadProducts();
    await loadCart();
    await loadOrders();
    
    // Refresh products every 30 seconds to show updated stock
    setInterval(async () => {
        await loadProducts();
    }, 30000);
});

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const categories = await response.json();
        
        const categoryFilter = document.getElementById('categoryFilter');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
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
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p>No products found</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.border = '1px solid #ddd';
        card.style.padding = '10px';
        card.style.borderRadius = '5px';
        card.style.marginBottom = '10px';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.setAttribute('data-seller-id', product.sellerId || '');

        // Seller info (if available)
        let sellerInfo = '';
        if (product.seller) {
            sellerInfo = `
                <div style="margin-top: 10px; padding: 8px; background: #f0f0f0; border-radius: 5px; font-size: 12px; width: 100%;">
                    <strong>Seller:</strong> ${product.seller.businessName || 'N/A'}<br>
                    <strong>Contact:</strong> ${product.seller.contactInfo || 'N/A'}<br>
                    <strong>Payment:</strong> ${product.seller.paymentInfo || 'N/A'}
                </div>
            `;
        }

        card.innerHTML = `
${product.image ? `<img src="${product.image.replace('http://localhost:3000', window.location.origin)}" alt="${product.name}" style="width:120px;height:120px;object-fit:cover;margin-bottom:10px;">` : ''}
            <h3>${product.name}</h3>
            <div class="category">${product.category}</div>
            <div class="price">₹${product.price}</div>
            <div class="description" style="margin:5px 0;">${product.description}</div>
            <div style="font-size:12px;color:#666;">Stock: ${product.stock}</div>
            ${sellerInfo}
            <div style="margin-top:10px; display:flex; align-items:center; gap:10px;">
                <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" 
                       onchange="validateQuantity('${product.id}', ${product.stock})" 
                       onkeyup="validateQuantity('${product.id}', ${product.stock})"
                       style="width:60px; padding:5px;">
                <button onclick="addToCart('${product.id}')">Add to Cart</button>
            </div>
        `;

        grid.appendChild(card);
    });
}
function validateQuantity(productId, stock) {
  const input = document.getElementById(`qty-${productId}`);
  let value = Number(input.value);

  if (!value || value < 1) value = 1;
  if (value > stock) value = stock;

  input.value = value;
}

// Filter products
async function filterProducts() {
    const search = document.getElementById('searchInput').value;
    const category = document.getElementById('categoryFilter').value;
    
    let url = `${API_BASE}/products?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (category) url += `category=${encodeURIComponent(category)}`;
    
    try {
        const response = await fetch(url);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error filtering products:', error);
    }
}

// Validate quantity input
function validateQuantity(productId, maxStock) {
    const input = document.getElementById(`qty-${productId}`);
    let quantity = parseInt(input.value);
    
    if (isNaN(quantity) || quantity <= 0) {
        input.value = 1;
        quantity = 1;
    }
    
    if (quantity > maxStock) {
        input.value = maxStock;
        alert(`Maximum available stock is ${maxStock}. Quantity adjusted to ${maxStock}.`);
    }
}

// Add to cart
async function addToCart(productId) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(quantityInput.value);
    
    // Validate quantity
    if (isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid quantity');
        quantityInput.value = 1;
        return;
    }
    
    // Get current product stock to validate
    try {
        const productResponse = await fetch(`${API_BASE}/products/${productId}`);
        if (productResponse.ok) {
            const product = await productResponse.json();
            if (quantity > product.stock) {
                alert(`Insufficient stock. Only ${product.stock} items available.`);
                quantityInput.value = product.stock;
                quantityInput.max = product.stock;
                return;
            }
        }
    } catch (error) {
        console.error('Error fetching product:', error);
    }
    
    try {
        const response = await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId, quantity })
        });
        
        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Failed to add to cart');
            // Reload products to get updated stock
            await loadProducts();
            return;
        }
        
        await loadCart();
        await loadProducts(); // Reload to show updated stock
        alert('Added to cart!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add to cart: ' + error.message);
    }
}

// Load cart
async function loadCart() {
    try {
        const response = await fetch(`${API_BASE}/cart`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) return;
        
        const cart = await response.json();
        document.getElementById('cartCount').textContent = cart.length;
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Show cart modal
async function showCart() {
    const modal = document.getElementById('cartModal');
    modal.style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE}/cart`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) return;
        
        const cart = await response.json();
        const cartItems = document.getElementById('cartItems');
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty</p>';
            document.getElementById('cartTotal').textContent = '0';
            return;
        }
        
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div>
                    <strong>${item.name}</strong>
                    <div>₹${item.price} x ${item.quantity} = ₹${itemTotal}</div>
                </div>
                <button class="btn-danger" onclick="removeFromCart('${item.productId}')">Remove</button>
            `;
            cartItems.appendChild(cartItem);
        });
        
        document.getElementById('cartTotal').textContent = total.toFixed(2);
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Close cart modal
function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

// Remove from cart
async function removeFromCart(productId) {
    try {
        const response = await fetch(`${API_BASE}/cart/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) return;
        
        await showCart();
        await loadCart();
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

// Checkout
async function checkout() {
    document.getElementById('cartModal').style.display = 'none';
    document.getElementById('checkoutModal').style.display = 'block';
    
    // Load seller info for items in cart
    try {
        const cartResponse = await fetch(`${API_BASE}/cart`, {
            headers: getAuthHeaders()
        });
        
        if (!cartResponse.ok) {
            document.getElementById('checkoutSellerInfo').innerHTML = '<em>Error loading cart</em>';
            return;
        }
        
        const cart = await cartResponse.json();
        
        if (cart.length === 0) {
            document.getElementById('checkoutSellerInfo').innerHTML = '<em>Cart is empty</em>';
            return;
        }
        
        const productsResponse = await fetch(`${API_BASE}/products`);
        
        if (!productsResponse.ok) {
            document.getElementById('checkoutSellerInfo').innerHTML = '<em>Error loading products</em>';
            return;
        }
        
        const products = await productsResponse.json();
        const sellerInfoDiv = document.getElementById('checkoutSellerInfo');
        
        // Get unique sellers from cart
        const sellersMap = new Map();
        cart.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                // Check if seller info is in product
                if (product.seller && (product.seller.businessName || product.seller.contactInfo || product.seller.paymentInfo)) {
                    const sellerKey = product.seller.businessName || product.seller.contactInfo || `seller_${product.sellerId}`;
                    if (!sellersMap.has(sellerKey)) {
                        sellersMap.set(sellerKey, product.seller);
                    }
                } else if (product.sellerId) {
                    // Log for debugging
                    console.warn('Seller info missing for product:', product.id, 'sellerId:', product.sellerId);
                    console.log('Product seller object:', product.seller);
                }
            }
        });
        
        // Display seller info
        if (sellersMap.size > 0) {
            let sellerInfoHtml = '<strong>Seller Contact Information:</strong><br><br>';
            sellersMap.forEach(seller => {
                sellerInfoHtml += `
                    <div style="margin-bottom: 10px; padding: 8px; background: white; border-radius: 3px;">
                        <strong>${seller.businessName || 'Seller'}</strong><br>
                        <strong>Contact:</strong> ${seller.contactInfo || 'N/A'}<br>
                        <strong>Payment:</strong> ${seller.paymentInfo || 'N/A'}
                    </div>
                `;
            });
            sellerInfoDiv.innerHTML = sellerInfoHtml;
        } else {
            // Try to get seller info from product sellerId
            const sellerIds = new Set();
            cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product && product.sellerId) {
                    sellerIds.add(product.sellerId);
                }
            });
            
            // Debug: log what we have
            console.log('Cart items:', cart);
            console.log('Products:', products);
            console.log('Products with seller:', products.filter(p => p.seller));
            
            sellerInfoDiv.innerHTML = '<em style="color: orange;">Seller information will be available after order placement. Please proceed with order.</em>';
        }
    } catch (error) {
        console.error('Error loading seller info:', error);
        document.getElementById('checkoutSellerInfo').innerHTML = '<em>Error loading seller information</em>';
    }
}
function togglePaymentMode() {
  const mode = document.querySelector('input[name="paymentMode"]:checked').value;
  const onlineSection = document.getElementById("onlinePaymentSection");

  if (mode === "COD") {
    onlineSection.style.display = "none";
  } else {
    onlineSection.style.display = "block";
  }
}
function selectPayment(mode) {
  document.getElementById("paymentMode").value = mode;

  document.querySelectorAll(".payment-option").forEach(opt => {
    opt.classList.remove("active");
  });

  event.currentTarget.classList.add("active");

  const onlineSection = document.getElementById("onlinePaymentSection");
  if (mode === "COD") {
    onlineSection.style.display = "none";
  } else {
    onlineSection.style.display = "block";
  }
}


// Close checkout modal
function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
}

// Place order
async function placeOrder() {
    const deliveryAddress = document.getElementById('deliveryAddress').value;
    const mode = document.getElementById("paymentMode").value;

    if (!deliveryAddress.trim()) {
        alert('Please enter delivery address');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
    deliveryAddress,
    paymentMode: mode
})
        });

        const data = await response.json();

        if (!response.ok) {
    if (data.error === "Cart is empty") {
        alert("Cart is empty. Please add items to your cart first.");
    } else {
        alert(data.error || "Failed to place order");
    }
    return;
}


        // ✅ SAVE ORDER ID
        selectedOrderIds = data.map(order => order.id); // all orders
selectedOrderId = selectedOrderIds[0]; // optional: first order for payment

        // alert('Order placed successfully! Now upload payment screenshot.');

        await loadCart();
        await loadOrders();

    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order');
    }
}

// Fetch current cart items in the format the backend expects
// async function fetchCartItems() {
//     try {
//         const response = await fetch(`${API_BASE}/cart`, {
//             headers: getAuthHeaders()
//         });
//         if (!response.ok) return [];
//         const cart = await response.json();
//         // Map to include necessary info for backend
//         return cart.map(item => ({
//             productId: item.productId,
//             name: item.name,
//             price: item.price,
//             quantity: item.quantity,
//             sellerId: item.sellerId
//         }));
//     } catch (err) {
//         console.error('Error fetching cart items:', err);
//         return [];
//     }
// }

function openPaymentModal(orderId) {
  selectedOrderIds = [orderId];
  document.getElementById("checkoutModal").style.display = "block";
}


// Submit payment
// Submit payment with cart items
async function submitPayment() {
const mode = document.getElementById("paymentMode")?.value || "ONLINE";

    const fileInput = document.getElementById("paymentProof");
    const address = document.getElementById("deliveryAddress").value.trim();

    if (!address) {
        alert('Please enter delivery address');
        return;
    }

    if (mode === "ONLINE" && (!fileInput || !fileInput.files[0])) {
        alert('Please upload payment screenshot');
        return;
    }


    // If order not yet placed, place it automatically
    if (!selectedOrderIds) {
       
        if (!selectedOrderIds) {
            alert("Failed to create order. Please try again.");
            return;
        }
    }

    const cartItems = [];

document.querySelectorAll('#cartItems .cart-item').forEach(item => {
    const button = item.querySelector('button');
    if (!button) return;

    const match = button.getAttribute('onclick')?.match(/'(.+?)'/);
    if (!match) return;

    const productId = match[1];

    // safer quantity read
    const qtyTextEl = item.querySelector('div div');
    let quantity = 1;

    if (qtyTextEl) {
        const parts = qtyTextEl.textContent.split('x');
        if (parts[1]) quantity = parseInt(parts[1]);
    }

    // safer product lookup
    const productBtn = document.querySelector(`#productsGrid .product-card button[onclick*="${productId}"]`);
    if (!productBtn) {
        console.warn("Product not found in grid:", productId);
        return;
    }

    const productCard = productBtn.closest('.product-card');
    if (!productCard) return;

    const priceEl = productCard.querySelector('.price');
    const nameEl = productCard.querySelector('h3');

    if (!priceEl || !nameEl) return;

    const price = parseFloat(priceEl.textContent.replace('₹', ''));
    const name = nameEl.textContent;
    const sellerId = productCard.getAttribute('data-seller-id') || null;

    cartItems.push({ productId, name, price, quantity, sellerId });
});


    if (cartItems.length === 0) {
        alert('Cart is empty');
        return;
    }

    
    // Place order if not already placed
    // Place order only if not already placed
if (!selectedOrderIds || selectedOrderIds.length === 0) {
    await placeOrder();
    if (!selectedOrderIds || selectedOrderIds.length === 0) return; // fail safe
}

// Now handle payment
if (mode === "COD") {
    alert("Order placed with Cash on Delivery ✅");
    closeCheckout();
    await loadCart();
    await loadOrders();
    return;
}

if (mode === "ONLINE") {
    const fileInput = document.getElementById("paymentProof");
    if (!fileInput || !fileInput.files[0]) {
        alert('Please upload payment screenshot');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
        const screenshotBase64 = reader.result.split(',')[1];
        try {
            await Promise.all(selectedOrderIds.map(id =>
                fetch(`${API_BASE}/orders/payment-json`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: getAuthHeaders().Authorization
                    },
                    body: JSON.stringify({
                        orderId: id,
                        deliveryAddress: address,
                        paymentMode: "ONLINE",
                        items: cartItems,
                        screenshot: screenshotBase64
                    })
                })
            ));

            alert('Payment submitted successfully ✅');
            fileInput.value = '';
            document.getElementById('deliveryAddress').value = '';
            closeCheckout();
            await loadCart();
            await loadOrders();

        } catch (err) {
            console.error('Payment submission error:', err);
            alert('Failed to submit payment. Please try again.');
        }}
    };
    reader.readAsDataURL(file);
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
        
        // Reload products to reflect updated stock after order approval
        await loadProducts();
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
        
       let trackingInfo = '';

if (order.status === 'shipped') {
    const deliveryDate = order.estimatedShipDate
        ? new Date(order.estimatedShipDate).toDateString()
        : 'In 3–4 days';

    trackingInfo = `
        <div style="margin-top:10px;padding:10px;background:#f4fff4;border-left:4px solid green;border-radius:6px">
            <strong>🚚 Shipping Details</strong><br>
            <strong>Courier Agency:</strong> ${order.courierAgency || 'Updating...'}<br>
            <strong>Partner Number:</strong> ${order.partnerNumber || 'Updating...'}<br>
            <strong>Tracking ID:</strong> ${order.trackingId || 'Not Assigned'}<br><br>

            <strong>📦 Expected Delivery:</strong> ${deliveryDate}<br>
            <span style="font-size:13px;color:green">
                Your order will be delivered within 3–4 working days.
            </span><br>

            <span style="font-size:12px;color:#555">
                Use tracking ID on courier website to track your order.
            </span>
        </div>
    `;
}


        
        // Seller contact info for buyers
        let sellerInfo = '';
        if (order.seller) {
            sellerInfo = `
                <div style="margin-top: 10px; padding: 10px; background: #e8f4f8; border-radius: 5px; border-left: 3px solid #667eea;">
                    <strong>Seller Information:</strong><br>
                    <strong>Business:</strong> ${order.seller.businessName || 'N/A'}<br>
                    <strong>Contact:</strong> ${order.seller.contactInfo || 'N/A'}<br>
                    <strong>Payment Details:</strong> ${order.seller.paymentInfo || 'N/A'}<br>
                    <em style="font-size: 11px; color: #666;">Contact seller to confirm order and complete payment</em>
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
            <div style="margin-top: 10px;"><strong>Address:</strong> ${order.deliveryAddress}</div>
            <div style="margin-top: 5px;"><strong>Payment Status:</strong> ${order.paymentStatus}</div>
            <div><strong>Payment Mode:</strong> ${order.paymentMode}</div>
            
            ${order.status === 'approved' && order.estimatedShipDate ? `
  <div style="margin-top:6px;color:green;font-weight:500">
    🚚 Your order will be shipped by 
    <strong>${new Date(order.estimatedShipDate).toDateString()}</strong>
  </div>
` : ''}

${order.status === 'pending' ? `
  <div style="margin-top:6px;color:orange">
    ⏳ Waiting for seller to approve your order
  </div>
` : ''}

${order.status === 'shipped' ? `
  <div style="margin-top:6px;color:blue">
    📦 Your order has been shipped
  </div>
` : ''}

            ${sellerInfo}
            ${trackingInfo}
            <div style="margin-top: 10px; font-size: 12px; color: #666;">Ordered on: ${new Date(order.createdAt).toLocaleString()}</div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// Close modals when clicking outside
window.onclick = function(event) {
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }
    if (event.target === checkoutModal) {
        checkoutModal.style.display = 'none';
    }
}

function showOrders() {
  document.getElementById("ordersModal").style.display = "block";
  loadOrders();
}

function closeOrders() {
  document.getElementById("ordersModal").style.display = "none";
}
