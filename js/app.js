/* Haul – mobile shopping app (frontend only). Hash-routed, no build step. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const S = Store.state;
const view = $('#view');
const ui = { q: '', cat: 'All', sort: 'featured', dq: 1, inStockOnly: false, dealsOnly: false };

const money = n => CONFIG.currency + Math.round(n).toLocaleString('en-IN');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = id => PRODUCTS.find(p => p.id === Number(id));
const disc = p => Math.round((1 - p.price / p.mrp) * 100);
const maxQty = p => Math.min(p.stock, 10);

/* ---------- cart maths ---------- */
function cartItems() {
  return Object.entries(S.cart).map(([id, qty]) => ({ p: byId(id), qty })).filter(x => x.p);
}
function totals() {
  const items = cartItems();
  const subtotal = items.reduce((a, x) => a + x.p.price * x.qty, 0);
  const promo = S.promo && CONFIG.promos[S.promo];
  let discount = 0;
  if (promo) discount = promo.type === 'pct' ? subtotal * promo.value / 100 : Math.min(promo.value, subtotal);
  const after = subtotal - discount;
  const shipping = !subtotal || after >= CONFIG.freeShipOver ? 0 : CONFIG.shipFee;
  const tax = after * CONFIG.taxRate;
  return { items, count: items.reduce((a, x) => a + x.qty, 0), subtotal, discount, shipping, tax, total: after + shipping + tax };
}

/* ---------- small helpers ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}
function refreshBadge() {
  const n = totals().count, b = $('#cartBadge');
  b.hidden = !n; b.textContent = n;
}
function persist() { Store.save(); refreshBadge(); }
const stars = p => `<span class="rate"><b>★ ${p.rating}</b> (${p.reviews.toLocaleString('en-IN')})</span>`;
const go = h => { location.hash = h; };

/* ---------- components ---------- */
function productCard(p) {
  const wished = S.wishlist.includes(p.id);
  return `<article class="pcard">
    <a href="#/product/${p.id}" aria-label="${esc(p.name)}">
      <div class="tile" style="background:${p.color}"><span aria-hidden="true">${p.emoji}</span><span class="off">${disc(p)}% off</span></div>
    </a>
    <button class="heart ${wished ? 'on' : ''}" data-a="wish" data-id="${p.id}" aria-label="${wished ? 'Remove from saved' : 'Save item'}">${wished ? '♥' : '♡'}</button>
    <div class="pbody">
      <a class="pname" href="#/product/${p.id}">${esc(p.name)}</a>
      ${stars(p)}
      <div class="price">${money(p.price)}<span class="mrp">${money(p.mrp)}</span></div>
      ${p.stock ? '' : '<div class="oos">Out of stock</div>'}
      <button class="add" data-a="add" data-id="${p.id}" ${p.stock ? '' : 'disabled'}>${p.stock ? 'Add to cart' : 'Unavailable'}</button>
    </div>
  </article>`;
}

function filtered() {
  let list = PRODUCTS.filter(p =>
    (ui.cat === 'All' || p.cat === ui.cat) &&
    (!ui.inStockOnly || p.stock > 0) &&
    (!ui.dealsOnly || disc(p) >= 30) &&
    (p.name + ' ' + p.cat).toLowerCase().includes(ui.q.trim().toLowerCase()));
  const sorts = {
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    discount: (a, b) => disc(b) - disc(a)
  };
  if (sorts[ui.sort]) list = [...list].sort(sorts[ui.sort]);
  return list;
}
function gridHtml() {
  const list = filtered();
  if (!list.length) return `<div class="empty"><div class="big">🔍</div><h2>No matches</h2><p>Try a different word or pick another category.</p><button class="btn ghost" data-a="clearFilters">Clear filters</button></div>`;
  return `<div class="grid">${list.map(productCard).join('')}</div>`;
}

function topbar(title, { back = true, right = '' } = {}) {
  return `<header class="topbar">${back ? '<button class="iconbtn" data-a="back" aria-label="Go back">←</button>' : ''}<h1>${title}</h1>${right}</header>`;
}
function empty(icon, title, text, cta, href) {
  return `<div class="empty"><div class="big">${icon}</div><h2>${title}</h2><p>${text}</p><a class="btn" href="${href}">${cta}</a></div>`;
}

/* ---------- views ---------- */
function homeView() {
  const popular = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 4);
  view.innerHTML = `
    <header class="topbar"><div class="brand">${CONFIG.brand}<i>.</i></div></header>
    <div class="pad"><label class="search"><span aria-hidden="true">🔍</span>
      <input id="q" type="search" placeholder="Search earbuds, kettles, bags…" value="${esc(ui.q)}" aria-label="Search products"></label></div>
    <section class="hero">
      <span class="eyebrow">THE GOOD STUFF, GATHERED</span>
      <h1>Good finds.<br>Better prices.</h1>
      <p>Everyday upgrades, picked for you.</p>
      <div class="hero-meta"><span>✦ 4.5 average rating</span><span>🚚 Free delivery over ${money(CONFIG.freeShipOver)}</span></div>
    </section>
    <div class="banner"><div><b>New here? Save 10%</b><span>On your first order</span></div><button class="code" data-a="welcome">Use WELCOME10</button></div>
    <div class="chips" role="group" aria-label="Categories">
      ${CATEGORIES.map(c => `<button class="chip" data-a="cat" data-v="${c}" aria-pressed="${ui.cat === c}">${c}</button>`).join('')}
    </div>
    <div class="filters" role="group" aria-label="Product filters">
      <button class="filter ${ui.dealsOnly ? 'active' : ''}" data-a="filter" data-filter="dealsOnly" aria-pressed="${ui.dealsOnly}">✦ Deals 30%+</button>
      <button class="filter ${ui.inStockOnly ? 'active' : ''}" data-a="filter" data-filter="inStockOnly" aria-pressed="${ui.inStockOnly}">✓ In stock</button>
    </div>
    <h3 class="sec shelf-title">Popular right now <span>Top rated picks</span></h3>
    <div class="hscroll popular">${popular.map(productCard).join('')}</div>
    <div class="rowbar"><small id="count"></small>
      <select class="sort" id="sort" aria-label="Sort products">
        ${[['featured', 'Featured'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['rating', 'Top rated'], ['discount', 'Biggest discount']]
          .map(([v, l]) => `<option value="${v}" ${ui.sort === v ? 'selected' : ''}>${l}</option>`).join('')}
      </select></div>
    <div id="results">${gridHtml()}</div>`;
  $('#count').textContent = `${filtered().length} items`;
}
function updateResults() {
  $('#results').innerHTML = gridHtml();
  $('#count').textContent = `${filtered().length} items`;
  $$('.chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.v === ui.cat));
  $$('.filter').forEach(button => {
    const active = ui[button.dataset.filter];
    button.setAttribute('aria-pressed', active);
    button.classList.toggle('active', active);
  });
}

function productView(id) {
  const p = byId(id);
  if (!p) return go('#/');
  const wished = S.wishlist.includes(p.id);
  const inCart = S.cart[p.id] || 0;
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  view.innerHTML = `
    <div class="dhead">
      <button class="iconbtn back" data-a="back" aria-label="Go back">←</button>
      <button class="heart ${wished ? 'on' : ''}" data-a="wish" data-id="${p.id}" aria-label="Save item">${wished ? '♥' : '♡'}</button>
      <div class="tile big" style="background:${p.color}"><span aria-hidden="true">${p.emoji}</span></div>
    </div>
    <div class="dinfo">
      <div class="hint">${p.cat}</div>
      <h2>${esc(p.name)}</h2>
      ${stars(p)}
      <div class="dprice"><span class="price">${money(p.price)}</span><span class="mrp">${money(p.mrp)}</span><span class="pill">${disc(p)}% off</span></div>
      <p>${esc(p.desc)}</p>
      <div class="perks"><div>🚚 Free delivery above ${money(CONFIG.freeShipOver)}</div><div>↩︎ 7-day easy returns</div><div>🛡️ 1-year warranty</div><div>${p.stock ? (p.stock < 10 ? `⚠️ Only ${p.stock} left` : '✅ In stock') : '❌ Out of stock'}</div></div>
      ${inCart ? `<p class="good">${inCart} already in your cart</p>` : ''}
      ${related.length ? `<h3 class="sec" style="padding-left:0">More in ${p.cat}</h3><div class="hscroll" style="margin:0 -16px">${related.map(productCard).join('')}</div>` : ''}
    </div>
    <div class="buybar">
      <div class="stepper" aria-label="Quantity">
        <button data-a="dq-" aria-label="Decrease quantity">−</button><span id="dq">${ui.dq}</span><button data-a="dq+" data-max="${maxQty(p)}" aria-label="Increase quantity">+</button>
      </div>
      <button class="btn ghost" data-a="addQty" data-id="${p.id}" ${p.stock ? '' : 'disabled'}>Add to cart</button>
      <button class="btn" data-a="buyNow" data-id="${p.id}" ${p.stock ? '' : 'disabled'}>Buy now</button>
    </div>`;
}

function cartView() {
  const t = totals();
  if (!t.items.length) {
    view.innerHTML = topbar('Your cart', { back: false }) + empty('🛒', 'Your cart is empty', 'Browse the shop and add something you like.', 'Start shopping', '#/');
    return;
  }
  const toFree = CONFIG.freeShipOver - (t.subtotal - t.discount);
  const pct = Math.min(100, ((t.subtotal - t.discount) / CONFIG.freeShipOver) * 100);
  view.innerHTML = topbar(`Your cart (${t.count})`, { back: false }) +
    t.items.map(({ p, qty }) => `
      <div class="line">
        <a href="#/product/${p.id}" class="tile" style="background:${p.color}" aria-label="${esc(p.name)}">${p.emoji}</a>
        <div class="info">
          <a class="pname" href="#/product/${p.id}" style="min-height:0">${esc(p.name)}</a>
          <div class="price">${money(p.price * qty)}</div>
          <div class="foot">
            <div class="stepper"><button data-a="dec" data-id="${p.id}" aria-label="Decrease">−</button><span>${qty}</span><button data-a="inc" data-id="${p.id}" aria-label="Increase">+</button></div>
            <button class="link" data-a="remove" data-id="${p.id}">Remove</button>
          </div>
        </div>
      </div>`).join('') + `
    <div class="box">
      ${toFree > 0 ? `<div class="hint">Add ${money(toFree)} more for free delivery</div>` : `<div class="good">You've unlocked free delivery</div>`}
      <div class="bar"><i style="width:${pct}%"></i></div>
    </div>
    <div class="box">
      ${S.promo ? `<div style="display:flex;justify-content:space-between;align-items:center"><span class="good">${esc(S.promo)} applied (${CONFIG.promos[S.promo].label})</span><button class="link" data-a="removePromo">Remove</button></div>`
      : `<div class="promo"><input id="promo" type="text" placeholder="Promo code" autocapitalize="characters" aria-label="Promo code"><button class="btn dark" style="width:auto;padding:12px 18px" data-a="applyPromo">Apply</button></div><div id="promoErr" class="err"></div>`}
    </div>
    <div class="box sum">
      <div><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
      ${t.discount ? `<div class="good"><span>Discount</span><span>−${money(t.discount)}</span></div>` : ''}
      <div><span>Delivery</span><span>${t.shipping ? money(t.shipping) : 'Free'}</span></div>
      <div><span>Tax</span><span>${money(t.tax)}</span></div>
      <div class="total"><span>Total</span><span>${money(t.total)}</span></div>
    </div>
    <div class="pad"><a class="btn" href="#/checkout">Checkout · ${money(t.total)}</a></div>`;
}

function checkoutView() {
  const t = totals();
  if (!t.items.length) return go('#/cart');
  const u = S.user;
  view.innerHTML = topbar('Checkout') + `
    <form id="co" class="pad" novalidate>
      <h3 class="sec" style="padding-left:0;padding-top:4px">Delivery address</h3>
      <div class="field"><label for="name">Full name</label><input id="name" type="text" autocomplete="name" value="${esc(u.name)}"><span class="err"></span></div>
      <div class="two">
        <div class="field"><label for="phone">Mobile number</label><input id="phone" type="tel" inputmode="numeric" maxlength="10" autocomplete="tel" value="${esc(u.phone)}"><span class="err"></span></div>
        <div class="field"><label for="pin">PIN code</label><input id="pin" type="tel" inputmode="numeric" maxlength="6" value="${esc(u.pincode)}"><span class="err"></span></div>
      </div>
      <div class="field"><label for="addr">Address</label><textarea id="addr" rows="3" autocomplete="street-address">${esc(u.address)}</textarea><span class="err"></span></div>

      <h3 class="sec" style="padding-left:0">Payment</h3>
      <div class="pay" role="radiogroup">
        <label><input type="radio" name="pay" value="UPI" checked> UPI</label>
        <label><input type="radio" name="pay" value="Card"> Debit / credit card</label>
        <label><input type="radio" name="pay" value="COD"> Cash on delivery</label>
      </div>
      <div id="paybox" class="paybox"></div>

      <div class="box sum" style="margin:18px 0 12px">
        <div><span>Items (${t.count})</span><span>${money(t.subtotal)}</span></div>
        ${t.discount ? `<div class="good"><span>Discount</span><span>−${money(t.discount)}</span></div>` : ''}
        <div><span>Delivery</span><span>${t.shipping ? money(t.shipping) : 'Free'}</span></div>
        <div><span>Tax</span><span>${money(t.tax)}</span></div>
        <div class="total"><span>To pay</span><span>${money(t.total)}</span></div>
      </div>
      <p class="hint" style="margin-bottom:12px">Demo checkout: no real payment is taken and card details are never stored.</p>
      <button type="submit" class="btn">Place order · ${money(t.total)}</button>
    </form>`;
  renderPayBox();
}
function renderPayBox() {
  const m = ($('input[name=pay]:checked') || {}).value;
  const box = $('#paybox'); if (!box) return;
  box.innerHTML = m === 'UPI'
    ? `<div class="field"><label for="upi">UPI ID</label><input id="upi" type="text" placeholder="name@bank" autocapitalize="none"><span class="err"></span></div>`
    : m === 'Card'
    ? `<div class="field"><label for="cn">Card number</label><input id="cn" type="tel" inputmode="numeric" maxlength="19" placeholder="1234 5678 9012 3456"><span class="err"></span></div>
       <div class="two"><div class="field"><label for="exp">Expiry (MM/YY)</label><input id="exp" type="tel" maxlength="5" placeholder="08/29"><span class="err"></span></div>
       <div class="field"><label for="cvv">CVV</label><input id="cvv" type="password" inputmode="numeric" maxlength="4"><span class="err"></span></div></div>`
    : `<p class="hint">Pay in cash or by UPI when your order arrives.</p>`;
}
function setErr(id, msg) {
  const el = $('#' + id); if (!el) return true;
  const f = el.closest('.field'); f.classList.toggle('bad', !!msg);
  $('.err', f).textContent = msg || '';
  return !msg;
}
function placeOrder() {
  const v = id => ($('#' + id)?.value || '').trim();
  const method = $('input[name=pay]:checked').value;
  let ok = true;
  ok = setErr('name', v('name').length < 2 ? 'Enter your full name' : '') && ok;
  ok = setErr('phone', /^[6-9]\d{9}$/.test(v('phone')) ? '' : 'Enter a valid 10-digit mobile number') && ok;
  ok = setErr('pin', /^\d{6}$/.test(v('pin')) ? '' : 'Enter a 6-digit PIN code') && ok;
  ok = setErr('addr', v('addr').length < 10 ? 'Enter your full address' : '') && ok;
  if (method === 'UPI') ok = setErr('upi', /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v('upi')) ? '' : 'Enter a valid UPI ID like name@bank') && ok;
  if (method === 'Card') {
    ok = setErr('cn', v('cn').replace(/\s/g, '').length >= 13 ? '' : 'Enter a valid card number') && ok;
    const m = v('exp').match(/^(\d{2})\/(\d{2})$/);
    ok = setErr('exp', m && +m[1] >= 1 && +m[1] <= 12 ? '' : 'Use MM/YY') && ok;
    ok = setErr('cvv', /^\d{3,4}$/.test(v('cvv')) ? '' : '3 or 4 digits') && ok;
  }
  if (!ok) { toast('Please fix the highlighted fields'); $('.bad input, .bad textarea')?.focus(); return; }

  const t = totals();
  const order = {
    id: 'HL' + Date.now().toString().slice(-8),
    ts: Date.now(),
    items: t.items.map(x => ({ id: x.p.id, name: x.p.name, emoji: x.p.emoji, color: x.p.color, price: x.p.price, qty: x.qty })),
    total: t.total, payment: method,
    address: `${v('name')}, ${v('addr')} – ${v('pin')}`
  };
  S.orders.unshift(order);
  S.user = { name: v('name'), phone: v('phone'), address: v('addr'), pincode: v('pin') };
  S.cart = {}; S.promo = null; persist();
  go('#/success/' + order.id);
}

function successView(id) {
  view.innerHTML = `<div class="empty"><div class="tick">✓</div><h2>Order placed</h2>
    <p>Order <b>${esc(id)}</b> is confirmed. We'll keep you posted on delivery.</p>
    <a class="btn" href="#/orders" style="margin-bottom:10px">Track order</a><a class="btn ghost" href="#/">Keep shopping</a></div>`;
}

const STEPS = [['Placed', 0], ['Packed', 1], ['Shipped', 3], ['Out for delivery', 5], ['Delivered', 8]]; // minutes (demo timings)
function orderStatus(o) {
  const mins = (Date.now() - o.ts) / 60000;
  let i = 0; STEPS.forEach(([, m], idx) => { if (mins >= m) i = idx; });
  return i;
}
function ordersView() {
  view.innerHTML = topbar('Your orders', { back: false }) + (!S.orders.length
    ? empty('📦', 'No orders yet', 'Orders you place will show up here.', 'Shop now', '#/')
    : S.orders.map(o => {
      const i = orderStatus(o), done = i === STEPS.length - 1;
      return `<div class="box order">
        <div class="head"><span class="id">${esc(o.id)}</span><span class="status ${done ? 'done' : ''}">${STEPS[i][0]}</span></div>
        <div class="hint">${new Date(o.ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · ${esc(o.payment)}</div>
        <div class="steps">${STEPS.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>
        <div class="mini">${o.items.map(x => `<span style="background:${x.color}" title="${esc(x.name)}">${x.emoji}</span>`).join('')}</div>
        <div class="hint">${o.items.map(x => `${esc(x.name)} × ${x.qty}`).join(', ')}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
          <b>${money(o.total)}</b><button class="link" style="color:var(--blue)" data-a="reorder" data-id="${o.id}">Buy again</button></div>
      </div>`;
    }).join('') + `<p class="hint pad">Demo tracking moves forward over a few minutes.</p>`);
}

function wishlistView() {
  const list = S.wishlist.map(byId).filter(Boolean);
  view.innerHTML = topbar('Saved items', { back: false }) + (list.length
    ? `<div class="grid">${list.map(productCard).join('')}</div>`
    : empty('♡', 'Nothing saved yet', 'Tap the heart on any product to keep it here.', 'Browse products', '#/'));
}

function profileView() {
  const u = S.user;
  view.innerHTML = topbar('Your profile', { back: false }) + `
    <form id="pf" class="pad" novalidate>
      <div class="field"><label for="pname">Name</label><input id="pname" type="text" value="${esc(u.name)}"></div>
      <div class="field"><label for="pphone">Mobile</label><input id="pphone" type="tel" maxlength="10" value="${esc(u.phone)}"></div>
      <div class="field"><label for="paddr">Default address</label><textarea id="paddr" rows="3">${esc(u.address)}</textarea></div>
      <div class="field"><label for="ppin">PIN code</label><input id="ppin" type="tel" maxlength="6" value="${esc(u.pincode)}"></div>
      <button class="btn" type="submit">Save profile</button>
    </form>
    <div class="box" style="margin-top:20px"><b>Reset demo data</b><p class="hint" style="margin:4px 0 10px">Clears your cart, saved items, orders and profile on this device.</p>
      <button class="btn ghost" data-a="reset">Clear all data</button></div>`;
}

/* ---------- router ---------- */
function route() {
  const [, page = '', arg] = (location.hash.slice(1) || '/').split('/');
  const tab = { '': 'home', wishlist: 'wishlist', cart: 'cart', orders: 'orders', profile: 'profile' }[page];
  $('#nav').classList.toggle('hide', ['product', 'checkout'].includes(page));
  $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
  if (page === 'product') ui.dq = 1;
  ({ '': homeView, product: () => productView(arg), cart: cartView, checkout: checkoutView,
     success: () => successView(arg), orders: ordersView, wishlist: wishlistView, profile: profileView }[page] || homeView)();
  view.scrollTop = 0;
  refreshBadge();
}
window.addEventListener('hashchange', route);

/* ---------- actions ---------- */
function addToCart(id, n = 1) {
  const p = byId(id); if (!p || !p.stock) return false;
  const cur = S.cart[p.id] || 0, next = Math.min(cur + n, maxQty(p));
  if (next === cur) { toast(`Max ${maxQty(p)} per order`); return false; }
  S.cart[p.id] = next; persist(); return true;
}
function rerender() { const y = view.scrollTop; route(); view.scrollTop = y; }

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  const a = el.dataset.a, id = Number(el.dataset.id);
  switch (a) {
    case 'back': history.length > 1 ? history.back() : go('#/'); break;
    case 'cat': ui.cat = el.dataset.v; updateResults(); break;
    case 'filter': ui[el.dataset.filter] = !ui[el.dataset.filter]; updateResults(); break;
    case 'clearFilters':
      ui.q = ''; ui.cat = 'All'; ui.sort = 'featured'; ui.inStockOnly = false; ui.dealsOnly = false; homeView(); break;
    case 'welcome': S.promo = 'WELCOME10'; persist(); toast('WELCOME10 applied to your cart'); break;
    case 'add': if (addToCart(id)) toast('Added to cart'); break;
    case 'wish': {
      const i = S.wishlist.indexOf(id);
      i > -1 ? S.wishlist.splice(i, 1) : S.wishlist.push(id);
      persist(); toast(i > -1 ? 'Removed from saved' : 'Saved');
      el.classList.toggle('on', i === -1); el.textContent = i === -1 ? '♥' : '♡';
      if (location.hash === '#/wishlist') rerender();
      break;
    }
    case 'dq-': ui.dq = Math.max(1, ui.dq - 1); $('#dq').textContent = ui.dq; break;
    case 'dq+': ui.dq = Math.min(Number(el.dataset.max), ui.dq + 1); $('#dq').textContent = ui.dq; break;
    case 'addQty': if (addToCart(id, ui.dq)) toast(`${ui.dq} added to cart`); break;
    case 'buyNow': if (addToCart(id, ui.dq) || S.cart[id]) go('#/checkout'); break;
    case 'inc': addToCart(id); rerender(); break;
    case 'dec': S.cart[id] > 1 ? S.cart[id]-- : delete S.cart[id]; persist(); rerender(); break;
    case 'remove': delete S.cart[id]; persist(); rerender(); toast('Removed'); break;
    case 'applyPromo': {
      const code = ($('#promo').value || '').trim().toUpperCase();
      if (CONFIG.promos[code]) { S.promo = code; persist(); rerender(); toast('Promo applied'); }
      else $('#promoErr').textContent = code ? 'That code isn’t valid. Try WELCOME10 or FLAT100.' : 'Enter a promo code';
      break;
    }
    case 'removePromo': S.promo = null; persist(); rerender(); break;
    case 'reorder': {
      const o = S.orders.find(x => x.id === el.dataset.id);
      o && o.items.forEach(x => addToCart(x.id, x.qty)); go('#/cart'); break;
    }
    case 'reset': if (confirm('Clear all saved data on this device?')) { Store.reset(); route(); toast('Data cleared'); } break;
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'q') { ui.q = e.target.value; updateResults(); }
});
document.addEventListener('change', e => {
  if (e.target.id === 'sort') { ui.sort = e.target.value; updateResults(); }
  if (e.target.name === 'pay') renderPayBox();
});
document.addEventListener('submit', e => {
  e.preventDefault();
  if (e.target.id === 'co') placeOrder();
  if (e.target.id === 'pf') {
    const v = id => $('#' + id).value.trim();
    S.user = { name: v('pname'), phone: v('pphone'), address: v('paddr'), pincode: v('ppin') };
    persist(); toast('Profile saved');
  }
});

route();
