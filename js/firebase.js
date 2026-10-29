/* ============================================================
   ShopBD — Firebase Helper Functions
   সব ফাংশন এখানে — সব পেজ এই ফাইলটি ব্যবহার করবে।
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getFirestore, collection, doc, getDoc, getDocs,
  addDoc, updateDoc, deleteDoc, setDoc, query, where, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

/* ============================================================
   📖 পড়া (READ) ফাংশন
   ============================================================ */

// দোকানের সেটিংস নাও (একটাই ডকুমেন্ট: settings/main)
export async function getSettings() {
  try {
    const snap = await getDoc(doc(db, "settings", "main"));
    if (!snap.exists()) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...snap.data() };
  } catch (err) {
    console.error("Settings লোডে সমস্যা:", err);
    return { ...DEFAULT_SETTINGS };
  }
}

// সব ক্যাটাগরি নাও (order অনুযায়ী সাজানো)
export async function getCategories() {
  try {
    const snap = await getDocs(collection(db, "categories"));
    if (snap.empty) return [];
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    return list.sort((a, b) => (a.order || 99) - (b.order || 99));
  } catch (err) {
    console.error("Categories লোডে সমস্যা:", err);
    return [];
  }
}

// সব পণ্য নাও
export async function getProducts() {
  try {
    const snap = await getDocs(collection(db, "products"));
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    return list.sort((a, b) => {
      const tA = a.createdAt?.seconds || 0;
      const tB = b.createdAt?.seconds || 0;
      return tB - tA;
    });
  } catch (err) {
    console.error("Products লোডে সমস্যা:", err);
    return [];
  }
}

// একটা নির্দিষ্ট পণ্য
export async function getProduct(id) {
  try {
    const snap = await getDoc(doc(db, "products", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error("Product লোডে সমস্যা:", err);
    return null;
  }
}

// ক্যাটাগরি অনুযায়ী পণ্য
export async function getProductsByCategory(category) {
  try {
    const q = query(collection(db, "products"), where("category", "==", category));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (err) {
    console.error("Products by category লোডে সমস্যা:", err);
    return [];
  }
}

// ফিচার্ড পণ্য (হোমপেজের জন্য)
export async function getFeaturedProducts(max = 8) {
  try {
    const all = await getProducts();
    return all.filter(p => p.featured).slice(0, max);
  } catch (err) {
    return [];
  }
}

/* ============================================================
   ✍️ লেখা (WRITE) ফাংশন
   ============================================================ */

// সেটিংস সেভ করো
export async function saveSettings(data) {
  try {
    await setDoc(doc(db, "settings", "main"), data, { merge: true });
    return true;
  } catch (err) {
    console.error("Settings সেভে সমস্যা:", err);
    throw err;
  }
}

// নতুন ক্যাটাগরি যোগ
export async function addCategory(data) {
  try {
    const ref = await addDoc(collection(db, "categories"), {
      ...data,
      createdAt: new Date()
    });
    return ref.id;
  } catch (err) {
    console.error("Category যোগে সমস্যা:", err);
    throw err;
  }
}

// ক্যাটাগরি আপডেট
export async function updateCategory(id, data) {
  try {
    await updateDoc(doc(db, "categories", id), data);
    return true;
  } catch (err) {
    console.error("Category আপডেটে সমস্যা:", err);
    throw err;
  }
}

// ক্যাটাগরি ডিলিট
export async function deleteCategory(id) {
  try {
    await deleteDoc(doc(db, "categories", id));
    return true;
  } catch (err) {
    console.error("Category ডিলিটে সমস্যা:", err);
    throw err;
  }
}

// নতুন পণ্য যোগ
export async function addProduct(data) {
  try {
    const ref = await addDoc(collection(db, "products"), {
      ...data,
      likes: data.likes || 0,
      createdAt: new Date()
    });
    return ref.id;
  } catch (err) {
    console.error("Product যোগে সমস্যা:", err);
    throw err;
  }
}

// পণ্য আপডেট
export async function updateProduct(id, data) {
  try {
    await updateDoc(doc(db, "products", id), data);
    return true;
  } catch (err) {
    console.error("Product আপডেটে সমস্যা:", err);
    throw err;
  }
}

// পণ্য ডিলিট
export async function deleteProduct(id) {
  try {
    await deleteDoc(doc(db, "products", id));
    return true;
  } catch (err) {
    console.error("Product ডিলিটে সমস্যা:", err);
    throw err;
  }
}

/* ============================================================
   ❤️ লাইক সিস্টেম
   ============================================================ */

// লাইক বাড়াও
export async function likeProduct(id) {
  try {
    const snap = await getDoc(doc(db, "products", id));
    if (!snap.exists()) return false;
    const current = snap.data().likes || 0;
    await updateDoc(doc(db, "products", id), { likes: current + 1 });
    return current + 1;
  } catch (err) {
    console.error("Like সমস্যা:", err);
    return false;
  }
}

/* ============================================================
   ☁️ Cloudinary-তে ছবি আপলোড
   ============================================================ */

export async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.secure_url;
  } catch (err) {
    console.error("Image upload সমস্যা:", err);
    throw err;
  }
}

// একাধিক ছবি একসাথে আপলোড
export async function uploadMultipleImages(files) {
  const urls = [];
  for (const file of files) {
    try {
      const url = await uploadImage(file);
      urls.push(url);
    } catch (err) {
      console.error("একটা ছবি আপলোডে সমস্যা:", err);
    }
  }
  return urls;
}

/* ============================================================
   🎁 প্রথমবার ডিফল্ট ডাটা তৈরি
   ============================================================ */

export async function ensureDefaults() {
  try {
    // সেটিংস
    const settingsSnap = await getDoc(doc(db, "settings", "main"));
    if (!settingsSnap.exists()) {
      await setDoc(doc(db, "settings", "main"), DEFAULT_SETTINGS);
      console.log("✅ ডিফল্ট সেটিংস তৈরি হয়েছে");
    }

    // ক্যাটাগরি
    const catSnap = await getDocs(collection(db, "categories"));
    if (catSnap.empty) {
      for (const cat of DEFAULT_CATEGORIES) {
        await addDoc(collection(db, "categories"), {
          ...cat,
          createdAt: new Date()
        });
      }
      console.log("✅ ডিফল্ট ক্যাটাগরি তৈরি হয়েছে");
    }

    // পণ্য
    const prodSnap = await getDocs(collection(db, "products"));
    if (prodSnap.empty) {
      for (const prod of DEFAULT_PRODUCTS) {
        await addDoc(collection(db, "products"), {
          ...prod,
          likes: prod.likes || 0,
          createdAt: new Date()
        });
      }
      console.log("✅ ডিফল্ট পণ্য তৈরি হয়েছে");
    }
  } catch (err) {
    console.error("ডিফল্ট ডাটা তৈরিতে সমস্যা:", err);
  }
}

/* ============================================================
   🎨 থিমের রঙ প্রয়োগ
   ============================================================ */

export function applyThemeColors(settings) {
  if (settings.primaryColor) {
    document.documentElement.style.setProperty("--primary", settings.primaryColor);
    // primary-dark অনুমান (একটু গাঢ়)
    const dark = shadeColor(settings.primaryColor, -15);
    document.documentElement.style.setProperty("--primary-dark", dark);
  }
  if (settings.accentColor) {
    document.documentElement.style.setProperty("--accent", settings.accentColor);
  }
}

// রঙ গাঢ়/হালকা করা
function shadeColor(hex, percent) {
  try {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  } catch { return hex; }
}

/* ============================================================
   🧹 হেল্পার
   ============================================================ */

export function formatPrice(n) {
  if (!n) return "0";
  return Number(n).toLocaleString("bn-BD");
}

export { db, app };