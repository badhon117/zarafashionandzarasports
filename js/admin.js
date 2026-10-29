/* ============================================================
   ShopBD — অ্যাডমিন প্যানেল লজিক
   সব CRUD, ব্যাকআপ, সেটিংস
   ============================================================ */

import {
  ensureDefaults, getSettings, saveSettings,
  getCategories, addCategory, updateCategory, deleteCategory,
  getProducts, addProduct, updateProduct, deleteProduct,
  uploadImage, uploadMultipleImages
} from "./firebase.js";

let SETTINGS = null;
let PRODUCTS = [];
let CATEGORIES = [];
let EDIT_IMAGES = []; // এডিটের সময় বর্তমান ছবি

/* ============================================================
   🔐 লগইন / লগআউট
   ============================================================ */

window.login = function() {
  const pass = document.getElementById('adminPass').value;
  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem('adminAuth', 'true');
    startPanel();
  } else {
    document.getElementById('loginMsg').textContent = '❌ ভুল পাসওয়ার্ড';
  }
};

window.logout = function() {
  sessionStorage.removeItem('adminAuth');
  location.reload();
};

// Enter চাপলে লগইন
document.getElementById('adminPass')?.addEventListener('keypress', e => {
  if (e.key === 'Enter') window.login();
});

/* ============================================================
   🚀 প্যানেল শুরু
   ============================================================ */

async function startPanel() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').classList.add('active');

  await ensureDefaults();
  SETTINGS = await getSettings();

  loadSettingsForm();
  await loadCategories();
  await loadProducts();
  updateStats();
}

// অটো লগইন
if (sessionStorage.getItem('adminAuth') === 'true') {
  startPanel();
}

/* ============================================================
   📑 ট্যাব
   ============================================================ */

window.switchTab = function(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
};

/* ============================================================
   📊 স্ট্যাটস
   ============================================================ */

function updateStats() {
  document.getElementById('statProducts').textContent = PRODUCTS.length;
  document.getElementById('statCategories').textContent = CATEGORIES.length;
  const totalLikes = PRODUCTS.reduce((s, p) => s + (p.likes || 0), 0);
  document.getElementById('statLikes').textContent = totalLikes;
}

/* ============================================================
   🏪 সেটিংস ফর্ম
   ============================================================ */

function loadSettingsForm() {
  const s = SETTINGS;
  document.getElementById('s_shopName').value = s.shopName || '';
  document.getElementById('s_tagline').value = s.tagline || '';
  document.getElementById('s_phone').value = s.phone || '';
  document.getElementById('s_whatsapp').value = s.whatsapp || '';
  document.getElementById('s_address').value = s.address || '';
  document.getElementById('s_mapLink').value = s.mapLink || '';
  document.getElementById('s_openTime').value = s.openTime || '';
  document.getElementById('s_openDays').value = s.openDays || '';
  document.getElementById('s_facebook').value = s.facebook || '';
  document.getElementById('s_instagram').value = s.instagram || '';
  document.getElementById('s_primaryColor').value = s.primaryColor || '#6366f1';
  document.getElementById('s_accentColor').value = s.accentColor || '#ec4899';

  // লোগো/ব্যানার প্রিভিউ
  const logoWrap = document.getElementById('logoPreviewWrap');
  if (s.logo) {
    logoWrap.innerHTML = `<img src="${s.logo}" class="image-preview" alt="logo">`;
  } else {
    logoWrap.innerHTML = '';
  }

  const bannerWrap = document.getElementById('bannerPreviewWrap');
  if (s.banner) {
    bannerWrap.innerHTML = `<img src="${s.banner}" class="image-preview" style="width:200px;height:100px;" alt="banner">`;
  } else {
    bannerWrap.innerHTML = '';
  }
}

document.getElementById('settingsForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('settingsMsg');
  msg.textContent = '⏳ সেভ হচ্ছে...';
  msg.style.color = 'var(--warning)';

  try {
    const newSettings = {
      shopName: document.getElementById('s_shopName').value.trim(),
      tagline: document.getElementById('s_tagline').value.trim(),
      phone: document.getElementById('s_phone').value.trim(),
      whatsapp: document.getElementById('s_whatsapp').value.trim(),
      address: document.getElementById('s_address').value.trim(),
      mapLink: document.getElementById('s_mapLink').value.trim(),
      openTime: document.getElementById('s_openTime').value.trim(),
      openDays: document.getElementById('s_openDays').value.trim(),
      facebook: document.getElementById('s_facebook').value.trim(),
      instagram: document.getElementById('s_instagram').value.trim(),
      primaryColor: document.getElementById('s_primaryColor').value,
      accentColor: document.getElementById('s_accentColor').value,
      logo: SETTINGS.logo || '',
      banner: SETTINGS.banner || ''
    };

    // লোগো আপলোড
    const logoFile = document.getElementById('s_logoFile').files[0];
    if (logoFile) {
      msg.textContent = '⏳ লোগো আপলোড হচ্ছে...';
      newSettings.logo = await uploadImage(logoFile);
    }

    // ব্যানার আপলোড
    const bannerFile = document.getElementById('s_bannerFile').files[0];
    if (bannerFile) {
      msg.textContent = '⏳ ব্যানার আপলোড হচ্ছে...';
      newSettings.banner = await uploadImage(bannerFile);
    }

    await saveSettings(newSettings);
    SETTINGS = { ...SETTINGS, ...newSettings };

    msg.textContent = '✅ সেভ হয়েছে!';
    msg.style.color = 'var(--success)';
    showToast('✅ সেটিংস সেভ হয়েছে', 'success');

    // ফর্ম রিফ্রেশ
    document.getElementById('s_logoFile').value = '';
    document.getElementById('s_bannerFile').value = '';
    loadSettingsForm();

    setTimeout(() => { msg.textContent = ''; }, 3000);
  } catch (err) {
    console.error(err);
    msg.textContent = '❌ সমস্যা হয়েছে: ' + err.message;
    msg.style.color = 'var(--danger)';
  }
});

/* ============================================================
   📁 ক্যাটাগরি
   ============================================================ */

async function loadCategories() {
  CATEGORIES = await getCategories();
  renderCategoriesTable();
  populateCategorySelect();
}

function renderCategoriesTable() {
  const tbody = document.getElementById('categoryTableBody');
  if (!tbody) return;

  if (CATEGORIES.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">কোনো ক্যাটাগরি নেই</td></tr>';
    return;
  }

  tbody.innerHTML = CATEGORIES.map(c => {
    const count = PRODUCTS.filter(p => p.category === c.name).length;
    return `
      <tr>
        <td style="font-size:1.5rem;">${c.emoji || '📦'}</td>
        <td>${c.name}</td>
        <td>${c.order || 0}</td>
        <td>${count}</td>
        <td>
          <button class="btn-sm btn-danger" onclick="handleDeleteCategory('${c.id}', '${escapeHtml(c.name)}')">ডিলিট</button>
        </td>
      </tr>
    `;
  }).join('');
}

document.getElementById('categoryForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('catName').value.trim();
  const emoji = document.getElementById('catEmoji').value.trim() || '📦';
  const order = parseInt(document.getElementById('catOrder').value) || 1;

  if (!name) return;

  try {
    await addCategory({ name, emoji, order });
    showToast('✅ ক্যাটাগরি যোগ হয়েছে', 'success');
    document.getElementById('catName').value = '';
    document.getElementById('catEmoji').value = '';
    document.getElementById('catOrder').value = 1;
    await loadCategories();
    updateStats();
  } catch (err) {
    showToast('❌ সমস্যা হয়েছে', 'error');
  }
});

window.handleDeleteCategory = async function(id, name) {
  const count = PRODUCTS.filter(p => p.category === name).length;
  if (count > 0) {
    if (!confirm(`এই ক্যাটাগরিতে ${count} টি পণ্য আছে। ক্যাটাগরি ডিলিট করলে পণ্যগুলো থাকবে কিন্তু ক্যাটাগরি ছাড়া হবে। চালিয়ে যাবেন?`)) return;
  } else {
    if (!confirm('ক্যাটাগরি ডিলিট করবেন?')) return;
  }

  try {
    await deleteCategory(id);
    showToast('🗑️ ক্যাটাগরি ডিলিট হয়েছে', 'success');
    await loadCategories();
    updateStats();
  } catch (err) {
    showToast('❌ সমস্যা হয়েছে', 'error');
  }
};

function populateCategorySelect() {
  const select = document.getElementById('p_category');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="">-- ক্যাটাগরি বেছে নিন --</option>' +
    CATEGORIES.map(c => `<option value="${escapeHtml(c.name)}">${c.emoji || ''} ${escapeHtml(c.name)}</option>`).join('');

  if (currentVal) select.value = currentVal;
}

/* ============================================================
   👕 পণ্য
   ============================================================ */

async function loadProducts() {
  PRODUCTS = await getProducts();
  renderProductsTable();
  updateStats();
}

function renderProductsTable() {
  const tbody = document.getElementById('productTableBody');
  if (!tbody) return;

  if (PRODUCTS.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">কোনো পণ্য নেই</td></tr>';
    return;
  }

  tbody.innerHTML = PRODUCTS.map(p => {
    const img = (p.images && p.images[0]) ? p.images[0] : '';
    return `
      <tr>
        <td>${img ? `<img src="${img}" alt="">` : '-'}</td>
        <td>${escapeHtml(p.name)}${p.featured ? ' ⭐' : ''}</td>
        <td>${escapeHtml(p.category || '-')}</td>
        <td>৳ ${p.price}</td>
        <td>${p.inStock === false ? '❌' : '✅'}</td>
        <td>${p.likes || 0}</td>
        <td style="white-space:nowrap;">
          <button class="btn-sm btn-edit" onclick="editProduct('${p.id}')">এডিট</button>
          <button class="btn-sm btn-danger" onclick="handleDeleteProduct('${p.id}')">ডিলিট</button>
        </td>
      </tr>
    `;
  }).join('');
}

/* --- নতুন পণ্য / এডিট ফর্ম সাবমিট --- */
document.getElementById('productForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('productMsg');
  const editId = document.getElementById('editProductId').value;

  msg.textContent = '⏳ সেভ হচ্ছে...';
  msg.style.color = 'var(--warning)';

  try {
    const name = document.getElementById('p_name').value.trim();
    const category = document.getElementById('p_category').value;
    const price = Number(document.getElementById('p_price').value);
    const oldPrice = document.getElementById('p_oldPrice').value ? Number(document.getElementById('p_oldPrice').value) : null;
    const brand = document.getElementById('p_brand').value.trim();
    const inStock = document.getElementById('p_inStock').value === 'true';
    const colors = document.getElementById('p_colors').value.split(',').map(s => s.trim()).filter(Boolean);
    const sizes = document.getElementById('p_sizes').value.split(',').map(s => s.trim()).filter(Boolean);
    const description = document.getElementById('p_description').value.trim();
    const featured = document.getElementById('p_featured').checked;

    if (!name || !category || !price) {
      msg.textContent = '❌ নাম, ক্যাটাগরি, দাম আবশ্যক';
      msg.style.color = 'var(--danger)';
      return;
    }

    // নতুন ছবি আপলোড
    const files = document.getElementById('p_images').files;
    let images = [...EDIT_IMAGES];

    if (files && files.length > 0) {
      msg.textContent = '⏳ ছবি আপলোড হচ্ছে...';
      const newUrls = await uploadMultipleImages(Array.from(files));
      images = [...images, ...newUrls];
    }

    if (images.length === 0) {
      msg.textContent = '❌ অন্তত ১টি ছবি দিতে হবে';
      msg.style.color = 'var(--danger)';
      return;
    }

    const productData = {
      name, category, price, oldPrice, brand, inStock,
      colors, sizes, description, featured, images
    };

    if (editId) {
      await updateProduct(editId, productData);
      msg.textContent = '✅ পণ্য আপডেট হয়েছে!';
    } else {
      await addProduct(productData);
      msg.textContent = '✅ পণ্য যোগ হয়েছে!';
    }

    msg.style.color = 'var(--success)';
    showToast(editId ? '✅ আপডেট হয়েছে' : '✅ যোগ হয়েছে', 'success');

    cancelProductEdit();
    await loadProducts();
    await renderCategoriesTable && loadCategories();

    setTimeout(() => { msg.textContent = ''; }, 3000);
  } catch (err) {
    console.error(err);
    msg.textContent = '❌ সমস্যা: ' + err.message;
    msg.style.color = 'var(--danger)';
  }
});

/* --- এডিট মোড --- */
window.editProduct = function(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  document.getElementById('editProductId').value = id;
  document.getElementById('p_name').value = p.name || '';
  document.getElementById('p_category').value = p.category || '';
  document.getElementById('p_price').value = p.price || '';
  document.getElementById('p_oldPrice').value = p.oldPrice || '';
  document.getElementById('p_brand').value = p.brand || '';
  document.getElementById('p_inStock').value = p.inStock === false ? 'false' : 'true';
  document.getElementById('p_colors').value = (p.colors || []).join(', ');
  document.getElementById('p_sizes').value = (p.sizes || []).join(', ');
  document.getElementById('p_description').value = p.description || '';
  document.getElementById('p_featured').checked = !!p.featured;
  document.getElementById('p_images').value = '';

  EDIT_IMAGES = p.images || [];
  renderImagePreview();

  document.getElementById('productFormTitle').textContent = 'পণ্য এডিট করুন';
  document.getElementById('productSubmitText').textContent = 'আপডেট করুন';
  document.getElementById('cancelEditBtn').style.display = 'inline-flex';

  // ফর্মে স্ক্রল
  document.getElementById('productForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.cancelProductEdit = function() {
  document.getElementById('editProductId').value = '';
  document.getElementById('productForm').reset();
  EDIT_IMAGES = [];
  document.getElementById('productImagesPreview').innerHTML = '';
  document.getElementById('productFormTitle').textContent = 'নতুন পণ্য যোগ করুন';
  document.getElementById('productSubmitText').textContent = 'যোগ করুন';
  document.getElementById('cancelEditBtn').style.display = 'none';
};

/* --- ছবি প্রিভিউ --- */
document.getElementById('p_images')?.addEventListener('change', (e) => {
  const files = e.target.files;
  const wrap = document.getElementById('productImagesPreview');
  wrap.innerHTML = '';

  // বর্তমান ছবি (এডিট মোডে)
  EDIT_IMAGES.forEach((url, i) => {
    const div = document.createElement('div');
    div.style.position = 'relative';
    div.innerHTML = `
      <img src="${url}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid var(--border);">
      <button type="button" onclick="removeEditImage(${i})" style="position:absolute;top:-4px;right:-4px;background:var(--danger);color:white;border-radius:50%;width:22px;height:22px;font-size:12px;line-height:1;">×</button>
    `;
    wrap.appendChild(div);
  });

  // নতুন ফাইল প্রিভিউ
  if (files) {
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const img = document.createElement('img');
      img.src = url;
      img.style.cssText = 'width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px dashed var(--primary);';
      wrap.appendChild(img);
    });
  }
});

function renderImagePreview() {
  const wrap = document.getElementById('productImagesPreview');
  if (!wrap) return;
  wrap.innerHTML = EDIT_IMAGES.map((url, i) => `
    <div style="position:relative;">
      <img src="${url}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid var(--border);">
      <button type="button" onclick="removeEditImage(${i})" style="position:absolute;top:-4px;right:-4px;background:var(--danger);color:white;border-radius:50%;width:22px;height:22px;font-size:12px;">×</button>
    </div>
  `).join('');
}

window.removeEditImage = function(index) {
  EDIT_IMAGES.splice(index, 1);
  renderImagePreview();
};

/* --- ডিলিট --- */
window.handleDeleteProduct = async function(id) {
  if (!confirm('পণ্যটি ডিলিট করবেন?')) return;
  try {
    await deleteProduct(id);
    showToast('🗑️ ডিলিট হয়েছে', 'success');
    await loadProducts();
    await loadCategories();
  } catch (err) {
    showToast('❌ সমস্যা হয়েছে', 'error');
  }
};

/* ============================================================
   💾 ব্যাকআপ — এক্সপোর্ট / ইমপোর্ট
   ============================================================ */

window.exportData = async function() {
  const msg = document.getElementById('backupMsg');
  msg.textContent = '⏳ প্রস্তুত হচ্ছে...';
  msg.style.color = 'var(--warning)';

  try {
    const data = {
      exportDate: new Date().toISOString(),
      settings: SETTINGS,
      categories: CATEGORIES,
      products: PRODUCTS
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopbd-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    msg.textContent = '✅ ডাউনলোড শুরু হয়েছে';
    msg.style.color = 'var(--success)';
    showToast('✅ ব্যাকআপ ডাউনলোড হয়েছে', 'success');
  } catch (err) {
    console.error(err);
    msg.textContent = '❌ সমস্যা: ' + err.message;
    msg.style.color = 'var(--danger)';
  }
};

window.importData = async function() {
  const fileInput = document.getElementById('importFile');
  const file = fileInput.files[0];
  const msg = document.getElementById('backupMsg');

  if (!file) {
    msg.textContent = '❌ আগে ফাইল সিলেক্ট করুন';
    msg.style.color = 'var(--danger)';
    return;
  }

  if (!confirm('ইমপোর্ট করলে নতুন ডাটা যোগ হবে (পুরনো মুছবে না)। চালিয়ে যাবেন?')) return;

  msg.textContent = '⏳ ইমপোর্ট হচ্ছে...';
  msg.style.color = 'var(--warning)';

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // সেটিংস
    if (data.settings) {
      await saveSettings(data.settings);
    }

    // ক্যাটাগরি
    if (data.categories && Array.isArray(data.categories)) {
      for (const c of data.categories) {
        const { id, createdAt, ...rest } = c;
        await addCategory(rest);
      }
    }

    // পণ্য
    if (data.products && Array.isArray(data.products)) {
      for (const p of data.products) {
        const { id, createdAt, ...rest } = p;
        await addProduct(rest);
      }
    }

    msg.textContent = '✅ ইমপোর্ট সম্পন্ন!';
    msg.style.color = 'var(--success)';
    showToast('✅ ইমপোর্ট সফল', 'success');

    SETTINGS = await getSettings();
    await loadCategories();
    await loadProducts();
    loadSettingsForm();
  } catch (err) {
    console.error(err);
    msg.textContent = '❌ সমস্যা: ' + err.message;
    msg.style.color = 'var(--danger)';
  }
};

/* ============================================================
   🧹 হেল্পার
   ============================================================ */

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}