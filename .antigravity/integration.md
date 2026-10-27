# THIRD-PARTY INTEGRATION DIRECTIVES (SINGLE-CAFE DIGITAL MENU & ORDERING SYSTEM)

## 1. Firebase Authentication & Staff Security
- Purpose: Secure staff login for the Business Owner and Kitchen Staff to access protected administrative dashboards, menu management tools, and kitchen displays.
- Client SDK: `client/src/config/firebase.ts` manages staff authentication state.
- Server Verification: `server/src/middleware/auth.ts` uses Firebase Admin SDK or JWT tokens to cryptographically verify incoming Bearer tokens on protected backend endpoints (`req.headers.authorization`).
- Rule: **Customers require zero authentication or app downloads**. Customer access is entirely frictionless via table QR code scanning (`/menu?table=N`).

## 2. MongoDB Atlas & Mongoose
- Purpose: Cloud document persistence for menu items (`MenuItem`), customer orders (`Order`), physical cafe tables (`Table`), and staff accounts (`AdminUser`).
- Connection: Managed in `server/src/config/db.ts` using `mongoose.connect(process.env.MONGODB_URI)`.
- Order Historical Snapshot: The `Order` schema embeds item snapshots (name, price) at the moment of submission to protect sales records against subsequent menu price updates or edits.
- Real-Time Coupling: Socket.io works alongside Mongoose operations to trigger instantaneous broadcasts (`order:new`, `order:status-change`, `stock:toggle`) across connected client browsers.

## 3. Environment Variable Enforcement
- Server (`server/.env`):
  - `MONGODB_URI=mongodb+srv://...`
  - `PORT=5000`
  - `CLIENT_ORIGIN=http://localhost:5173`
  - `JWT_SECRET=your_jwt_secret_key`
  - `FIREBASE_PROJECT_ID=...`
  - `FIREBASE_CLIENT_EMAIL=...`
  - `FIREBASE_PRIVATE_KEY=...`
- Client (`client/.env`):
  - `VITE_API_BASE_URL=http://localhost:5000/api`
  - `VITE_SOCKET_URL=http://localhost:5000`
  - `VITE_FIREBASE_API_KEY=...`
  - `VITE_FIREBASE_AUTH_DOMAIN=...`
  - `VITE_FIREBASE_PROJECT_ID=...`
- Rule: NEVER commit production `.env` files or database credentials to Git. Always utilize `.env.example` templates for configuration sharing.