/* ============================================================
   ShopBD — হোমপেজ লজিক
   ============================================================ */

import {
  ensureDefaults, getSettings, getCategories, getProducts,
  applyThemeColors
} from "./firebase.js";

let SETTINGS = null;

async function init() {
  // প্রথমবার ডিফল্ট ডাটা তৈরি
  await ensureDefaults();

  // সেটিংস লোড ও থিম প্রয়োগ
  SETTINGS = await getSettings();
  applyThemeColors(SETTINGS);

  // হেডার, ড্রয়ার, ফুটার রেন্ডার
  renderHeader(SETTINGS);
  renderDrawer(SETTINGS);
  renderFooter(SETTINGS);

  // হিরো ব্যানার
  renderHero(SETTINGS);

  // ভিজিট সেকশন
  renderVisitSection(SETTINGS);

  // ক্যাটাগরি ও পণ্য লোড
  await loadCategories();
  await loadProducts();
}

/* ============ হিরো ============ */
function renderHero(s) {
  const hero = document.getElementById('heroBanner');
  if (!hero) return;

  if (s.banner) {
    hero.style.backgroundImage = `url('${s.banner}')`;
    hero.classList.add('with-banner');
  }

  document.getElementById('heroTitle').textContent = s.shopName || 'আমার দোকান';
  document.getElementById('heroTagline').textContent = s.tagline || '';
  document.title = `${s.shopName} — হোম`;
}

/* ============ ভিজিট সেকশন ============ */
function renderVisitSection(s) {
  const info = document.getElementById('visitInfo');
  if (info) {
    info.innerHTML = `
      ${s.address ? `📍 ${s.address}<br>` : ''}
      ${s.openTime ? `🕐 ${s.openTime}` : ''}
      ${s.openDays ? ` (${s.openDays})` : ''}
    `;
  }
  const mapBtn = document.getElementById('mapBtn');
  if (mapBtn && s.mapLink) mapBtn.href = s.mapLink;

  const waBtn = document.getElementById('waBtn');
  if (waBtn && s.whatsapp) {
    waBtn.href = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি দোকান সম্পর্কে জানতে চাই।')}`;
  }
}

/* ============ ক্যাটাগরি ============ */
async function loadCategories() {
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;

  try {
    const cats = await getCategories();
    if (cats.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">কোনো ক্যাটাগরি নেই</p>`;
      return;
    }

    grid.innerHTML = cats.map(c => `
      <a href="shop.html?cat=${encodeURIComponent(c.name)}" class="category-card">
        <div class="emoji">${c.emoji || '📦'}</div>
        <div class="name">${c.name}</div>
      </a>
    `).join('');
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;">ক্যাটাগরি লোডে সমস্যা</p>`;
  }
}

/* ============ পণ্য ============ */
async function loadProducts() {
  const featuredGrid = document.getElementById('featuredGrid');
  const newGrid = document.getElementById('newGrid');

  try {
    const products = await getProducts();

    if (products.length === 0) {
      featuredGrid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="icon">📦</div>
          <p>এখনও কোনো কাপড় যোগ করা হয়নি।</p>
        </div>`;
      newGrid.innerHTML = '';
      return;
    }

    // জনপ্রিয়: বেশি লাইক
    const featured = [...products]
      .filter(p => p.featured || (p.likes || 0) > 0)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 8);

    const featuredFinal = featured.length > 0 ? featured : products.slice(0, 8);
    featuredGrid.innerHTML = featuredFinal.map(renderProductCard).join('');

    // নতুন: সর্বশেষ
    const newest = [...products].slice(0, 8);
    newGrid.innerHTML = newest.map(renderProductCard).join('');

  } catch (err) {
    console.error(err);
    featuredGrid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="icon">⚠️</div>
        <p>পণ্য লোডে সমস্যা হয়েছে।</p>
      </div>`;
  }
}

init();