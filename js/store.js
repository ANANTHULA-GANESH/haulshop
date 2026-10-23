// ---- Tiny persistent store (localStorage) ----
const KEY = 'haul-shop-v1';
const defaults = {
  cart: {},          // { productId: qty }
  wishlist: [],      // [productId]
  orders: [],        // [{id, ts, items, totals, address, payment}]
  promo: null,       // 'WELCOME10'
  user: { name: '', phone: '', address: '', pincode: '' }
};

const Store = {
  state: structuredCloneSafe(defaults),
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.state = Object.assign(structuredCloneSafe(defaults), JSON.parse(raw));
    } catch (e) { /* storage blocked: keep in-memory defaults */ }
  },
  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch (e) {}
  },
  reset() { Object.assign(this.state, structuredCloneSafe(defaults)); this.save(); }
};

function structuredCloneSafe(o) { return JSON.parse(JSON.stringify(o)); }
Store.load();
