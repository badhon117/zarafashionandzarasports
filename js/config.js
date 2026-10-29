/* ============================================================
   ShopBD — কনফিগারেশন ফাইল
   শুধু এই ফাইলটি এডিট করলেই সব সেটিংস বদলানো যাবে।
   ============================================================ */

// 🔐 অ্যাডমিন পাসওয়ার্ড (এটা পরিবর্তন করো!)
const ADMIN_PASSWORD = "McBn@2509";

// 🔥 Firebase কনফিগ (এখানে FIREBASE_CONFIG নাম দিতে হবে, বড় হাতের অক্ষরে)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDIZxjVfugpnD4UDhTxb4NWrwEdPuapKqA",
  authDomain: "zara-fashion-and-zara-sports.firebaseapp.com",
  projectId: "zara-fashion-and-zara-sports",
  storageBucket: "zara-fashion-and-zara-sports.firebasestorage.app",
  messagingSenderId: "397669585408",
  appId: "1:397669585408:web:b342fa39cb8f6a2d65fee5"
};

// ☁️ Cloudinary কনফিগ (এখানে তোমার স্ক্রিনশটের সঠিক নামটা বসানো হলো)
const CLOUDINARY_CLOUD_NAME = "er7pmr3d"; 
const CLOUDINARY_UPLOAD_PRESET = "shop_upload";

// ============================================================
// 🎁 ডিফল্ট ডাটা
// ============================================================

const DEFAULT_SETTINGS = {
  shopName: "Zara Fashon & Zara Sports",
  tagline: "মানসম্মত কাপড়ের বিশ্বস্ত ঠিকানা",
  logo: "",                    
  banner: "",                  
  phone: "8801718788999",
  whatsapp: "8801718788999",
  address: "এসআরডি কলেজ রোড, রামপুর বাজার, কিশোরগঞ্জ",
  mapLink: "https://share.google/amFqtrOtoovmufTsX",
  openTime: "সকাল ১০টা - রাত ১০টা",
  openDays: "প্রতিদিন",
  facebook: "",
  instagram: "",
  primaryColor: "#6366f1",
  accentColor: "#ec4899"
};

const DEFAULT_CATEGORIES = [
  { name: "শাড়ি", emoji: "🥻", order: 1 },
  { name: "পাঞ্জাবি", emoji: "👔", order: 2 },
  { name: "থ্রি-পিস", emoji: "👗", order: 3 },
  { name: "শার্ট", emoji: "👕", order: 4 }
];

const DEFAULT_PRODUCTS = [
  {
    name: "নীল জামদানি শাড়ি",
    category: "শাড়ি",
    price: 2500,
    oldPrice: 3000,
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"],
    colors: ["নীল", "সোনালি"],
    sizes: ["ফ্রি সাইজ"],
    brand: "ঢাকা জামদানি",
    description: "হাতে বোনা খাঁটি জামদানি শাড়ি। উৎসব বা বিয়ের অনুষ্ঠানের জন্য পারফেক্ট।",
    inStock: true,
    featured: true,
    likes: 12
  },
  {
    name: "সাদা পাঞ্জাবি",
    category: "পাঞ্জাবি",
    price: 1500,
    oldPrice: 1800,
    images: ["https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=600"],
    colors: ["সাদা"],
    sizes: ["M", "L", "XL"],
    brand: "লোকাল",
    description: "আরামদায়ক সুতি কাপড়ের পাঞ্জাবি। ঈদ ও দাওয়াতের জন্য আদর্শ।",
    inStock: true,
    featured: true,
    likes: 8
  },
  {
    name: "গোলাপি থ্রি-পিস",
    category: "থ্রি-পিস",
    price: 1800,
    oldPrice: null,
    images: ["https://images.unsplash.com/photo-1617170567086-7d2c9c5a0b0a?w=600"],
    colors: ["গোলাপি", "সাদা"],
    sizes: ["M", "L"],
    brand: "লোকাল",
    description: "সুন্দর ডিজাইনের থ্রি-পিস। নিয়মিত পরার জন্য আরামদায়ক।",
    inStock: true,
    featured: false,
    likes: 5
  }
];