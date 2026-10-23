# Firebase Database, Authentication, Professional Admin Panel & Google Play Store Roadmap

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Find Your Stay into a production-grade, Google Play Store-ready mobile application powered by real Firebase Authentication, Cloud Firestore cloud database, an interactive real-time Admin Panel (property/room editing, price updating, user list, payment & booking ledger), and signed Android App Bundle (`.aab`) release builds.

**Architecture:** Replace the local file-based database (`db.json`) with Google Cloud Firestore and Firebase Admin SDK on Next.js API routes for persistent data across Vercel deployments and mobile devices. Upgrade the Admin dashboard (`/admin`) into a multi-tab operations center with live CRUD for hotels, rooms, pricing, registered users, and payment transactions. Configure Android release signing, adaptive icon assets, Google Play compliance requirements (API 35, Privacy Policy), and generate Play Store-ready `.aab` bundles.

**Tech Stack:** Next.js 15 (App Router), Firebase Auth & Cloud Firestore (`firebase`, `firebase-admin`), Capacitor 8 (`@capacitor/android`), Android Gradle (Java 21, Target SDK 35), Tailwind CSS, Lucide React, Razorpay HMAC-SHA256 verification.

---

## Phase 1: Firebase Cloud Database & Real Authentication

### Task 1.1: Firebase Client & Admin Configuration
**Files:**
- Create: `src/lib/firebase.ts`
- Create: `src/lib/firebase-admin.ts`
- Modify: `.env.example`
- Test: Verification script to check Firestore and Firebase Auth connection

**Step 1:** Initialize client-side Firebase SDK in `src/lib/firebase.ts` (using client credentials `NEXT_PUBLIC_FIREBASE_*` with graceful fallback for development).
**Step 2:** Initialize server-side `firebase-admin` in `src/lib/firebase-admin.ts` using service account private keys (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
**Step 3:** Commit:
```bash
git add src/lib/firebase.ts src/lib/firebase-admin.ts .env.example
git commit -m "feat(firebase): configure client and admin SDKs for auth and firestore"
```

---

### Task 1.2: Cloud Firestore Database Adapter (`src/lib/db.ts`)
**Files:**
- Modify: `src/lib/db.ts`
- Modify: `src/app/api/hotels/route.ts`
- Modify: `src/app/api/bookings/route.ts`

**Step 1:** Enhance `DatabaseService` in `src/lib/db.ts` to read and write directly to Firestore collections:
  - `hotels`: Hotel document records with categories, pricing, amenities, approval status.
  - `rooms`: Detailed room inventory linked to hotels.
  - `bookings`: Reservations, guest details, check-in dates, and payment status.
  - `users`: User profiles, roles, and verification details.
**Step 2:** Include auto-seeding logic: if Firestore `hotels` collection is empty on first boot, auto-populate from `INITIAL_HOTELS` and `INITIAL_ROOMS` so the app is instantly rich with listings.
**Step 3:** Commit:
```bash
git add src/lib/db.ts src/app/api/hotels/route.ts src/app/api/bookings/route.ts
git commit -m "feat(db): connect database service to Cloud Firestore collections with auto-seeding"
```

---

### Task 1.3: Real Firebase Authentication (Phone, Email, Google & Session Sync)
**Files:**
- Modify: `src/context/AuthContext.tsx`
- Modify: `src/components/AuthModal.tsx`
- Modify: `src/app/auth/page.tsx`
- Modify: `src/app/api/auth/profile/route.ts`

**Step 1:** Update `AuthContext.tsx` to listen to `onAuthStateChanged` from Firebase Auth.
**Step 2:** Support real Phone OTP verification (via Firebase `RecaptchaVerifier` & `signInWithPhoneNumber`) and Email/Password sign-up.
**Step 3:** Save user profile metadata (Role, Full Name, Student College/Roll Number, Aadhaar status) directly in the Firestore `users` document upon registration.
**Step 4:** Commit:
```bash
git add src/context/AuthContext.tsx src/components/AuthModal.tsx src/app/auth/page.tsx
git commit -m "feat(auth): integrate real Firebase authentication and firestore profile persistence"
```

---

## Phase 2: Professional Admin Panel (Hotels, Rooms, Pricing, Users, Bookings)

### Task 2.1: Admin Security Gate & Role Guard
**Files:**
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/api/admin/metrics/route.ts`

**Step 1:** Enforce strict access control: non-admin and non-host users attempting to load `/admin` see an unauthorized message and a button to switch role or login as admin.
**Step 2:** Verify admin identity in API routes using Firebase token or role verification.
**Step 3:** Commit:
```bash
git add src/app/admin/page.tsx src/app/api/admin/metrics/route.ts
git commit -m "feat(admin): enforce role-based access control on admin endpoints"
```

---

### Task 2.2: Hotel & Room Price Updating & Property Editor
**Files:**
- Create: `src/app/api/hotels/[id]/update/route.ts`
- Create: `src/app/api/rooms/route.ts`
- Modify: `src/app/admin/page.tsx`

**Step 1:** Build an interactive Property & Room Editor Modal inside the Admin Dashboard:
  - Edit hotel name, category (`student`, `family`, `trip`), address, and city.
  - **Dynamic Price Editing**: Change starting price per night, monthly rent, security deposit, and advance percentage.
  - Image management: Add/edit image URLs and preview cover photo.
  - Toggle property status (`published` vs `draft`) with instant live save to Firestore.
**Step 2:** Add Room Inventory Manager: Add new room types (Single AC, Double Sharing, Master Suite), configure capacity, bed types, and individual room rates.
**Step 3:** Commit:
```bash
git add src/app/api/hotels/[id]/update/route.ts src/app/api/rooms/route.ts src/app/admin/page.tsx
git commit -m "feat(admin): add live hotel and room editing with price and inventory management"
```

---

### Task 2.3: User Directory & Customer Management Tab
**Files:**
- Create: `src/app/api/admin/users/route.ts`
- Modify: `src/app/admin/page.tsx`

**Step 1:** Create `GET /api/admin/users` to fetch all user accounts from the Firestore `users` collection.
**Step 2:** Add a dedicated **"Users & Members"** tab in `/admin`:
  - Search by name, email, or phone.
  - Table displaying: Full Name, Email, Phone, Role Badge (`customer`, `property_owner`, `admin`), College/Student ID, Aadhaar verification status, and Registration Date.
  - Role switcher action: Promote a trusted user to `property_owner` or `admin`.
**Step 3:** Commit:
```bash
git add src/app/api/admin/users/route.ts src/app/admin/page.tsx
git commit -m "feat(admin): implement user directory tab with role management and search"
```

---

### Task 2.4: Real-time Booking & Payment Ledger
**Files:**
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/api/bookings/route.ts`

**Step 1:** Build an enhanced **"Bookings & Payments"** ledger:
  - Table showing: Booking ID, Guest Name, Mobile Number, Booked Property & Room Type, Check-in / Move-in Dates.
  - Financial breakdown: Total Amount, Advance Paid, Balance Remaining.
  - Payment Details: Razorpay Payment ID (`pay_...`), Order ID, Payment Method, and Payment Status badge (`advance_paid`, `fully_paid`, `pending`).
  - Actions: Record Front-Desk Cash/UPI payment for balance dues, cancel booking, or view customer digital pass voucher.
**Step 2:** Commit:
```bash
git add src/app/admin/page.tsx src/app/api/bookings/route.ts
git commit -m "feat(admin): upgrade booking ledger with payment IDs, balance tracking, and status controls"
```

---

## Phase 3: Google Play Store Production Readiness

### Task 3.1: App Identity, Icons & Android Branding
**Files:**
- Modify: `android/app/src/main/res/values/strings.xml`
- Modify: `android/app/src/main/res/values/styles.xml`
- Modify: `android/app/src/main/AndroidManifest.xml`
- Generate: High-res launcher icons for `mipmap-mdpi`, `mipmap-hdpi`, `mipmap-xhdpi`, `mipmap-xxhdpi`, `mipmap-xxxhdpi`

**Step 1:** Verify official App Name: `"Find Your Stay"`.
**Step 2:** Generate high-resolution, modern adaptive Android icons (compass/hotel motif with gradient background) across all standard mipmap densities.
**Step 3:** Configure splash screen background and smooth transition into WebView without flickering.
**Step 4:** Commit:
```bash
git add android/app/src/main/res/ android/app/src/main/AndroidManifest.xml
git commit -m "chore(android): configure high-resolution adaptive app icons and polished splash screen"
```

---

### Task 3.2: Google Play Compliance (Privacy Policy, Terms, Android SDK 35)
**Files:**
- Create: `src/app/privacy/page.tsx`
- Create: `src/app/terms/page.tsx`
- Modify: `android/variables.gradle`
- Modify: `android/app/build.gradle`

**Step 1:** Create mobile-responsive **Privacy Policy** (`/privacy`) and **Terms of Service** (`/terms`) pages required by Google Play Developer policies (explaining data collection: auth, phone number, payments).
**Step 2:** Ensure Android build configurations meet Google Play's 2026 requirements:
  - `compileSdkVersion = 35`
  - `targetSdkVersion = 35`
  - `minSdkVersion = 24` (Android 7.0+)
**Step 3:** Commit:
```bash
git add src/app/privacy/page.tsx src/app/terms/page.tsx android/variables.gradle android/app/build.gradle
git commit -m "feat(compliance): add privacy policy, terms of service, and update target SDK to 35"
```

---

### Task 3.3: Production Keystore & Release Signing Configuration
**Files:**
- Generate: `android/app/findyourstay-release.keystore`
- Modify: `android/app/build.gradle`
- Modify: `.gitignore` (ensure keystore passwords and sensitive keys are not exposed)

**Step 1:** Generate a 2048-bit RSA production release keystore using Java `keytool`.
**Step 2:** Add `signingConfigs.release` to `android/app/build.gradle`.
**Step 3:** Commit:
```bash
git add android/app/build.gradle .gitignore
git commit -m "chore(android): configure production keystore release signing in gradle"
```

---

### Task 3.4: Generate Google Play Store Android App Bundle (`.aab`)
**Files:**
- Output: `android/app/build/outputs/bundle/release/app-release.aab`
- Script: `package.json` (add convenience scripts `build:android` and `bundle:android`)

**Step 1:** Add build scripts to `package.json`:
  - `"cap:sync": "cap sync android"`
  - `"android:apk": "cd android && ./gradlew assembleDebug"`
  - `"android:bundle": "cd android && ./gradlew bundleRelease"`
**Step 2:** Run `./gradlew bundleRelease` to generate the `.aab` (Android App Bundle).
**Step 3:** Verify the `.aab` file size, manifest compliance, and signing integrity.
**Step 4:** Commit:
```bash
git add package.json
git commit -m "chore(build): add convenience scripts and build release Android App Bundle (.aab)"
```

---

## Phase 4: Google Play Console Submission Guide

### Task 4.1: Store Listing & Production Publishing Checklist
1. **Google Play Console Account Setup**:
   - Register for a Google Play Developer account ($25 one-time fee).
   - Create new App: `"Find Your Stay"`, Category: `Travel & Local`.
2. **Store Assets Preparation**:
   - App Icon: 512x512 PNG (32-bit with alpha).
   - Feature Graphic: 1024x500 PNG/JPEG.
   - Phone Screenshots: Minimum 2 screenshots (1080x1920 or 1080x2400) showing Home, Hotel Booking, Pass Voucher, and Customer Dashboard.
3. **App Content Declarations**:
   - Privacy Policy URL: `https://rentify-nine-roan.vercel.app/privacy`
   - Target Audience: 18+ (college students, families, travelers).
   - Data Safety: Disclose user account data (Name, Email, Phone), Financial info (Razorpay transactions).
4. **Upload Release**:
   - Upload `app-release.aab` to Internal Testing or Production track.
   - Submit for Google Play review.
