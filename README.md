# Find Your Stay - Full-Stack Student, Family & Trip Booking Platform

> A production-ready, responsive, full-stack multi-category accommodation booking platform with Mobile OTP authentication, persistent database engine, Razorpay payment gateway with cryptographic HMAC-SHA256 server verification, and role-based management dashboards.

---

## 🌟 Key Highlights & Features

### 1. Home Page: "Find Your Stay"
- **Title**: Clean, modern home page titled **“Find Your Stay”**.
- **Three Distinct Booking Categories**:
  - 🎓 **Student Stay**: Dedicated to university scholars, coaching aspirants, and interns. Features monthly rent billing, refundable security deposit advance, mess meal plan integration, 300 Mbps Wi-Fi, biometric curfew notifications, and quiet study pods.
  - 👨‍👩‍👧‍👦 **Family Stay**: Curated for parents, children, and grandparents. Features multi-bedroom villas, chalets, kid-friendly amenities, free baby crib/cot requests, breakdown of adult and child guests, and a 30% advance payment rule with remainder payable at check-in.
  - ✈️ **Trip Stay**: Designed for leisure travelers and tourists. Daily and package rates, prime beach and mountain locations (Goa, Shimla, Udaipur), 48-hour free cancellation, and instant QR voucher generation.

### 2. Real Authentication & Verification
- **Mobile Number Registration & OTP Verification**:
  - Real 6-digit OTP generation, persistence, and verification API routes (`/api/auth/send-otp` & `/api/auth/verify-otp`).
  - Mobile verification badge and phone session linking.
- **Email Verification & Login**: Secure email-based login and registration.
- **Customer Profile & Verification**:
  - Full name, profile photo avatar, contact information.
  - University/College name, Student ID/Roll number, and Emergency Parent/Guardian contact details.
- **1-Click Role Switcher**:
  - Instantly switch between test roles: **System Administrator**, **Property Owner / Host**, and **Student & Family Guest**.

### 3. Location & Accommodation Search
- Search by destination or city (Bangalore, Delhi, Goa, Shimla, Udaipur, Pune).
- Filter by stay category (`student`, `family`, `trip`), property type (`hostel`, `pg`, `villa`, `apartment`, `hotel`, `resort`), and must-have amenities.
- Dynamic price slider (up to ₹30,000+).
- Accommodation cards showing high-resolution covers, rating badges, monthly vs. nightly rates, and advance payment terms.

### 4. Dedicated Category Booking Flows (`/book`)
- **Student Move-in Flow**:
  - Duration selection (1, 3, 6, 11 academic months) & Move-in date.
  - Collection of student ID, department, university name, guardian contact, and mess plan preference.
  - Advance payment locks security deposit.
- **Family Villa Flow**:
  - Check-in and check-out date picker with night count calculation.
  - Adult and children headcount breakdown, children age specifications, and baby crib request.
  - Advance payment calculation (30% advance, balance due at check-in).
- **Trip Stay Flow**:
  - Destination, travel purpose, room quantity, and itinerary dates.
  - Instant booking voucher generation upon payment.

### 5. Secure Payment Integration (Razorpay)
- **Advance vs. Full Payment Option**: Guests can choose to pay the required advance deposit or the full reservation amount.
- **Cryptographic Server Verification**: API route (`/api/bookings/verify-payment`) performs HMAC-SHA256 signature verification (`crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')`).
- **15-Minute Reservation Hold**: Prevents double-booking during checkout.
- **Transaction Receipts & Ledger**: Detailed records with payment IDs and timestamps.

### 6. Booking Confirmation & Passes (`/booking/confirmation/[id]`)
- **Category-Tailored Passes**:
  - **Student Move-in Pass & Verification Card** with Student Roll Number and Guardian Details.
  - **Family Villa Voucher** with party breakdown and crib confirmation.
  - **Instant Trip Voucher** with itinerary dates.
- Dynamic QR code for check-in verification at reception.
- Printable / downloadable voucher layout.

### 7. Customer Dashboard (`/account`)
- View active and previous reservations.
- View and print booking vouchers.
- **Cancellation & Automated Refund Calculator**: Cancellation requests check the property's policy (e.g. 48h free cancellation) and automatically calculate refundable amounts.
- Profile and student credential editor.

### 8. Property Owner & Administrator Dashboard (`/admin`)
- **Business Analytics**: Gross booking value, total advance collected online, outstanding balance receivables, and stay distribution.
- **Approval Workflow**: Admins review, approve, or reject property listings submitted by hosts.
- **Desk Counter Settlement**: Receptionists and admins can record offline cash or POS card payments for remaining balances at check-in.
- **Property Management**: Add, update, and remove accommodations and units.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 15 (App Router, TypeScript, React 19) |
| **Styling & UI** | Tailwind CSS with custom responsive tokens & glassmorphism |
| **Icons** | Lucide React |
| **Authentication** | Mobile OTP + Email Authentication (with Firebase Authentication support) |
| **Database** | Persistent Database Engine (with Cloud Firestore sync support) |
| **Payment Gateway** | Razorpay with Server-Side HMAC-SHA256 Signature Verification |
| **QR Code Generation** | `qrcode` |
| **Validation** | Zod & React Hook Form |

---

## 📁 Project Structure

```
├── data/
│   └── db.json                   # Local persistent database (hotels, rooms, bookings, reviews, users, OTPs)
├── src/
│   ├── app/
│   │   ├── account/page.tsx      # Customer dashboard (bookings, profile, cancellation)
│   │   ├── admin/page.tsx        # Property owner & admin portal (metrics, approvals, desk payments)
│   │   ├── api/
│   │   │   ├── admin/metrics/    # Financial & operational analytics API
│   │   │   ├── auth/             # OTP, login, register, profile, role switch APIs
│   │   │   ├── bookings/         # Quote, reserve, verify-payment, cancellation, desk payment APIs
│   │   │   ├── hotels/           # Accommodation search, creation, detail, approval APIs
│   │   │   └── reviews/          # Review submission & rating aggregation API
│   │   ├── book/page.tsx         # Dedicated Student, Family, and Trip booking flows
│   │   ├── booking/confirmation/[id]/page.tsx  # Dynamic voucher & QR move-in pass
│   │   ├── hotels/
│   │   │   ├── page.tsx          # Multi-category search & filtering catalog
│   │   │   └── [id]/page.tsx     # Property detail page (photos, rooms, rules, reviews)
│   │   ├── globals.css           # Tailwind directives & styles
│   │   ├── layout.tsx            # Root layout with AuthProvider, Navbar, and Footer
│   │   └── page.tsx              # Home page titled "Find Your Stay"
│   ├── components/
│   │   ├── AuthModal.tsx         # Mobile OTP & Email login modal + Role switcher
│   │   ├── CategoryBadge.tsx     # Distinct badges for Student, Family, and Trip stays
│   │   ├── Footer.tsx            # Footer with trust badges, policies, and links
│   │   ├── HotelCard.tsx         # Rich property cards with pricing & advance tags
│   │   └── Navbar.tsx            # Sticky navigation bar with role indicator & user menu
│   ├── context/
│   │   └── AuthContext.tsx       # Authentication state, session handling, and role switching
│   ├── lib/
│   │   └── db.ts                 # Full database service with seed data and persistence
│   └── types/
│       └── index.ts              # TypeScript interfaces for all domain models
├── .env.example                  # Environment configuration template
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies and scripts
├── tailwind.config.ts            # Tailwind styling setup
└── tsconfig.json                 # TypeScript compiler options
```

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the project root based on `.env.example`:

```env
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Razorpay Payment Gateway (Indian Payment Gateway with UPI, NetBanking & Cards)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_51OqPExampleKey
RAZORPAY_KEY_ID=rzp_test_51OqPExampleKey
RAZORPAY_KEY_SECRET=rzp_secret_example_9918237192837192

# Firebase (Optional: Enabled automatically if configured)
FIREBASE_PROJECT_ID=find-your-stay-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@find-your-stay-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

> **Note on Local Development**: When Razorpay or Firebase credentials are not provided, the platform automatically runs in development simulation mode. The database persists to `data/db.json` and payments are verified securely through the backend HMAC route, allowing full end-to-end testing without external setup.

---

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Verify Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🧪 Testing the Booking Workflows

### 1. Student Stay Flow
1. Navigate to **Student Stay** on the home page or navbar.
2. Select **Oxford Scholars Luxury Hostel & Co-Living** in Bangalore.
3. Review the monthly rent (₹11,500/mo), refundable security deposit (₹15,000), 4-time mess meal plan, and study amenities.
4. Click **Book Now**.
5. Select stay duration (e.g. 6 Months / 1 Academic Semester), fill in university and guardian details.
6. Click **Pay Advance & Confirm Booking**.
7. Receive your **Official Student Move-in Pass** with QR code and Move-in Date.

### 2. Family Stay Flow
1. Navigate to **Family Stay**.
2. Select **Sylvan Vista Heritage Family Villa** in Goa.
3. Specify check-in/check-out dates, 2 Adults, 2 Children, and request a baby crib.
4. Review the quote: 30% advance required today, 70% balance due upon check-in.
5. Complete payment and view your **Family Villa Voucher**.

### 3. Trip Stay Flow
1. Navigate to **Trip Stay**.
2. Select **The Oberoi Grand Palace & Spa** in Udaipur.
3. Complete booking and receive the **Instant Trip Voucher**.

### 4. Admin & Property Owner Testing
1. Click the **Role Badge** on the top right navigation bar to open the **Role Switcher**.
2. Switch to **System Administrator** or **Property Host**.
3. Visit `/admin` to review gross booking value, approve newly submitted properties, or record desk payments for checking-in guests.

---

## 🚢 Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Add the environment variables from `.env.example`.
4. Deploy! Next.js will automatically build and deploy all static pages and dynamic API routes.
