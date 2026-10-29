/* ============================================================
   ShopBD — দোকান সম্পর্কে পেজ
   ============================================================ */

import {
  getSettings, applyThemeColors
} from "./firebase.js";

async function init() {
  const s = await getSettings();
  applyThemeColors(s);
  renderHeader(s);
  renderDrawer(s);
  renderFooter(s);

  document.title = `আমাদের সম্পর্কে — ${s.shopName}`;

  document.getElementById('shopNameHero').textContent = s.shopName || 'আমার দোকান';
  document.getElementById('taglineHero').textContent = s.tagline || '';

  // ঠিকানা
  document.getElementById('aboutAddress').textContent = s.address || 'ঠিকানা সেট করা হয়নি';
  document.getElementById('aboutTime').textContent = `${s.openTime || '-'} ${s.openDays ? '• ' + s.openDays : ''}`;

  // ফোন
  const phoneEl = document.getElementById('aboutPhone');
  if (s.phone) {
    phoneEl.innerHTML = `<a href="tel:${s.phone}" style="color:var(--primary);font-weight:600;">${s.phone}</a>`;
  }

  // WhatsApp
  const waEl = document.getElementById('aboutWa');
  if (s.whatsapp) {
    waEl.innerHTML = `<a href="https://wa.me/${s.whatsapp}" target="_blank" style="color:var(--success);font-weight:600;">+${s.whatsapp}</a>`;
  }

  // ম্যাপ embed
  const mapContainer = document.getElementById('mapContainer');
  if (s.mapLink) {
    // Google Maps link থেকে embed URL বানানোর চেষ্টা
    const embedUrl = getEmbedUrl(s.mapLink);
    if (embedUrl) {
      mapContainer.innerHTML = `<iframe src="${embedUrl}" width="100%" height="300" style="border:0;" allowfullscreen loading="lazy"></iframe>`;
    } else {
      mapContainer.innerHTML = `<div style="padding:40px;text-align:center;background:var(--bg);color:var(--text-muted);">📍 ম্যাপ প্রিভিউ উপলব্ধ নেই — নিচের বাটনে ক্লিক করুন</div>`;
    }
    document.getElementById('mapLinkBtn').href = s.mapLink;
  } else {
    mapContainer.innerHTML = `<div style="padding:40px;text-align:center;background:var(--bg);color:var(--text-muted);">ম্যাপ লিংক সেট করা হয়নি</div>`;
    document.getElementById('mapLinkBtn').style.display = 'none';
  }

  // বাটন
  const callBtn = document.getElementById('callBtn');
  if (s.phone) {
    callBtn.href = `tel:${s.phone}`;
  } else {
    callBtn.style.display = 'none';
  }

  const waChatBtn = document.getElementById('waChatBtn');
  if (s.whatsapp) {
    waChatBtn.href = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি দোকান সম্পর্কে জানতে চাই।')}`;
  } else {
    waChatBtn.style.display = 'none';
  }

  const fbBtn = document.getElementById('fbBtn');
  if (s.facebook) {
    fbBtn.href = s.facebook;
    fbBtn.style.display = 'inline-flex';
  }

  const igBtn = document.getElementById('igBtn');
  if (s.instagram) {
    igBtn.href = s.instagram;
    igBtn.style.display = 'inline-flex';
  }
}

/* Google Maps link → embed URL */
function getEmbedUrl(link) {
  try {
    if (link.includes('google.com/maps')) {
      // https://www.google.com/maps?q=lat,lng → embed
      if (link.includes('/maps?q=') || link.includes('/maps/place/')) {
        return link.replace('/maps?', '/maps?').replace('/maps/place/', '/maps?q=') + '&output=embed';
      }
      return link + (link.includes('?') ? '&output=embed' : '?output=embed');
    }
    return null;
  } catch { return null; }
}

init();