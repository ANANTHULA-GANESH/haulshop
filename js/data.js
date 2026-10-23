// ---- Store configuration (edit freely) ----
const CONFIG = {
  brand: 'Haul',
  currency: '₹',
  freeShipOver: 999,   // free delivery above this subtotal
  shipFee: 49,
  taxRate: 0.05,       // 5% tax
  promos: {
    WELCOME10: { type: 'pct',  value: 10,  label: '10% off' },
    FLAT100:   { type: 'flat', value: 100, label: '₹100 off' }
  }
};

const CATEGORIES = ['All', 'Audio', 'Wearables', 'Home', 'Kitchen', 'Fitness', 'Bags'];

// Emoji + colour tiles keep the app fully offline. Swap `emoji` for an `img` URL if you like.
const PRODUCTS = [
  { id: 1,  name: 'Aero Wireless Earbuds',   cat: 'Audio',     price: 2499, mrp: 3999, rating: 4.5, reviews: 1284, emoji: '🎧', color: '#C9D6FF', stock: 14, desc: 'Active noise cancelling, 28-hour battery with case, and a low-latency mode for video and games.' },
  { id: 2,  name: 'Pulse Smartwatch S2',     cat: 'Wearables', price: 3299, mrp: 4999, rating: 4.3, reviews: 892,  emoji: '⌚', color: '#FFD9C2', stock: 9,  desc: 'AMOLED display, heart-rate and sleep tracking, 7-day battery and 5ATM water resistance.' },
  { id: 3,  name: 'Brew Pour-Over Kettle',   cat: 'Kitchen',   price: 1899, mrp: 2499, rating: 4.7, reviews: 431,  emoji: '🫖', color: '#E4F0C8', stock: 20, desc: 'Gooseneck spout, built-in temperature control and a keep-warm mode. Stainless steel, 1 L.' },
  { id: 4,  name: 'Lumen Desk Lamp',         cat: 'Home',      price: 1299, mrp: 1799, rating: 4.4, reviews: 612,  emoji: '💡', color: '#FFF1B8', stock: 30, desc: 'Dimmable LED with three colour temperatures and a USB charging port in the base.' },
  { id: 5,  name: 'Trek Everyday Backpack',  cat: 'Bags',      price: 1799, mrp: 2599, rating: 4.6, reviews: 2210, emoji: '🎒', color: '#CDE9E0', stock: 18, desc: '22 L water-resistant pack with a padded 15" laptop sleeve and hidden anti-theft pocket.' },
  { id: 6,  name: 'Flex Yoga Mat 6mm',       cat: 'Fitness',   price: 899,  mrp: 1399, rating: 4.2, reviews: 745,  emoji: '🧘', color: '#E7D4F5', stock: 40, desc: 'Non-slip texture, extra cushioning and a carry strap. Easy to wipe clean.' },
  { id: 7,  name: 'Bolt Bluetooth Speaker',  cat: 'Audio',     price: 1999, mrp: 2999, rating: 4.4, reviews: 1530, emoji: '🔊', color: '#FFC9D4', stock: 12, desc: 'IP67 waterproof, 360° sound and 16 hours of playtime. Pair two for stereo.' },
  { id: 8,  name: 'Mist Air Purifier',       cat: 'Home',      price: 6499, mrp: 8999, rating: 4.5, reviews: 388,  emoji: '🌬️', color: '#D5EEF7', stock: 6,  desc: 'True HEPA filter for rooms up to 400 sq ft with a whisper-quiet night mode.' },
  { id: 9,  name: 'Forge Cast-Iron Skillet', cat: 'Kitchen',   price: 1599, mrp: 2199, rating: 4.8, reviews: 976,  emoji: '🍳', color: '#D9D9D9', stock: 22, desc: 'Pre-seasoned 10-inch skillet that works on gas, induction and oven. Lasts for decades.' },
  { id: 10, name: 'Stride Running Shoes',    cat: 'Fitness',   price: 3499, mrp: 5499, rating: 4.3, reviews: 1804, emoji: '👟', color: '#FFE0B8', stock: 15, desc: 'Breathable knit upper with responsive foam midsole. Built for daily 5–10 km runs.' },
  { id: 11, name: 'Band Fit Tracker Lite',   cat: 'Wearables', price: 1499, mrp: 2299, rating: 4.1, reviews: 2045, emoji: '📿', color: '#CFE3FF', stock: 35, desc: 'Steps, calories, SpO2 and 14-day battery in a slim, comfortable band.' },
  { id: 12, name: 'Nomad Duffel 35L',        cat: 'Bags',      price: 2199, mrp: 2999, rating: 4.5, reviews: 519,  emoji: '🧳', color: '#F3D9C8', stock: 11, desc: 'Weekend-sized duffel with a shoe compartment, wet pocket and a trolley-strap sleeve.' },
  { id: 13, name: 'Halo Smart Bulb (2 pack)',cat: 'Home',      price: 799,  mrp: 1199, rating: 4.2, reviews: 3310, emoji: '🔆', color: '#FFF6C9', stock: 60, desc: '16 million colours, voice-assistant ready. No hub needed — connects over Wi-Fi.' },
  { id: 14, name: 'Grind Burr Coffee Mill',  cat: 'Kitchen',   price: 2799, mrp: 3799, rating: 4.6, reviews: 302,  emoji: '☕', color: '#E8D5C4', stock: 0,  desc: '30 grind settings from espresso to French press. Quiet motor, easy-clean burrs.' },
  { id: 15, name: 'Core Resistance Bands',   cat: 'Fitness',   price: 599,  mrp: 999,  rating: 4.4, reviews: 1120, emoji: '🏋️', color: '#D5F0D2', stock: 50, desc: 'Set of five latex bands with handles, door anchor and a carry pouch.' },
  { id: 16, name: 'Studio Over-Ear Headset', cat: 'Audio',     price: 4299, mrp: 6499, rating: 4.7, reviews: 664,  emoji: '🎚️', color: '#D8D4FF', stock: 8,  desc: 'Studio-tuned drivers, memory-foam cushions and a detachable cable for wired listening.' }
];
