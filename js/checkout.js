import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

const cart = getCart();

if (cart.length === 0) {
  alert('কার্ট খালি! আগে পণ্য যোগ করুন।');
  window.location.href = 'shop.html';
}

// সামারি রেন্ডার
document.getElementById('checkoutItems').innerHTML = cart.map(i => `
  <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:0.9rem;border-bottom:1px dashed var(--border);">
    <span>${i.name} × ${i.qty}</span>
    <span>৳ ${i.price * i.qty}</span>
  </div>
`).join('');

const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
document.getElementById('subtotal').textContent = `৳ ${subtotal}`;
document.getElementById('delivery').textContent = `৳ ${DELIVERY_CHARGE}`;
document.getElementById('grandTotal').textContent = `৳ ${subtotal + DELIVERY_CHARGE}`;

// ফর্ম সাবমিট
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const order = {
    customerName: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    note: document.getElementById('note').value,
    items: cart,
    subtotal,
    delivery: DELIVERY_CHARGE,
    total: subtotal + DELIVERY_CHARGE,
    status: 'pending',
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "orders"), order);

    // হোয়াটসঅ্যাপে মেসেজ
    const msg = `🛒 নতুন অর্ডার!\n\n👤 নাম: ${order.customerName}\n📱 ফোন: ${order.phone}\n📍 ঠিকানা: ${order.address}, ${order.city}\n\n` +
      cart.map(i => `• ${i.name} × ${i.qty} = ৳${i.price*i.qty}`).join('\n') +
      `\n\n💰 মোট: ৳${order.total}`;

    // কার্ট ক্লিয়ার
    localStorage.removeItem('cart');

    // সাকসেস
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--bg);">
        <div style="background:var(--card);padding:40px;border-radius:16px;text-align:center;max-width:400px;">
          <div style="font-size:4rem;margin-bottom:16px;">🎉</div>
          <h1 style="margin-bottom:12px;">অর্ডার সফল!</h1>
          <p style="color:var(--text-muted);margin-bottom:24px;">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
          <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}" target="_blank"
             class="btn-primary btn-wa" style="display:inline-flex;margin-bottom:12px;width:100%;">
            💬 WhatsApp এ কনফার্ম করুন
          </a>
          <a href="index.html" class="btn-outline" style="display:block;">হোমে ফিরুন</a>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    showToast('অর্ডার ব্যর্থ! আবার চেষ্টা করুন।', 'error');
  }
});