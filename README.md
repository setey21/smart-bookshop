# Little Bookshop

A browser-only React/Vite bookstore demo. It includes local demo accounts, a sample book catalogue, favorites, admin screens, a cart, and a simulated checkout. It does not use Supabase, another backend, or a payment provider.

## Start locally

1. Install Node.js (current LTS).
2. Run `npm install`.
3. Run `npm run dev` and open the local URL printed by Vite.

If port 5173 is already in use, Vite automatically selects another port (such as 5174). That is normal; use the URL Vite prints.

## Demo sign-in

- Customer: `reader@little-bookshop.demo` / `reader12345`
- Admin: `admin@little-bookshop.demo` / `admin12345`

You can also create a customer demo account on the sign-up page. Accounts, books, favorites, cart contents, and demo orders are saved in this browser's local storage. Use the same browser and device to see them again. Clear the browser's site data to reset the demo.

## Chapa demo checkout

Checkout creates a pending local order, opens a Chapa-style demo payment step, and lets the customer simulate success or cancel. Inventory changes only after the customer confirms simulated success. It does not contact Chapa, collect payment credentials, or charge money. A real Chapa integration requires a trusted server to keep the Chapa secret key private and verify payments; never put that key in frontend code.

## Important limitations

This project is for demonstrations only. Browser-stored accounts and roles are not secure and must not be used for real customers, private data, or production authorization. There is no email verification or password-reset email. Data is not shared across browsers or devices.

Open Library search is an optional public book-discovery feature and is not part of the store inventory.
