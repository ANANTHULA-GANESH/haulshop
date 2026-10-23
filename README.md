# Haul – Mobile Shopping App (frontend only)

Plain HTML + CSS + JavaScript. No build step, no dependencies.

## Run
Open `index.html` in a browser (on desktop it shows in a phone-sized frame).
For phone testing on the same Wi-Fi:  `python3 -m http.server 8000`  then open `http://<your-computer-ip>:8000`.

## Features
- Storefront hero with popular picks, welcome offer, product search, category chips, deal and stock filters, and sorting
- Product detail page with quantity picker, Add to cart, Buy now, related items
- Cart with quantity controls, promo codes (WELCOME10, FLAT100), free-delivery progress, tax and totals
- Checkout with validation (UPI, card, cash on delivery) – demo only, no real payment
- Order confirmation, order history with demo tracking, Buy again
- Saved items (wishlist) and profile with default address
- Data persists in localStorage

## Customise
- `js/data.js` – products, categories, currency, shipping fee, tax, promo codes
- `css/styles.css` – colours and fonts are CSS variables at the top
- `js/app.js` – screens and behaviour
- To connect a backend later, replace `PRODUCTS` with a fetch() call and send the order object in `placeOrder()` to your API.
