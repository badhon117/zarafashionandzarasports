/* ============================================================
   ShopBD — পছন্দের তালিকা (Wishlist)
   localStorage এ সেভ করা product id গুলো দেখায়
   ============================================================ */

import {
  getSettings, getProducts, applyThemeColors
} from "./firebase.js";

const grid = document.getElementById('wishlistGrid');
const resultCount = document.getElementById('resultCount');

async function init() {
  const SETTINGS = await getSettings();
  applyThemeColors(SETTINGS);
  renderHeader(SETTINGS);
  renderDrawer(SETTINGS);
  renderFooter(SETTINGS);

  await loadWishlist();
}

async function loadWishlist() {
  try {
    const ids = getWishlist();

    if (ids.length === 0) {
      resultCount.textContent = '';
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="icon">🤍</div>
          <p style="margin-bottom:20px;">আপনার পছন্দের তালিকা খালি</p>
          <a href="shop.html" class="btn-primary">কাপড় দেখুন</a>
        </div>`;
      return;
    }

    const all = await getProducts();
    const list = all.filter(p => ids.includes(p.id));

    resultCount.textContent = `${list.length} টি পণ্য`;

    if (list.length === 0) {
      resultCount.textContent = '';
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="icon">🤍</div>
          <p style="margin-bottom:20px;">পছন্দের তালিকা খালি</p>
          <a href="shop.html" class="btn-primary">কাপড় দেখুন</a>
        </div>`;
      return;
    }

    grid.innerHTML = list.map(renderProductCard).join('');

  } catch (err) {
    console.error(err);
    resultCount.textContent = '';
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="icon">⚠️</div>
        <p>লোডে সমস্যা হয়েছে</p>
      </div>`;
  }
}

/* wishlist থেকে রিমুভ হলে সাথে সাথে UI আপডেট */
const originalToggle = window.handleWishlist;
window.handleWishlist = function(id, name, btn) {
  const wasIn = isInWishlist(id);
  const result = originalToggle.call(this, id, name, btn);
  if (wasIn) {
    // রিমুভ হয়েছে → reload
    setTimeout(() => loadWishlist(), 300);
  }
  return result;
};

init();