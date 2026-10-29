/* ============================================================
   ShopBD — পণ্যের বিস্তারিত পেজ
   ============================================================ */

import {
  getSettings, getProduct, getProducts, likeProduct,
  applyThemeColors
} from "./firebase.js";

let SETTINGS = null;
let CURRENT_PRODUCT = null;
let CURRENT_IMAGE_INDEX = 0;

const container = document.getElementById('productContainer');
const relatedSection = document.getElementById('relatedSection');
const relatedGrid = document.getElementById('relatedGrid');
const params = new URLSearchParams(location.search);
const productId = params.get('id');

async function init() {
  SETTINGS = await getSettings();
  applyThemeColors(SETTINGS);
  renderHeader(SETTINGS);
  renderDrawer(SETTINGS);
  renderFooter(SETTINGS);

  if (!productId) {
    showError('পণ্য খুঁজে পাওয়া যায়নি');
    return;
  }

  try {
    CURRENT_PRODUCT = await getProduct(productId);
    if (!CURRENT_PRODUCT) {
      showError('পণ্য খুঁজে পাওয়া যায়নি');
      return;
    }

    document.title = `${CURRENT_PRODUCT.name} — ${SETTINGS.shopName}`;
    renderProduct();
    loadRelated();
  } catch (err) {
    console.error(err);
    showError('পণ্য লোডে সমস্যা হয়েছে');
  }
}

function showError(msg) {
  container.innerHTML = `
    <div class="empty-state" style="padding:80px 20px;">
      <div class="icon">❌</div>
      <p style="margin-bottom:20px;">${msg}</p>
      <a href="shop.html" class="btn-primary">সব কাপড় দেখুন</a>
    </div>`;
}

function renderProduct() {
  const p = CURRENT_PRODUCT;
  const images = (p.images && p.images.length > 0) ? p.images : ['https://via.placeholder.com/600x600?text=No+Image'];
  const discount = p.oldPrice && p.oldPrice > p.price
    ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const liked = isInWishlist(p.id);

  container.innerHTML = `
    <div class="product-detail fade-in">
      <div class="detail-gallery">
        <div class="detail-main-img">
          <img id="mainImage" src="${images[0]}" alt="${p.name}">
        </div>
        ${images.length > 1 ? `
          <div class="detail-thumbs" id="thumbs">
            ${images.map((img, i) => `
              <img src="${img}" alt="ছবি ${i+1}" class="${i === 0 ? 'active' : ''}" onclick="changeImage(${i})">
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="detail-info">
        ${p.category ? `<div class="product-category" style="font-size:0.9rem;">${p.category}${p.brand ? ' • ' + p.brand : ''}</div>` : ''}
        <h1>${p.name}</h1>

        <div class="product-rating" style="font-size:1rem;">
          ❤️ ${p.likes || 0} জন পছন্দ করেছে
          ${p.inStock === false ? ' • <span style="color:var(--danger);">স্টক নেই</span>' : ' • <span style="color:var(--success);">স্টকে আছে</span>'}
        </div>

        <div class="detail-price">
          ৳ ${formatPrice(p.price)}
          ${p.oldPrice ? `<span style="font-size:1.2rem;color:var(--text-muted);text-decoration:line-through;margin-left:12px;">৳ ${formatPrice(p.oldPrice)}</span>` : ''}
          ${discount ? `<span style="font-size:1rem;background:#fee2e2;color:var(--danger);padding:4px 12px;border-radius:20px;margin-left:12px;">-${discount}%</span>` : ''}
        </div>

        ${p.description ? `<p style="color:var(--text-muted);margin:16px 0;line-height:1.8;font-size:1rem;">${p.description}</p>` : ''}

        ${(p.colors && p.colors.length > 0) ? `
          <div style="margin:16px 0;">
            <div style="font-weight:600;margin-bottom:8px;">রঙ:</div>
            <div class="detail-tags">
              ${p.colors.map((c, i) => `<span class="tag-pill ${i === 0 ? 'active' : ''}">${c}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${(p.sizes && p.sizes.length > 0) ? `
          <div style="margin:16px 0;">
            <div style="font-weight:600;margin-bottom:8px;">সাইজ:</div>
            <div class="detail-tags">
              ${p.sizes.map((s, i) => `<span class="tag-pill ${i === 0 ? 'active' : ''}">${s}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <div class="action-row">
          <button class="btn-primary btn-wa" onclick="askOnWhatsApp()">
            💬 WhatsApp এ জিজ্ঞাসা
          </button>
          <button class="btn-outline ${liked ? 'active' : ''}" onclick="toggleLike(this)" id="likeBtn">
            ${liked ? '❤️ পছন্দ হয়েছে' : '🤍 পছন্দ করুন'}
          </button>
        </div>

        <div class="info-box">
          <div class="row">📍 <span><strong>দোকানে এসে দেখুন:</strong> ${SETTINGS.address || ''}</span></div>
          <div class="row">🕐 <span>${SETTINGS.openTime || ''} ${SETTINGS.openDays ? '(' + SETTINGS.openDays + ')' : ''}</span></div>
          ${SETTINGS.mapLink ? `<div class="row">🗺️ <a href="${SETTINGS.mapLink}" target="_blank" style="color:var(--primary);font-weight:600;">Google Maps এ দেখুন</a></div>` : ''}
          ${SETTINGS.phone ? `<div class="row">📞 <a href="tel:${SETTINGS.phone}" style="color:var(--primary);font-weight:600;">${SETTINGS.phone}</a></div>` : ''}
        </div>
      </div>
    </div>
  `;
}

window.changeImage = function(index) {
  const images = CURRENT_PRODUCT.images || [];
  if (!images[index]) return;
  CURRENT_IMAGE_INDEX = index;
  document.getElementById('mainImage').src = images[index];
  document.querySelectorAll('#thumbs img').forEach((img, i) => {
    img.classList.toggle('active', i === index);
  });
};

window.askOnWhatsApp = function() {
  const p = CURRENT_PRODUCT;
  const msg = `আসসালামু আলাইকুম,\n\nআমি এই কাপড়টি সম্পর্কে জানতে চাই:\n\n👕 নাম: ${p.name}\n💰 দাম: ৳${p.price}\n${p.colors ? '🎨 রঙ: ' + p.colors.join(', ') + '\n' : ''}${p.sizes ? '📏 সাইজ: ' + p.sizes.join(', ') + '\n' : ''}\nএটা কি এখন স্টকে আছে?`;
  const url = `https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
};

window.toggleLike = async function(btn) {
  if (isInWishlist(CURRENT_PRODUCT.id)) {
    toggleWishlist(CURRENT_PRODUCT.id, CURRENT_PRODUCT.name);
    btn.textContent = '🤍 পছন্দ করুন';
    btn.classList.remove('active');
  } else {
    toggleWishlist(CURRENT_PRODUCT.id, CURRENT_PRODUCT.name);
    btn.textContent = '❤️ পছন্দ হয়েছে';
    btn.classList.add('active');
    const newCount = await likeProduct(CURRENT_PRODUCT.id);
    if (newCount !== false) {
      CURRENT_PRODUCT.likes = newCount;
      showToast('❤️ ধন্যবাদ!', 'success');
    }
  }
};

/* ============ একই ধরনের পণ্য ============ */
async function loadRelated() {
  try {
    const all = await getProducts();
    const related = all
      .filter(p => p.id !== CURRENT_PRODUCT.id && p.category === CURRENT_PRODUCT.category)
      .slice(0, 4);

    if (related.length > 0) {
      relatedSection.style.display = 'block';
      relatedGrid.innerHTML = related.map(renderProductCard).join('');
    }
  } catch (err) {
    console.error(err);
  }
}

init();