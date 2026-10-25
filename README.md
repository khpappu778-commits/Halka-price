# Halka Price — Low-Price Deals Platform (Bangladesh)

> **"Low Price, Smart Choice!"**  
> Verified low-price shopping deals, price drops, and discount offers from Daraz Bangladesh in Bangladeshi Taka (৳ BDT).

---

## 🌟 Key Features

### 1. Storefront for Bangladesh Shoppers
- **Bangladeshi Taka (৳ BDT)** pricing and live discount percentages: `((Original Price - Deal Price) / Original Price) * 100`.
- **Verified "Shop Now" Action**: Direct outbound links to verified seller products on Daraz Bangladesh (`target="_blank" rel="noopener noreferrer"`), preserving all affiliate tracking parameters without modifying query tags.
- **Dedicated Product Details Page**: Multiple product photo gallery with thumbnail selector, full specs, stock tags, expiry countdown, and direct sharing to WhatsApp, Facebook, or Copy Link with visual toast.
- **Top Promotional Banners**: Responsive desktop (16:9) and mobile creative scheduling.
- **Category Filter & Search**: Instant real-time search across product titles, Bangla names, descriptions, and tags.
- **Adsterra Advertising Integration**: 5 managed ad placements (Homepage Top, In-Feed, Sidebar, Product Page, and Footer) with safe container execution.
- **Affiliate Disclosure Notice**: Full compliance with marketplace affiliate policies.

### 2. Secure Admin Management Portal (`/admin`)
- **Admin Credentials**:
  - **Username**: `admin`
  - **Initial Password**: Configured server-side (stored as secure bcrypt hash)
- **Mandatory First-Login Password Change**: Enforced upon initial login before dashboard access is permitted.
- **Server-Side Security**:
  - Bcrypt password hashing (`bcryptjs` with 10 salt rounds).
  - Bearer session token authentication.
  - Rate limiting & brute-force protection (locks out IP after 5 consecutive failed login attempts).
  - Public registration permanently disabled.
- **Dashboard Modules**:
  1. **Overview**: Metric summary cards (Total, Published, Drafts, Featured, Expired, Active Banners).
  2. **Add / Edit Product**: Live discount calculator, multi-image upload, primary image selector, hot deal & featured toggles, Daraz destination URL, and tag management.
  3. **Manage Products**: Search, category filter, status filter, sorting, inline publish/unpublish toggle, edit, and deletion with confirmation modal.
  4. **Categories**: Create, edit, delete, and reorder categories with up/down arrows.
  5. **Homepage Banners**: Upload desktop/mobile creatives, set campaign start/end dates, toggle active state, and reorder.
  6. **Adsterra Ads**: Configure and toggle ad scripts across 5 website placements with device targeting (Desktop, Mobile, All).
  7. **Website Settings**: Brand name, tagline, announcement bar text, contact information, WhatsApp hotline, and affiliate disclosures.
  8. **Change Password**: Owner can change admin credentials securely anytime.

---

## 🚀 Setup & Local Execution

### Requirements
- Node.js 18+ or 20+
- npm 9+

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server (Express + Vite)
npm run dev
```

The application runs on `http://localhost:3000`.

### Production Build
```bash
# Compile client assets
npm run build

# Start production server
npm start
```

---

## 🛡️ Initial Admin Account Setup

1. Open your browser and navigate to the application.
2. Click **Admin** in the top right navigation bar.
3. Enter the administrator credentials:
   - **Username**: `admin`
   - **Password**: Provided initial setup password
4. The system will immediately require you to change the password to your personal secure password (minimum 6 characters).
5. Once submitted, you are securely logged into the Halka Price Dashboard.

---

## 📢 Adsterra Ad Integration Guide

1. Sign in to your **Adsterra Publisher Dashboard**.
2. Generate banner codes:
   - **Homepage Top**: 728x90 Leaderboard or Responsive Banner.
   - **Homepage Between Sections**: 468x60 or Responsive In-Feed Banner.
   - **Homepage Sidebar (Desktop)**: 300x250 Medium Rectangle.
   - **Product Details Page**: Responsive Banner or Native Widget.
   - **Footer**: 728x90 Leaderboard.
3. Open Halka Price Admin $\to$ **Adsterra Ads**.
4. Paste the official script tag into the matching slot, set device targeting if desired, and toggle **Enabled**.
5. Save changes. Ads render in isolated, secure containers.
