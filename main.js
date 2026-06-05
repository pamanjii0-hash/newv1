
// Simulate Data Init
async function initData() {
    if(!localStorage.getItem('manjii_db_init')) {
        const res = await fetch('database.json');
        const data = await res.json();
        localStorage.setItem('site_settings', JSON.stringify(data.website_info));
        localStorage.setItem('products', JSON.stringify(data.products));
        localStorage.setItem('users', JSON.stringify([])); // {user, pass}
        localStorage.setItem('orders', JSON.stringify([]));
        localStorage.setItem('chats', JSON.stringify({}));
        localStorage.setItem('manjii_db_init', 'true');
    }
    loadSiteSettings();
    checkLoginStatus();
    loadProducts();
    
    // Check saved accent color
    const savedColor = localStorage.getItem('accent_color');
    if(savedColor) setAccent(savedColor);

    setTimeout(() => { document.getElementById('loading-screen').style.opacity = '0'; setTimeout(()=> document.getElementById('loading-screen').style.display = 'none', 300); }, 500);
}

function showLoading() {
    const ls = document.getElementById('loading-screen');
    ls.style.display = 'flex';
    ls.style.opacity = '1';
    setTimeout(() => { ls.style.opacity = '0'; setTimeout(()=> ls.style.display = 'none', 300); }, 500);
}

function nav(pageId) {
    showLoading();
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    
    if(pageId === 'dashboard') loadUserDashboard();
}

function setAccent(color) {
    document.documentElement.style.setProperty('--accent-color', color);
    localStorage.setItem('accent_color', color);
}

function loadSiteSettings() {
    const settings = JSON.parse(localStorage.getItem('site_settings') || '{}');
    if(settings.name) {
        document.getElementById('site-logo-name').innerText = settings.name;
        document.title = settings.name;
    }
    if(settings.description) document.getElementById('site-desc').innerText = settings.description;
    if(settings.announcement) document.getElementById('site-news').innerText = settings.announcement;
}

function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const container = document.getElementById('product-list');
    container.innerHTML = '';
    products.forEach(p => {
        container.innerHTML += `
            <div class="glass product-card">
                <h3>${p.name}</h3>
                <div class="price">$${parseFloat(p.price).toFixed(2)}</div>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 15px;">Variant: ${p.duration}<br>${p.description}</p>
                <button class="glass-btn" style="width: 100%;" onclick="buyProduct('${p.name}', ${p.price})">🛒 Beli Sekarang</button>
            </div>
        `;
    });
}

let isRegister = false;
function toggleAuth() {
    isRegister = !isRegister;
    document.getElementById('auth-title').innerText = isRegister ? 'Daftar Akun' : 'Login Akun';
    document.getElementById('auth-btn').innerText = isRegister ? 'Daftar' : 'Login';
    event.target.innerText = isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar';
}

function handleAuth() {
    const u = document.getElementById('auth-user').value;
    const p = document.getElementById('auth-pass').value;
    if(!u || !p) return alert('Isi semua form!');

    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if(isRegister) {
        if(users.find(x => x.user === u)) return alert('Username sudah terdaftar!');
        users.push({user: u, pass: p});
        localStorage.setItem('users', JSON.stringify(users));
        alert('Daftar berhasil! Silakan login.');
        toggleAuth();
    } else {
        const valid = users.find(x => x.user === u && x.pass === p);
        if(valid) {
            localStorage.setItem('currentUser', u);
            checkLoginStatus();
            nav('dashboard');
        } else {
            alert('Username / Password salah!');
        }
    }
}

function checkLoginStatus() {
    const user = localStorage.getItem('currentUser');
    if(user) {
        document.getElementById('nav-login-btn').style.display = 'none';
        document.getElementById('nav-dashboard-btn').style.display = 'inline-block';
        document.getElementById('nav-logout-btn').style.display = 'inline-block';
        document.getElementById('dash-username').innerText = user;
    } else {
        document.getElementById('nav-login-btn').style.display = 'inline-block';
        document.getElementById('nav-dashboard-btn').style.display = 'none';
        document.getElementById('nav-logout-btn').style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    checkLoginStatus();
    nav('home');
}

// Checkout Flow
function buyProduct(name, price) {
    if(!localStorage.getItem('currentUser')) {
        alert('Silakan login terlebih dahulu untuk membeli produk.');
        nav('login');
        return;
    }
    document.getElementById('co-product').value = name;
    document.getElementById('co-price').value = price;
    document.getElementById('qris-section').style.display = 'none';
    nav('checkout');
}

function processCheckout() {
    const ig = document.getElementById('co-username').value;
    const wa = document.getElementById('co-wa').value;
    const prod = document.getElementById('co-product').value;
    const price = document.getElementById('co-price').value;

    if(!ig || !wa || !prod) return alert('Isi Username Game dan WhatsApp!');

    document.getElementById('qris-price').innerText = '$' + price;
    document.getElementById('qris-section').style.display = 'block';
}

function confirmPayment() {
    const ig = document.getElementById('co-username').value;
    const wa = document.getElementById('co-wa').value;
    const prod = document.getElementById('co-product').value;
    const price = document.getElementById('co-price').value;
    const user = localStorage.getItem('currentUser');

    const order = {
        id: 'ORD-' + Math.floor(Math.random()*10000),
        user: user,
        ig_username: ig,
        wa: wa,
        product: prod,
        price: price,
        status: 'PENDING',
        date: new Date().toLocaleString()
    };

    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    alert('Pembayaran terkonfirmasi sistem. Menunggu approval Admin. Status: PENDING.');
    nav('dashboard');
}

function loadUserDashboard() {
    const user = localStorage.getItem('currentUser');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]').filter(o => o.user === user);
    
    let html = '';
    orders.forEach(o => {
        let col = o.status === 'DONE' ? '#00ff88' : '#ffcc00';
        html += `
            <div style="background: rgba(0,0,0,0.3); padding: 10px; margin-bottom: 10px; border-radius: 5px; border-left: 3px solid ${col}">
                <b>${o.product}</b> - $${o.price} <br>
                <small>${o.date} | Game User: ${o.ig_username}</small> <br>
                Status: <span style="color: ${col}; font-weight:bold;">${o.status}</span>
            </div>
        `;
    });
    if(html === '') html = '<p style="color:var(--text-muted)">Belum ada pesanan.</p>';
    document.getElementById('user-orders').innerHTML = html;

    loadUserChat();
}

// Live Chat Logic (User Side)
function loadUserChat() {
    const user = localStorage.getItem('currentUser');
    const chats = JSON.parse(localStorage.getItem('chats') || '{}');
    const userChat = chats[user] || [];
    
    const box = document.getElementById('user-chat-box');
    box.innerHTML = '';
    userChat.forEach(c => {
        const cl = c.sender === 'user' ? 'me' : 'admin';
        box.innerHTML += `<div class="chat-msg ${cl}">${c.msg}</div>`;
    });
    box.scrollTop = box.scrollHeight;
}

function sendChatUser() {
    const inp = document.getElementById('user-chat-input');
    const msg = inp.value;
    if(!msg) return;
    
    const user = localStorage.getItem('currentUser');
    let chats = JSON.parse(localStorage.getItem('chats') || '{}');
    if(!chats[user]) chats[user] = [];
    
    chats[user].push({sender: 'user', msg: msg});
    localStorage.setItem('chats', JSON.stringify(chats));
    
    inp.value = '';
    loadUserChat();
}

window.onload = initData;
