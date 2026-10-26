# 👑 Ojaja Cinemas — Luxury Royal Cinema Booking Engine

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![Platform](https://img.shields.io/badge/Platform-Vercel%20Edge%20Ready-black)
![Gateway](https://img.shields.io/badge/Payment-Paystack%20Inline-0BA4DB)
![Location](https://img.shields.io/badge/Flagship-African%20Village%20Ife%20Grand%20Resort-F59E0B)
![Backend%20Tag](https://img.shields.io/badge/Backend%20Tag-cimen--boxoffice-DC2626)

A next-generation, high-performance cinema booking and capacity intelligence system built for **Ojaja Cinemas** (African Village, Ife Grand Resort & Industrial Hub, Ile-Ife, Osun State, with branches in Lagos and Akure).

Designed to replace clunky, legacy third-party booking portals with a royal, modern African cinematic aesthetic, seamless **Paystack payment gateway** integration, **smart full-hall availability detection & time recommendations**, and **structured backend tracking tags** (`[cimen]`, `[cimen-boxoffice]`).

---

## 🌟 Key Features

### 1. ⚡ Intelligent Hall Capacity & Alternative Showtimes Engine
- Real-time seat inventory monitoring for **Red Room (Christie 4K Laser)** and **Blue Room (Dolby Atmos 7.1)**.
- **Smart Sold-Out Detection**: When a patron selects a showtime where the hall is at 100% capacity (e.g. 4:00 PM screening), the system immediately detects this and pops up the **Alternative Times Recommendation Alert**:
  > *"Hall is Full! For the 4:00 PM screening of Ori: Rebirth, all 84 seats in the Red Room have been reserved. Here are the best available times today: 6:30 PM (Blue Room - 18 seats available), 9:15 PM (Red Room - 65 seats available)."*
- One-click **"Switch Time"** button automatically transitions the customer straight into the new hall's interactive seating map!

### 2. 💺 Interactive 3D Curved Cinema Seating Map
- Perspective-rendered screen curve with realistic ambient ambient projection glow.
- Clearly differentiated seating tiers:
  - **Standard Rows (A–E)**: ₦3,500 – ₦4,500
  - **Royal VIP Plush Recliners & Couple Loungers (F–G)**: ₦7,500 – ₦8,500
- Dynamic real-time calculation with live seat counter and aisle gaps.

### 3. 💳 Official Paystack Payment Gateway Integration
- Integrates the official **Paystack Inline SDK** (`PaystackPop.setup`) in Nigerian Naira (`NGN`) with exact kobo conversions (`amount * 100`).
- Configured with metadata tagging so transactions in your Paystack dashboard are clearly labeled:
  ```json
  {
    "tag": "cimen-ticket-booking",
    "cinema_tag": "cimen-boxoffice",
    "branch": "Ife Grand Resort (Flagship)",
    "hall": "Red Room (4K Laser)",
    "seats": "D4, D5"
  }
  ```
- **Failsafe / Demo Simulator Mode**: Includes a built-in high-fidelity simulated checkout modal for rapid testing, demonstrations, or environments without live API credentials.

### 4. 🎟️ Digital VIP Boarding Pass & Live QR Code
- Generates an Apple Wallet-style digital ticket with custom notched perforation cutouts.
- Embeds a dynamic QR code for rapid barcode scanning at turnstiles.
- Instant **"Print Thermal Receipt"** and **"Send to WhatsApp"** capabilities.

### 5. 🏷️ Backend Tracking & Box Office Dispatch Hub (`[cimen]`)
- Keyboard shortcut `Alt + A` or click **"Admin Hub"** in the navigation bar.
- Live Box Office Ledger tracking gross NGN revenue, total seats issued, and attendance rates.
- **Patron Check-in Tool**: Search or scan booking references (e.g. `OJAJA-CIMEN-8941-IFE`) to validate authentic tickets and admit guests.

### 6. ✨ World-Class Royal Yoruba & Cinema Typography
- Inspired by the clean, bold aesthetic seen in premier education and luxury brand portals:
  - **Cinzel**: Royal African majesty, sovereign heritage & classic cinema headings.
  - **Syne**: Modern avant-garde sub-headings and badges.
  - **Plus Jakarta Sans**: Crystal-clear humanist readability for all device viewports.
  - **JetBrains Mono**: High-precision seat identifiers, booking references, and financial tallies.

---

## 🚀 One-Click Vercel Deployment

This project is pre-configured with a root `vercel.json` and static engine for 100% reliable zero-configuration deployment to Vercel.

### Deploying via Vercel Dashboard:
1. Push this repository to your GitHub account (`Olumidenana/ojaja-cinemas`).
2. Log in to [Vercel](https://vercel.com).
3. Click **"Add New Project"** and select **`ojaja-cinemas`**.
4. Leave all build settings as default (Framework: Other, Output Directory: `.`).
5. (Optional) In **Environment Variables**, add:
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: Your live Paystack public key (`pk_live_...` or `pk_test_...`).
6. Click **Deploy**! Your site is live in ~15 seconds on Vercel's global CDN.

---

## 💻 Local Development

Run locally using any static HTTP server or Node:

```bash
# Clone the repository
git clone https://github.com/Olumidenana/ojaja-cinemas.git
cd ojaja-cinemas

# Start local server
npm start
# or
npx serve . -p 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Architecture

```
ojaja-cinemas/
├── index.html        # Main luxury cinema interface & modal dialogs
├── app.js            # Core state machine, Paystack engine & capacity recommender
├── styles.css        # Cinema screen curve, ambient glows & thermal ticket styling
├── vercel.json       # Vercel Edge hosting configuration with security headers
├── package.json      # NPM scripts and project metadata
├── .gitignore        # Standard ignore rules
└── README.md         # Full project documentation & deployment guide
```

---

## 👑 About Ojaja Cinemas
- **Flagship Location:** African Village, Ife Grand Resort and Industrial Hub, Ile-Ife, Osun State, Nigeria.
- **Founder:** Oba Adeyeye Enitan Ogunwusi (Ọọ̀ni of Ifẹ).
- **Halls:** Red Room (4K Laser Projection) & Blue Room (Dolby Atmos 7.1).
- **Customer Care Line:** +234 707 493 4531.
- **Email:** ojajacinemas@gmail.com.
