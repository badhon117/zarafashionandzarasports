// Firebase কনফিগ (নিচে সেটআপ দেখানো হয়েছে)
const firebaseConfig = {
  apiKey: "তোমার_API_KEY",
  authDomain: "তোমার_প্রজেক্ট.firebaseapp.com",
  projectId: "তোমার_প্রজেক্ট",
  storageBucket: "তোমার_প্রজেক্ট.appspot.com",
  messagingSenderId: "তোমার_ID",
  appId: "তোমার_APP_ID"
};

// Firebase SDK লোড (index.html এর <head> এ যোগ করো)
// <script type="module" src="app.js"></script>

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, increment }
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const grid = document.getElementById('productGrid');

async function loadProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  grid.innerHTML = "";

  snapshot.forEach(docSnap => {
    const p = docSnap.data();
    const id = docSnap.id;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.imageUrl}" alt="${p.name}">
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${p.description || ''}</p>
        <div class="price">৳ ${p.price}</div>
        <div class="actions">
          <button class="btn like-btn" data-id="${id}">
            ❤️ <span class="like-count">${p.likes || 0}</span>
          </button>
          <a class="btn wa-btn" target="_blank"
             href="https://wa.me/8801XXXXXXXXX?text=${encodeURIComponent('আমি এই পণ্যটি কিনতে চাই: ' + p.name)}">
            WhatsApp
          </a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // লাইক বাটন
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      await updateDoc(doc(db, "products", id), { likes: increment(1) });
      btn.classList.add('liked');
      const countEl = btn.querySelector('.like-count');
      countEl.textContent = parseInt(countEl.textContent) + 1;
    });
  });
}

loadProducts();