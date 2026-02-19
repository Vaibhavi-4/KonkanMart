// API base URL (global) - set once, use everywhere
if (!window.API_BASE) {
window.API_BASE = `${window.location.origin}/api`;
}

// ===== VALIDATION HELPERS =====

function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    return password.length >= 6;
}

function isValidUsername(username) {
    return username.length >= 3;
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) errorDiv.textContent = message;
}

function clearError() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) errorDiv.textContent = '';
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
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('errorMessage');
    
    if (!username || !password) {
        errorDiv.textContent = 'Please enter username and password';
        return;
    }
    if (password.length < 6) {
    errorDiv.textContent = "Invalid credentials";
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

    clearError();

if (!username || !email || !password || !name) {
    showError('Please fill all required fields');
    return;
}

if (!isValidUsername(username)) {
    showError('Username must be at least 3 characters');
    return;
}

if (!isValidEmail(email)) {
    showError('Please enter a valid email address');
    return;
}

if (!isValidPassword(password)) {
    showError('Password must be at least 6 characters');
    return;
}




    const registerData = { username, email, password, role, name };

    if (role === 'seller') {
        const businessName = document.getElementById('businessName').value.trim();
const contactInfo = document.getElementById('contactInfo').value.trim();
const paymentInfo = document.getElementById('paymentInfo').value.trim();

if (!businessName || !contactInfo || !paymentInfo) {
    errorDiv.textContent = "Please fill all seller details";
    return;
}

       registerData.businessName = businessName;
registerData.contactInfo = contactInfo;
registerData.paymentInfo = paymentInfo;

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
// Enable Enter key for login & register
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        // If login form is visible
        if (loginForm && loginForm.style.display !== 'none') {
            login();
        }

        // If register form is visible
        if (registerForm && registerForm.style.display !== 'none') {
            register();
        }
    }
});
// ===== REAL-TIME VALIDATION =====
document.addEventListener('DOMContentLoaded', function () {

    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const usernameInput = document.getElementById('registerUsername');

    if (emailInput) {
        emailInput.addEventListener('input', function () {
            if (emailInput.value && !isValidEmail(emailInput.value)) {
                showError('Invalid email format');
            } else {
                clearError();
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            if (passwordInput.value && !isValidPassword(passwordInput.value)) {
                showError('Password must be at least 6 characters');
            } else {
                clearError();
            }
        });
    }

    if (usernameInput) {
        usernameInput.addEventListener('input', function () {
            if (usernameInput.value && !isValidUsername(usernameInput.value)) {
                showError('Username must be at least 3 characters');
            } else {
                clearError();
            }
        });
    }

});
