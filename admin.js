
const ADMIN_USER = "admin_manjii_secret";
const ADMIN_PASS = "Manjii@Admin2026_!!";

function adminLogin() {
    const u = document.getElementById('admin-user').value;
    const p = document.getElementById('admin-pass').value;

    if(u === ADMIN_USER && p === ADMIN_PASS) {
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('loading-screen').style.opacity = '1';
        setTimeout(() => {
            document.getElementById('loading-screen').style.opacity = '0';
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('page-admin-login').classList.remove('active');
            document.getElementById('page-admin-dash').classList.add('active');
            document.getElementById('admin-nav').style.display = 'block';
            loadAdminData();
        }, 500);
    } else {
        alert('CREDENTIALS INVALID!');
    }
}

function adminLogout() {
    location.reload();
}

function loadAdminData() {
    // Settings
    const settings = JSON.parse(localStorage.getItem('site_settings') || '{}');
    document.getElementById('set-name').value = settings.name || '';
    document.getElementById('set-desc').value = settings.description || '';
    document.getElementById('set-news').value = settings.announcement || '';

    // Products
    loadAdminProducts();
    
    // Orders
    loadAdminOrders();

    // Users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let userHtml = '<table style="width:100%; text-align:left;"><tr><th>Username</th><th>Password</th></tr>';
    const select = document.getElementById('chat-user-select');
    select.innerHTML = '<option value="">Select User</option>';

    users.forEach(u => {
        userHtml += `<tr><td>${u.user}</td><td style="color:var(--accent-color)">${u.pass}</td></tr>`;
        select.innerHTML += `<option value="${u.user}">${u.user}</option>`;
    });
    userHtml += '</table>';
    document.getElementById('admin-users').innerHTML = userHtml;
}

function saveSettings() {
    const s = {
        name: document.getElementById('set-name').value,
        description: document.getElementById('set-desc').value,
        announcement: document.getElementById('set-news').value
    };
    localStorage.setItem('site_settings', JSON.stringify(s));
    alert('Settings Saved! Will update on main site.');
}

function loadAdminProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    let h = '';
    products.forEach((p, i) => {
        h += `<div style="background:rgba(255,255,255,0.05); padding: 5px; margin-bottom: 5px; display:flex; justify-content:space-between;">
            <span>${p.name} ($${p.price})</span>
            <button onclick="delProduct(${i})" style="background:red; border:none; color:white; cursor:pointer; padding: 2px 5px; border-radius:3px;">Del</button>
        </div>`;
    });
    document.getElementById('admin-product-list').innerHTML = h;
}

function addProduct() {
    const n = document.getElementById('prod-name').value;
    const p = document.getElementById('prod-price').value;
    const d = document.getElementById('prod-dur').value;
    if(!n || !p) return;

    let prods = JSON.parse(localStorage.getItem('products') || '[]');
    prods.push({id: Date.now(), name: n, price: parseFloat(p), duration: d, description: 'Added via Admin'});
    localStorage.setItem('products', JSON.stringify(prods));
    loadAdminProducts();
    alert('Product added');
}

function delProduct(idx) {
    let prods = JSON.parse(localStorage.getItem('products') || '[]');
    prods.splice(idx, 1);
    localStorage.setItem('products', JSON.stringify(prods));
    loadAdminProducts();
}

function loadAdminOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    let h = '';
    orders.forEach((o, i) => {
        let col = o.status === 'DONE' ? '#00ff88' : '#ffcc00';
        h += `<div style="background:rgba(0,0,0,0.3); padding: 10px; margin-bottom: 5px; border-left: 3px solid ${col};">
            <b>${o.id}</b> - ${o.product} ($${o.price})<br>
            User: ${o.user} | Game: ${o.ig_username} | WA: ${o.wa}<br>
            Status: <span style="color:${col}">${o.status}</span>
            ${o.status === 'PENDING' ? `<button onclick="accOrder(${i})" style="margin-left:10px; background:#00ff88; color:black; border:none; padding:2px 8px; cursor:pointer;">ACC / DONE</button>` : ''}
        </div>`;
    });
    document.getElementById('admin-orders').innerHTML = h;
}

function accOrder(idx) {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders[idx].status = 'DONE';
    localStorage.setItem('orders', JSON.stringify(orders));
    loadAdminOrders();
}

function loadAdminChat() {
    const user = document.getElementById('chat-user-select').value;
    if(!user) return;
    
    const chats = JSON.parse(localStorage.getItem('chats') || '{}');
    const userChat = chats[user] || [];
    
    const box = document.getElementById('admin-chat-box');
    box.innerHTML = '';
    userChat.forEach(c => {
        const cl = c.sender === 'admin' ? 'me' : 'admin'; // reversed for admin view
        box.innerHTML += `<div class="chat-msg ${cl}">${c.msg}</div>`;
    });
    box.scrollTop = box.scrollHeight;
}

function sendChatAdmin() {
    const user = document.getElementById('chat-user-select').value;
    if(!user) return alert('Select user first!');
    
    const inp = document.getElementById('admin-chat-input');
    const msg = inp.value;
    if(!msg) return;
    
    let chats = JSON.parse(localStorage.getItem('chats') || '{}');
    if(!chats[user]) chats[user] = [];
    
    chats[user].push({sender: 'admin', msg: msg});
    localStorage.setItem('chats', JSON.stringify(chats));
    
    inp.value = '';
    loadAdminChat();
}

window.onload = () => {
    document.getElementById('loading-screen').style.opacity = '0';
    setTimeout(()=> document.getElementById('loading-screen').style.display = 'none', 300);
}
