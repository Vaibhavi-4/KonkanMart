// API base URL (global) - set once, use everywhere
if (!window.API_BASE) {
    window.API_BASE = 'http://localhost:3000/api';
}

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!token || !user) {
        if (window.location.pathname !== '/login.html' && window.location.pathname !== '/') {
            window.location.href = '/login.html';
        }
        return null;
    }
    
    // Check if user is on the right page
    const currentPage = window.location.pathname;
    if (currentPage.includes('buyer.html') && user.role !== 'buyer') {
        redirectByRole(user.role);
        return null;
    }
    if (currentPage.includes('seller.html') && user.role !== 'seller') {
        redirectByRole(user.role);
        return null;
    }
    if (currentPage.includes('admin.html') && user.role !== 'admin') {
        redirectByRole(user.role);
        return null;
    }
    
    return { token, user };
}

// Redirect based on role
function redirectByRole(role) {
    if (role === 'buyer') {
        window.location.href = '/buyer.html';
    } else if (role === 'seller') {
        window.location.href = '/seller.html';
    } else if (role === 'admin') {
        window.location.href = '/admin.html';
    } else {
        window.location.href = '/login.html';
    }
}

// Show login form
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
}

// Show register form
function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

// Toggle seller fields
function toggleSellerFields() {
    const role = document.getElementById('registerRole').value;
    const sellerFields = document.getElementById('sellerFields');
    sellerFields.style.display = role === 'seller' ? 'block' : 'none';
}

// Login function
async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('errorMessage');
    
    if (!username || !password) {
        errorDiv.textContent = 'Please enter username and password';
        return;
    }
    
    try {
        const response = await fetch(`${window.API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorDiv.textContent = data.error || 'Login failed';
            return;
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        redirectByRole(data.user.role);
    } catch (error) {
        errorDiv.textContent = 'Connection error. Make sure backend is running.';
        console.error('Login error:', error);
    }
}

// Register function
async function register() {
    const role = document.getElementById('registerRole').value;
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const name = document.getElementById('registerName').value.trim();

    const errorDiv = document.getElementById('errorMessage');

    if (!errorDiv) {
        console.error("errorMessage div not found");
        return;
    }

    errorDiv.textContent = "";

    if (!username || !email || !password || !name) {
        errorDiv.textContent = 'Please fill all required fields';
        return;
    }

    const registerData = { username, email, password, role, name };

    if (role === 'seller') {
        registerData.businessName = document.getElementById('businessName').value;
        registerData.contactInfo = document.getElementById('contactInfo').value;
        registerData.paymentInfo = document.getElementById('paymentInfo').value;
    }

    try {
        const response = await fetch(`${window.API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.textContent = data.error || 'Registration failed';
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        redirectByRole(data.user.role);

    } catch (error) {
        errorDiv.textContent = 'Connection error. Make sure backend is running.';
        console.error('Register error:', error);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();

    window.location.href = '/index.html';
}


// Get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Initialize auth check on page load
if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
    const auth = checkAuth();
    if (auth && document.getElementById('userName')) {
        document.getElementById('userName').textContent = auth.user.name || auth.user.username;
    }
}
