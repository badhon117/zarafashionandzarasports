/* ============================================================
   ShopBD — শেয়ারড ফাংশন
   সব পেজ ব্যবহার করবে (হেডার, থিম, টোস্ট, ইত্যাদি)
   ============================================================ */

/* ============ থিম ============ */
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  const btn = document.querySelector('[onclick="toggleTheme()"]');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

function updateThemeIcon() {
  const current = document.documentElement.getAttribute('data-theme');
  const btn = document.querySelector('[onclick="toggleTheme()"]');
  if (btn) btn.textContent = current === 'dark' ? '☀️' : '🌙';
}

/* ============ ড্রয়ার ============ */
function openDrawer() {
  document.getElementById('drawer')?.classList.add('open');
  document.getElementById('drawerOverlay')?.classList.add('active');
}

function closeDrawer() {
  document.getElementById('drawer')?.classList.remove('open');
  document.getElementById('drawerOverlay')?.classList.remove('active');
}

/* ============ টোস্ট ============ */
function showToast(message, type = '') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* ============ সার্চ ============ */
function searchProducts() {
  const input = document.getElementById('searchInput');
  const q = input?.value.trim();
  if (q) window.location.href = `shop.html?q=${encodeURIComponent(q)}`;
}

/* ============ ❤️ পছন্দের তালিকা (Wishlist) ============ */
function getWishlist() {
  return JSON.parse(localStorage.getItem('wishlist') || '[]');
}

function saveWishlist(list) {
  localStorage.setItem('wishlist', JSON.stringify(list));
  updateWishlistBadge();
}

function toggleWishlist(id, name) {
  const list = getWishlist();
  const idx = list.indexOf(id);
  if (idx > -1) {
    list.splice(idx, 1);
    showToast('💔 পছন্দের তালিকা থেকে সরানো হয়েছে');
  } else {
    list.push(id);
    showToast(`❤️ ${name || 'পণ্য'} পছন্দের তালিকায় যোগ হয়েছে`, 'success');
  }
  saveWishlist(list);
  return list.includes(id);
}

function isInWishlist(id) {
  return getWishlist().includes(id);
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlistBadge');
  if (badge) {
    const count = getWishlist().length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

/* ============ হোয়াটসঅ্যাপ হেল্পার ============ */
function openWhatsApp(settings, message = '') {
  const number = settings?.whatsapp || '';
  if (!number) {
    showToast('WhatsApp নম্বর সেট করা নেই', 'error');
    return;
  }
  const url = `https://wa.me/${number}${message ? '?text=' + encodeURIComponent(message) : ''}`;
  window.open(url, '_blank');
}

function askAboutProduct(settings, product) {
  const msg = `আসসালামু আলাইকুম,\n\nআমি এই পণ্যটি সম্পর্কে জানতে চাই:\n\n👕 ${product.name}\n💰 দাম: ৳${product.price}\n\nএটা কি এখন স্টকে আছে?`;
  openWhatsApp(settings, msg);
}

/* ============ হেডার রেন্ডার (সব পেজে একই) ============ */
function renderHeader(settings, activePage = '') {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const logoContent = settings.logo
    ? `<img src="${settings.logo}" alt="${settings.shopName}">`
    : `<span>🛍️</span><span>${settings.shopName}</span>`;

  header.innerHTML = `
    <header class="header">
      <div class="header-inner">
        <button class="icon-btn menu-toggle" onclick="openDrawer()">☰</button>
        <a href="index.html" class="logo">${logoContent}</a>
        <div class="search-bar">
          <input type="text" id="searchInput" placeholder="কাপড় খুঁজুন..." value="${new URLSearchParams(location.search).get('q') || ''}">
        </div>
        <div class="header-actions">
          <button class="icon-btn" onclick="toggleTheme()" title="থিম">🌙</button>
          <a href="wishlist.html" class="icon-btn" title="পছন্দের তালিকা" style="position:relative;">
            ❤️<span class="badge" id="wishlistBadge" style="display:none;">0</span>
          </a>
        </div>
      </div>
    </header>
  `;

  // সার্চ হ্যান্ডলার
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') searchProducts();
    });
  }

  updateThemeIcon();
  updateWishlistBadge();
}

/* ============ ড্রয়ার রেন্ডার ============ */
function renderDrawer(settings) {
  const drawerContainer = document.getElementById('drawerContainer');
  if (!drawerContainer) return;

  drawerContainer.innerHTML = `
    <div class="drawer-overlay" id="drawerOverlay" onclick="closeDrawer()"></div>
    <div class="drawer" id="drawer">
      <h3 style="margin-bottom:16px;">${settings.shopName}</h3>
      <a href="index.html" onclick="closeDrawer()">🏠 হোম</a>
      <a href="shop.html" onclick="closeDrawer()">🛍️ সব কাপড়</a>
      <a href="wishlist.html" onclick="closeDrawer()">❤️ পছন্দের তালিকা</a>
      <a href="about.html" onclick="closeDrawer()">ℹ️ দোকান সম্পর্কে</a>
      ${settings.phone ? `<a href="tel:${settings.phone}" onclick="closeDrawer()">📞 ফোন করুন</a>` : ''}
      ${settings.whatsapp ? `<a href="https://wa.me/${settings.whatsapp}" target="_blank" onclick="closeDrawer()">💬 WhatsApp</a>` : ''}
    </div>
  `;
}

/* ============ ফুটার রেন্ডার ============ */
function renderFooter(settings) {
  const footer = document.getElementById('siteFooter');
  if (!footer) return;

  footer.innerHTML = `
    <footer class="footer">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>${settings.shopName}</h4>
          <p>${settings.tagline || ''}</p>
        </div>
        <div class="footer-col">
          <h4>দ্রুত লিংক</h4>
          <a href="index.html">হোম</a>
          <a href="shop.html">সব কাপড়</a>
          <a href="wishlist.html">পছন্দের তালিকা</a>
          <a href="about.html">দোকান সম্পর্কে</a>
        </div>
        <div class="footer-col">
          <h4>যোগাযোগ</h4>
          ${settings.phone ? `<a href="tel:${settings.phone}">📞 ${settings.phone}</a>` : ''}
          ${settings.whatsapp ? `<a href="https://wa.me/${settings.whatsapp}" target="_blank">💬 WhatsApp</a>` : ''}
          ${settings.address ? `<p style="margin-top:8px;">📍 ${settings.address}</p>` : ''}
        </div>
        <div class="footer-col">
          <h4>সোশ্যাল</h4>
          ${settings.facebook ? `<a href="${settings.facebook}" target="_blank">📘 Facebook</a>` : ''}
          ${settings.instagram ? `<a href="${settings.instagram}" target="_blank">📷 Instagram</a>` : ''}
        </div>
      </div>
      <div class="footer-bottom">
        © ${new Date().getFullYear()} ${settings.shopName}। সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
    ${settings.whatsapp ? `
      <a href="https://wa.me/${settings.whatsapp}" target="_blank" class="wa-float" title="WhatsApp এ যোগাযোগ">
        💬
      </a>
    ` : ''}
  `;
}

/* ============ প্রোডাক্ট কার্ড ============ */
function renderProductCard(p) {
  const discount = p.oldPrice && p.oldPrice > p.price
    ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const liked = isInWishlist(p.id);
  const img = (p.images && p.images[0]) ? p.images[0] : 'https://via.placeholder.com/400x400?text=No+Image';

  return `
    <div class="product-card fade-in">
      <a href="product.html?id=${p.id}" class="img-wrap">
        ${discount > 0
          ? `<span class="discount-tag">-${discount}%</span>`
          : (p.inStock === false
            ? `<span class="stock-tag out">স্টক নেই</span>`
            : '')}
        <img src="${img}" alt="${p.name}" loading="lazy">
      </a>
      <button class="wish-btn ${liked ? 'active' : ''}" onclick="handleWishlist('${p.id}', '${escapeQuote(p.name)}', this)">
        ${liked ? '❤️' : '🤍'}
      </button>
      <div class="product-info">
        ${p.category ? `<div class="product-category">${p.category}</div>` : ''}
        <a href="product.html?id=${p.id}">
          <h3 class="product-name">${p.name}</h3>
        </a>
        <div class="product-rating">⭐ ${p.likes || 0} জন পছন্দ করেছে</div>
        <div class="price-row">
          <span class="price">৳ ${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="old-price">৳ ${formatPrice(p.oldPrice)}</span>` : ''}
        </div>
        <div class="card-actions">
          <a href="product.html?id=${p.id}" class="add-cart-btn">
            👁️ দেখুন
          </a>
          <button class="wa-mini-btn" onclick="event.stopPropagation(); handleAskProduct('${p.id}')">
            💬
          </button>
        </div>
      </div>
    </div>
  `;
}

function escapeQuote(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function formatPrice(n) {
  if (!n && n !== 0) return "0";
  return Number(n).toLocaleString("bn-BD");
}

/* ============ গ্লোবাল উইশলিস্ট হ্যান্ডলার ============ */
window.handleWishlist = function(id, name, btn) {
  const isNowLiked = toggleWishlist(id, name);
  if (btn) {
    btn.classList.toggle('active', isNowLiked);
    btn.textContent = isNowLiked ? '❤️' : '🤍';
  }
};

/* ============ গ্লোবাল WhatsApp হ্যান্ডলার ============ */
let _cachedSettings = null;

window.handleAskProduct = async function(productId) {
  try {
    const { getProduct, getSettings } = await import('./firebase.js');
    if (!_cachedSettings) _cachedSettings = await getSettings();
    const product = await getProduct(productId);
    if (product) askAboutProduct(_cachedSettings, product);
  } catch (e) {
    console.error(e);
    showToast('সমস্যা হয়েছে', 'error');
  }
};

/* ============ ইনিশিয়ালাইজ ============ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateWishlistBadge();
});