const itemsContainer = document.getElementById('cartItemsContainer');
const summaryCard = document.getElementById('summaryCard');

function renderCart() {
  const cart = getCart();

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="empty-state">
        <div class="icon">🛒</div>
        <p style="margin-bottom:16px;">আপনার কার্ট খালি</p>
        <a href="shop.html" class="btn-primary">কেনাকাটা শুরু করুন</a>
      </div>`;
    summaryCard.style.display = 'none';
    return;
  }

  summaryCard.style.display = 'block';
  itemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item fade-in">
      <img src="${item.imageUrl}" alt="${item.name}">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <div class="price">৳ ${item.price}</div>
        <div class="quantity-selector" style="margin:8px 0 0;">
          <button onclick="changeCartQty('${item.id}', ${item.qty - 1})">−</button>
          <input type="number" value="${item.qty}" readonly style="width:50px;height:36px;">
          <button onclick="changeCartQty('${item.id}', ${item.qty + 1})">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeCartItem('${item.id}')">🗑️</button>
    </div>
  `).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = DELIVERY_CHARGE;
  document.getElementById('subtotal').textContent = `৳ ${subtotal}`;
  document.getElementById('delivery').textContent = `৳ ${delivery}`;
  document.getElementById('grandTotal').textContent = `৳ ${subtotal + delivery}`;
}

function changeCartQty(id, qty) {
  if (qty < 1) return;
  updateCartQty(id, qty);
  renderCart();
}

function removeCartItem(id) {
  removeFromCart(id);
  renderCart();
  showToast('🗑️ সরানো হয়েছে', 'success');
}

function goCheckout() {
  if (getCart().length === 0) { showToast('কার্ট খালি!', 'error'); return; }
  window.location.href = 'checkout.html';
}

renderCart();