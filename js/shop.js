/* ============================================================
   ShopBD — শপ পেজ লজিক (সব পণ্য + ফিল্টার)
   ============================================================ */

import {
  getSettings, getCategories, getProducts, applyThemeColors
} from "./firebase.js";

let SETTINGS = null;
let ALL_PRODUCTS = [];
let ALL_CATEGORIES = [];

const grid = document.getElementById('productGrid');
const searchFilter = document.getElementById('searchFilter');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');
const resultCount = document.getElementById('resultCount');
const pageTitle = document.getElementById('pageTitle');

async function init() {
  SETTINGS = await getSettings();
  applyThemeColors(SETTINGS);
  renderHeader(SETTINGS);
  renderDrawer(SETTINGS);
  renderFooter(SETTINGS);

  // URL থেকে q ও cat
  const params = new URLSearchParams(location.search);
  const q = params.get('q') || '';
  const cat = params.get('cat') || '';

  if (q) searchFilter.value = q;
  if (cat) pageTitle.textContent = cat;

  // ডাটা লোড
  ALL_CATEGORIES = await getCategories();
  ALL_PRODUCTS = await getProducts();

  // ক্যাটাগরি অপশন পূরণ
  ALL_CATEGORIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name;
    categoryFilter.appendChild(opt);
  });

  if (cat) categoryFilter.value = cat;

  render();
}

function render() {
  const q = searchFilter.value.trim().toLowerCase();
  const cat = categoryFilter.value;
  const sort = sortSelect.value;

  let list = ALL_PRODUCTS.filter(p => {
    const matchQ = !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q);
    const matchCat = !cat || p.category === cat;
    return matchQ && matchCat;
  });

  // সর্টিং
  if (sort === 'newest') {
    list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } else if (sort === 'popular') {
    list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (sort === 'priceLow') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'priceHigh') {
    list.sort((a, b) => b.price - a.price);
  }

  resultCount.textContent = `${list.length} টি পণ্য পাওয়া গেছে`;

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="icon">🔍</div>
        <p>কোনো কাপড় পাওয়া যায়নি</p>
        <a href="shop.html" class="btn-outline" style="margin-top:16px;">সব দেখুন</a>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(renderProductCard).join('');
}

/* ============ ইভেন্ট ============ */
searchFilter?.addEventListener('input', render);
categoryFilter?.addEventListener('change', () => {
  const cat = categoryFilter.value;
  pageTitle.textContent = cat || 'সব কাপড়';
  render();
});
sortSelect?.addEventListener('change', render);

init();