# Priti's Collection — Codebase Architecture & Context Reference

> **Context Document for Antigravity AI Agents & Developers**  
> **Brand**: Priti's Collection (Boutique Indian Ethnic Fashion & Bridal Wear)  
> **Repository Root**: `e:\pritis collection`

---

## 1. Business & Domain Context

**Priti's Collection** is an online boutique for luxury Indian ethnic fashion. 
- **Core Product Categories**:
  - **Sarees**: Handwoven Banarasi silk, Kanjivaram, Georgette, Chiffon, festive drapes.
  - **Anarkalis & Dresses**: Flowy evening gowns, sequin embellished anarkali suits, Indo-western dresses.
  - **Kurtis**: Everyday and festive kurtis in velvet, cotton, chanderi, and silk.
- **Target Audience**: Domestic & international customers looking for high-quality, authentic Indian ethnic wear.
- **Key Customer Actions**: Browse collections, search & filter by category/color/size, wishlist, cart management, checkout with Razorpay or Cash on Delivery (COD), order tracking via user profile.
- **Key Admin Actions**: Admin dashboard with revenue stats, inventory count, order management, and product CRUD (including image uploads).

---

## 2. Architecture Overview

The system is currently structured as a unified Next.js fullstack application using a custom Express server:
```text
e:\pritis collection\
├── server.js       # Express.js custom server (API + Next.js handler)
├── app/            # Next.js 16 (App Router) client application
├── models/         # Mongoose schemas
└── controllers/    # Express controllers
```

### Technology Stack Summary

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js 16.1.6 (Turbopack, App Router), React 19.2.3 |
| **Frontend Styling** | Tailwind CSS v4, Lucide React icons, Framer Motion |
| **Frontend State** | Zustand (persistent `localStorage` stores for Cart, Wishlist, Auth) |
| **Frontend Network** | Axios (pointing to `NEXT_PUBLIC_API_URL`) |
| **Backend Framework** | Node.js, Express.js 5.2.1 |
| **Database & ODM** | MongoDB Atlas, Mongoose 9.1.5 |
| **Authentication** | JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`) |
| **Payment Gateway** | Razorpay Node SDK (Test & Live modes) |
| **File Storage** | Multer (`diskStorage` writing to `backend/uploads/products`) *(Migration to Cloudflare R2 recommended)* |
| **Email Service** | Nodemailer (Gmail SMTP for contact form inquiries) |

---

## 3. Directory & File Structure

```text
pritis-collection/
├── GEMINI.md                           # Master context and architecture guide (this file)
├── config/
│   └── db.js                           # Mongoose MongoDB Atlas connection
├── controllers/
│   ├── adminController.js              # Admin dashboard analytics
│   ├── orderController.js              # Order CRUD, user order history
│   ├── paymentController.js            # Razorpay integration
│   ├── productController.js            # Product & category management
│   └── userController.js               # Auth (register, login, profile)
├── middleware/
│   ├── authMiddleware.js               # JWT Bearer verification (`protect`, `admin`)
│   └── uploadMiddleware.js             # Multer config
├── models/
│   ├── Category.js                     # Category schema
│   ├── Subcategory.js                  # Subcategory schema (nested under Category)
│   ├── Order.js                        # Order schema
│   ├── Product.js                      # Product schema (with per-variant stock tracking)
│   └── User.js                         # User schema
├── routes/                             # Express API route definitions
├── app/                                # Next.js frontend
│   ├── admin/                          # Admin portal (Products, Categories, Subcategories, Orders)
│   ├── auth/                           # Unified Auth screen
│   ├── cart/                           # Shopping cart
│   ├── checkout/                       # Checkout (Razorpay only, COD disabled for MVP)
│   ├── shop/                           # Product catalog
│   └── ...                             # Other pages (home, about, contact, etc.)
├── components/                         # React components (Navbar, ProductCard, etc.)
├── lib/                                # Shared utilities and Axios client
├── store/                              # Zustand state stores (cart, auth, wishlist)
├── server.js                           # Unified entry point (Express + Next.js handler)
├── .env                                # Environment variables
└── package.json
```

---

## 4. Design Language & Brand Identity

The visual language reflects an opulent, luxury Indian boutique:
- **Palette**:
  - **Royal Maroon** (`--color-primary: #6D121F`): Primary brand color, headers, CTAs, buttons.
  - **Imperial Gold** (`--color-secondary: #D4AF37`): Accents, borders, highlights, badges.
  - **Warm Cream** (`--color-cream / --color-background: #FDFBF7`): Background tone giving an organic silk canvas feel.
  - **Deep Charcoal** (`--color-foreground: #1F1F1F`): High-contrast readable typography.
- **Typography**:
  - **Headings & Accents**: `Playfair Display` (serif) — classical, elegant fashion aesthetic.
  - **Body & UI**: `Inter` (sans-serif) — clean, readable interface text.

---

## 5. State Management & Data Flow

- **Cart State (`cartStore.ts`)**:
  - Persisted in browser `localStorage`.
  - Automatically calculates subtotal, 18% GST/tax, and dynamic shipping charges (Free over ₹1999).
- **Wishlist State (`wishlistStore.ts`)**:
  - Persisted in `localStorage`. Allows guest wishlisting without forced login.
- **Authentication State (`authStore.ts`)**:
  - Persisted in `localStorage`. Stores user details (`_id`, `name`, `email`, `isAdmin`, `token`).
  - Synced with Axios headers for authenticated endpoints (`Bearer <token>`).

---

## 6. Endpoints, Database Schemas & MVP State

### Database Schema Notes
- **Category System**: Products are categorized hierarchically (Category -> Subcategory).
- **Variants**: `Product` schema uses a `variants` array. Each variant (size + color combination) has independent stock tracking.
- **Admin Authorization**: Sensitive routes use `protect` and `admin` from `authMiddleware.js`.
- **MVP Status**: Cash on Delivery (COD) is temporarily disabled. Checkout strictly uses the Razorpay payment flow.

### API Routes

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/login` | Public | Authenticate user & issue JWT |
| `POST` | `/api/users` | Public | Register new customer |
| `GET` | `/api/users/profile` | Private | Retrieve logged-in profile data |
| `GET` | `/api/products` | Public | List all active products |
| `GET` | `/api/products/:id` | Public | Get single product by MongoDB ID |
| `GET` | `/api/products/slug/:slug` | Public | Get single product by URL slug |
| `POST` | `/api/products` | Admin | Create product with Multer image upload |
| `PUT` | `/api/products/:id` | Admin | Update product details |
| `DELETE` | `/api/products/:id` | Admin | Remove product from catalog |
| `POST` | `/api/orders` | Private | Create order in DB (COD or paid) |
| `GET` | `/api/orders/myorders` | Private | List current user's past orders |
| `GET` | `/api/orders/:id` | Private | Get detailed order summary |
| `PUT` | `/api/orders/:id/pay` | Private | Mark order as paid |
| `GET` | `/api/orders` | Admin | List all platform orders |
| `POST` | `/api/payment/create-order` | Private | Create Razorpay order ID |
| `POST` | `/api/payment/verify` | Private | Validate Razorpay HMAC signature |
| `GET` | `/api/admin/dashboard` | Admin | Aggregate sales and inventory statistics |
| `POST` | `/api/contact` | Public | Send customer inquiry email |

---

## 7. Deployment Strategy & Target Infrastructure

### 1. Frontend on Vercel
- The `frontend/` directory is designed for **Vercel** deployment:
  - Root directory in Vercel settings: `frontend`.
  - Framework preset: `Next.js`.
  - Environment variables needed on Vercel:
    - `NEXT_PUBLIC_API_URL`: URL of the deployed backend (e.g. `https://api.pritiscollection.com/api`).
    - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay public key.

### 2. Database on MongoDB Atlas
- Cluster: MongoDB Atlas Free Tier (`M0`) or Serverless.
- The connection string is already configured in `backend/.env`.
- In serverless/Vercel environments, Mongoose connection caching must be implemented to prevent connection exhaustion.

### 3. Media & Image Storage on Cloudflare R2 (10GB Free Tier)
- **Problem**: `multer.diskStorage` writes to local disk (`/uploads/products/`). On serverless hosts (Vercel, Render free tier), the local filesystem is ephemeral and wipes all uploaded images upon restart/redeploy!
- **Solution**: Cloudflare R2 provides 10GB free object storage with **$0 egress fees**:
  - Replace `multer.diskStorage` with direct upload to Cloudflare R2 using standard S3 API (`@aws-sdk/client-s3`).
  - Or use presigned upload URLs from the frontend directly to R2, eliminating server bandwidth entirely.
  - Whitelist the Cloudflare public bucket/CDN domain in `frontend/next.config.ts`.

### 4. Deployment Architecture
- **Unified Custom Server**: The project uses a custom Express server (`server.js`) that handles both API routes and Next.js requests. This requires a deployment environment capable of running a long-lived Node.js process (e.g., Render, Railway, Fly.io, DigitalOcean, or an EC2 instance) rather than standard Vercel serverless functions.

---

## 8. Critical Caveats & Known Fixes

1. **`NEXT_PUBLIC_API_URL` Suffix Mismatch**:
   - `frontend/.env.local` currently specifies `https://pritis-backend.onrender.com` without `/api`.
   - `frontend/lib/api.ts` makes requests to `/users/login`, which fails 404 if `/api` is missing.
   - **Rule**: Always ensure `NEXT_PUBLIC_API_URL` ends with `/api` or adjust `api.ts` paths consistently.

2. **Razorpay Server-Side Order Architecture (RESOLVED)**:
   - Orders are created server-side in a `Pending Payment` state (`isPaid: false`) before opening the checkout gateway, linking directly to `paymentResult.razorpay_order_id`.
   - Charge amount is re-computed entirely from the database (variant price overrides and current catalog data); client-submitted amounts are strictly ignored.
   - Verification endpoint (`/api/payment/verify` or `/api/orders/verify-payment`) performs cryptographic HMAC-SHA256 signature verification before marking the order as paid and executing atomic per-variant stock deduction.
   - Asynchronous Razorpay webhook (`/api/payment/webhook`) provides secondary idempotent fulfillment so orders are never lost if a user closes the browser mid-payment.

3. **Rate Limiting Configuration**:
   - `backend/server.js` has a global rate limit of 100 requests per 15 minutes across all IPs/endpoints.
   - During normal browsing, loading 10 products with images quickly exhausts 100 requests and triggers HTTP 429 errors.
   - **Fix**: Apply rate limiting specifically to sensitive routes (`/api/users/login`, `/api/payment`, `/api/contact`), not public catalog browsing.

4. **Tailwind CSS v4 `@theme` Utility Class Resolution**:
   - In Tailwind v4, custom font tokens must match `@theme` rules properly. Ensure `@theme` in `globals.css` correctly maps font families so Next.js Turbopack compiles without font utility errors.
