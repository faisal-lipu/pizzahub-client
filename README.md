# 🍕 PizzaHub — Artisan Pizza Ordering & Kitchen Management Platform

A modern, full-stack, role-based food ordering platform built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Node.js/Express**, **MongoDB**, and **Stripe**. PizzaHub connects pizza lovers with authentic local artisan pizzerias, featuring multi-role dashboards, live data visualization, debounced search & price sorting, and secure Stripe subscription billing.

---

## 🌐 Live Application & Repositories

- **Live Client App:** [https://pizzahub-client-beta.vercel.app](https://pizzahub-client-beta.vercel.app)
- **Live Server API:** [https://pizzahub-server-seven.vercel.app](https://pizzahub-server-seven.vercel.app)
- **Client GitHub Repository:** [https://github.com/faisal-lipu/pizzahub-client](https://github.com/faisal-lipu/pizzahub-client)
- **Server GitHub Repository:** [https://github.com/faisal-lipu/pizzahub-server](https://github.com/faisal-lipu/pizzahub-server)

---

## 🏆 Challenge Requirements Implementation Details

### 1. Challenge 1: Advanced Search and Price Sorting

#### A. Frontend UI & Interaction Flow:
- **Search Bar with Live Debounce:** Located on the `/menu` browse page. Features real-time text input allowing users to search across pizza names, ingredients, flavor profiles, and descriptions. Debounced by 250ms to minimize unnecessary network traffic while providing instant results.
- **Category & Location Filters:** Interactive category pills covering the 6 official culinary categories (*Classic Pizzas, Vegetarian Pizzas, Meat Lovers, Specialty / Gourmet Pizzas, Sides & Appetizers, Beverages & Desserts*) plus location filtering across regional pizzeria kitchens.
- **Price Sorting Dropdown:** Allows instantaneous sorting of menu items by price in **Ascending (Low to High)** and **Descending (High to Low)** order.

#### B. API Query Parameters:
The client communicates with the Express backend via `GET /api/menu` using standardized URL search parameters:
```http
GET /api/menu?search=margherita&category=Classic%20Pizzas&location=Little%20Italy&sortBy=price&order=asc
```
- `search` *(string)*: Case-insensitive regex query applied across `itemName`, `name`, `description`, and `category`.
- `category` *(string)*: Filters approved pizzas strictly by selected culinary recipe category.
- `location` *(string)*: Filters pizzas by chef location / city district.
- `sortBy` *(string)*: `price` to trigger price-based sorting; defaults to `createdAt` (newest first).
- `order` / `sortOrder` *(string)*: `asc` (ascending, low to high) or `desc` (descending, high to low).

#### C. Backend Aggregation:
The backend MongoDB pipeline filters items with `status: 'approved'`, performs a `$lookup` join to attach vendor metadata (business name, rating, premium membership status), and dynamically applies `{ $sort: { price: 1 } }` or `{ $sort: { price: -1 } }`.

---

### 2. Challenge 2: JWT / Token Verification & Middleware Flow

#### A. Client-Side Token Management:
- Tokens are issued upon secure authentication (Email/Password or Google OAuth) and stored securely in local storage / session cookies.
- All authenticated API requests use the centralized `apiRequest` helper (`src/lib/api.ts`), which automatically attaches the token:
  ```http
  Authorization: Bearer <jwt-token>
  ```
- If the backend returns `401 Unauthorized` (e.g. `TOKEN_EXPIRED` or `TOKEN_INVALID`), the client immediately clears session state and redirects the user to `/sign-in` with a toast notice.

#### B. Express Backend Middleware Architecture (`verifyToken.js` & `verifyRole.js`):
1. **Token Extraction:** Incoming request inspects `req.headers.authorization`. If missing or not prefixed with `Bearer `, the request is immediately rejected with **HTTP 401 Unauthorized** (`Access denied. No token provided.`).
2. **Cryptographic Verification:** The token is validated using `jwt.verify(token, JWT_SECRET)`.
   - If expired: Returns **HTTP 401** with code `TOKEN_EXPIRED` (`Session expired. Please log in again.`).
   - If invalid signature / malformed: Returns **HTTP 401** with code `TOKEN_INVALID` (`Invalid token. Authorization failed.`).
3. **Database Identity & Block Status Check:** Looks up the user in MongoDB. If `user.isBlocked === true`, the request is rejected with **HTTP 403 Forbidden** (`USER_BLOCKED`).
4. **Subscription Lifecycle & Expiration:** Evaluates `subscriptionExpiresAt`. Expired subscriptions are lazily and automatically downgraded from `premium` to `free`.
5. **Context Attachment:** Verified and sanitized user properties are attached to `req.user`.
6. **Role-Based Guards (`verifyRole`):** Specialized route middlewares (`verifyAdmin`, `verifyVendor`, `verifyCustomer`) verify that `req.user.role` matches the route requirements, blocking unauthorized cross-role access with **HTTP 403 Forbidden**.

---

### 3. Challenge 3: Professional Website Appearance & UI/UX Improvements

The application has been refined with an artisanal, cohesive design language:
- **Consistent Color Theme:** Warm Italian pizzeria palette with signature red (`#D91E18`), warm amber/gold accents (`#F59E0B`), warm cream background (`#FAF8F5`), and stone neutrals.
- **Glassmorphism Floating Split-Pill Navbar:** Modern dual-pill header on desktop and a unified single pill on mobile screens. Designed to eliminate horizontal layout shifts and overflow across all mobile viewports (down to 320px).
- **Full-Width Dashboards with Responsive Sidebar:** Role-tailored dashboards for Admin, Vendor, and Customer with sticky navigation, active tab indicators, and a slide-out drawer on mobile and tablet screens.
- **Interactive Data Visualization (Charts & Graphs):**
  - **Donut Charts:** SVG circular breakdowns showing user role distribution, order fulfillment status, and menu verification pipeline.
  - **Bar Charts:** Visualizing menu items across categories and weekly customer order volume (7 days).
  - **Trend Area Charts:** Smooth cubic bezier curves with gradient fill showing subscription revenue growth and customer order spending history.
- **User Profile Section:** Displays user avatar, name, email, role badge, and a **circular metallic gold ring** with floating crown 👑 for Premium account holders.
- **Equal-Height Cards & Micro-Interactions:** Menu item cards feature consistent height, image zoom transitions, and interactive heart/favorite buttons.
- **System Pages:** Custom 404 page (`not-found.tsx`), Global Error Boundary (`error.tsx`), animated woodfire pizza loading screen (`loading.tsx`), and modernized footer with the official X logo.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16.4 (App Router, Turbopack) |
| **UI Library** | React 19.3 |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **Icons & Notifications** | Lucide React, Sonner |
| **Charts** | Custom Interactive SVG & Canvas Data Visualizers |
| **Backend API** | Node.js, Express.js 5, MongoDB 7 |
| **Payments** | Stripe Checkout & Verified Webhooks |
| **Image Hosting** | ImgBB API |

---

## 💻 Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/faisal-lipu/pizzahub-client.git
   cd pizzahub-client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=https://pizzahub-server-seven.vercel.app
   NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 📄 License
Developed for educational and portfolio demonstration as part of the Assignment-9 curriculum.
