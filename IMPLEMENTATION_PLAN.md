# Implementation Plan: Single-Cafe Digital Menu & Ordering System

## 1. Architectural Verification & Dependency Audit

Project Directory:
`C:\Users\BAB AL SAFA\OneDrive\Desktop\New folder\cafteria-digital-menu`

> **User Guideline Update (Approved):**
> Modify as many files as necessary to complete each implementation step correctly. Keep changes focused, follow the architecture, and test each step before proceeding. Avoid unnecessary restrictions on the number of files.

### 1.1 Server Architecture Audit
- **Runtime:** Node.js 20+ with ES Modules (`"type": "module"` in `package.json`).
- **Existing packages in `server/package.json`:** `cors`, `dotenv`, `express`, `firebase-admin`, `helmet`, `mongoose`, `qrcode`, `socket.io`, `@types/express`, `@types/node`, `@types/qrcode`, `tsx`, `typescript`.
- **Missing server dependencies to install:**
  - `express-validator` (Defensive payload validation)
  - `jsonwebtoken` and `@types/jsonwebtoken` (JWT creation/verification for AdminUser and fallback token auth)
  - `bcryptjs` and `@types/bcryptjs` (AdminUser password hashing)
  - `@types/cors` (TypeScript types for CORS middleware)
- **Configuration updates:** Ensure `"type": "module"` in `server/package.json` and configure `tsconfig.json` for ESNext/NodeNext.

### 1.2 Client Architecture Audit
- **Target Stack:** React 18 / Vite / TypeScript / Tailwind CSS / Lucide React / `socket.io-client` / `idb-keyval` / `axios` / `react-router-dom`.
- **Current status:** The `client/` directory is currently empty (some client packages were installed at the root).
- **Remediation:** Initialize Vite React TypeScript project inside `client/`, configure Tailwind CSS, install UI & data libraries.

---

## 2. Credentials & Environment Variable Strategy

Credentials provided:
- **Firebase Web Config:**
  - `apiKey`: `AIzaSyDCB4EuBUxBRGss6m43bvuJX1PlaZB7jlU`
  - `authDomain`: `jaaamin-rox.firebaseapp.com`
  - `projectId`: `jaaamin-rox`
  - `storageBucket`: `jaaamin-rox.firebasestorage.app`
  - `messagingSenderId`: `858861626056`
  - `appId`: `1:858861626056:web:934eb11b87c1dd85ca3bfd`
- **MongoDB Atlas URI:**
  - `mongodb://cafteria-digital-menu:iFRsCtRZfQ9twXui@ac-nikpmo2-shard-00-00.d99lkj3.mongodb.net:27017,ac-nikpmo2-shard-00-01.d99lkj3.mongodb.net:27017,ac-nikpmo2-shard-00-02.d99lkj3.mongodb.net:27017/?ssl=true&replicaSet=atlas-5z1ohr-shard-0&authSource=admin&compressors=zlib`

### Environment Files
1. `server/.env` (Protected, git-ignored):
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_ORIGIN=http://localhost:5173
   MONGODB_URI=mongodb://cafteria-digital-menu:iFRsCtRZfQ9twXui@ac-nikpmo2-shard-00-00.d99lkj3.mongodb.net:27017,ac-nikpmo2-shard-00-01.d99lkj3.mongodb.net:27017,ac-nikpmo2-shard-00-02.d99lkj3.mongodb.net:27017/?ssl=true&replicaSet=atlas-5z1ohr-shard-0&authSource=admin&compressors=zlib
   JWT_SECRET=super_secret_cafe_jwt_key_2026_dev
   FIREBASE_PROJECT_ID=jaaamin-rox
   ```
2. `client/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_FIREBASE_API_KEY=AIzaSyDCB4EuBUxBRGss6m43bvuJX1PlaZB7jlU
   VITE_FIREBASE_AUTH_DOMAIN=jaaamin-rox.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=jaaamin-rox
   VITE_FIREBASE_STORAGE_BUCKET=jaaamin-rox.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=858861626056
   VITE_FIREBASE_APP_ID=1:858861626056:web:934eb11b87c1dd85ca3bfd
   ```
3. Provide `.env.example` templates for both server and client without credentials.

---

## 3. Data Models & API Contracts

### 3.1 Mongoose Schemas & TypeScript Definitions
- **`MenuItem` (`server/src/models/MenuItem.ts`):**
  - `name`: String, required
  - `description`: String
  - `price`: Number, required, min 0
  - `category`: Enum `['Starters', 'Main Dishes', 'Desserts', 'Hot Drinks', 'Cold Drinks']`
  - `dietaryTags`: `['Vegetarian', 'Vegan', 'Spicy', 'Gluten-Free']`
  - `imageUrl`: String
  - `basePrepTimeMinutes`: Number, default 15
  - `isAvailable`: Boolean, default true
  - Timestamps: `createdAt`, `updatedAt`
- **`Order` (`server/src/models/Order.ts`):**
  - `tableNumber`: Number, required
  - `items`: Subdocuments (`OrderItem`): `menuItemId` (ref MenuItem), `name` (snapshot), `price` (snapshot), `quantity`, `specialInstructions`
  - `subtotal`: Number
  - `tax`: Number (15% VAT / service charge)
  - `totalAmount`: Number (subtotal + tax)
  - `paymentStatus`: Enum `['Pending', 'Paid']`, default 'Pending'
  - `orderStatus`: Enum `['Received', 'Cooking', 'Ready', 'Served', 'Cancelled']`, default 'Received'
  - `estimatedPrepTimeMinutes`: Number
  - `servedAt`: Date (optional)
  - Indexes: `{ orderStatus: 1, createdAt: -1 }`
- **`Table` (`server/src/models/Table.ts`):**
  - `tableNumber`: Number, unique
  - `qrCodeUrl`: String (data URL generated via `qrcode`)
  - `isOccupied`: Boolean, default false
  - `activeOrderId`: ObjectId (ref Order, nullable)
- **`AdminUser` (`server/src/models/AdminUser.ts`):**
  - `name`: String
  - `email`: String, unique
  - `passwordHash`: String
  - `role`: Enum `['Owner', 'KitchenStaff']`

### 3.2 REST API Routes
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/menu` | Public | List available menu items by category |
| POST | `/api/menu` | Staff/Owner | Create new menu item |
| PATCH | `/api/menu/:id/stock` | Staff/Owner | Toggle item availability + socket broadcast |
| POST | `/api/orders` | Public (Table) | Place order, calculate subtotal/tax, emit `order:new` |
| GET | `/api/orders/active` | Staff/Owner | List active orders (not Served/Cancelled) |
| PATCH | `/api/orders/:id/status` | Staff/Owner | Update order status + emit `order:status-change` |
| GET | `/api/tables` | Owner | List all tables and QR code data |
| POST | `/api/tables/generate` | Owner | Batch generate tables & QR codes |
| GET | `/api/analytics/dashboard` | Owner | Revenue, order counts, average prep times |
| POST | `/api/auth/login` | Public | Staff login (JWT issue / Firebase verify) |

### 3.3 Real-Time WebSocket Events (Socket.io)
- `order:new`: Broadcast new customer order to kitchen tablet screen.
- `order:status-change`: Broadcast order progression (`Received` -> `Cooking` -> `Ready` -> `Served`) to customer table phone tracker.
- `stock:toggle`: Broadcast out-of-stock menu updates immediately to customer browsing grids.

---

## 4. Phased Implementation Roadmap

```mermaid
flowchart TD
    P1[Phase 1: Server Infrastructure & Models] --> P2[Phase 2: Client Foundation & State Management]
    P2 --> P3[Phase 3: Customer QR Ordering View]
    P3 --> P4[Phase 4: Kitchen Display & Owner Dashboard]
    P4 --> P5[Phase 5: Cloud Deployment Config & E2E Verification]
```

### Phase 1: Server Infrastructure & Database Models
- Step 1.1: Configure `server/package.json` (`"type": "module"`, install missing dependencies) & `server/tsconfig.json`.
- Step 1.2: Environment configuration (`server/.env`, `server/.env.example`) with MongoDB Atlas URI and Firebase credentials.
- Step 1.3: Database singleton (`server/src/config/db.ts`) & Auth middleware (`server/src/middleware/auth.ts`).
- Step 1.4: Mongoose models: `MenuItem.ts`, `Order.ts`, `Table.ts`, `AdminUser.ts`.
- Step 1.5: Controllers & Routes:
  - Menu controller & routes (`/api/menu`)
  - Order controller & routes (`/api/orders`)
  - Table controller & routes (`/api/tables`)
  - Analytics controller & routes (`/api/analytics`)
  - Staff Auth controller & routes (`/api/auth`)
- Step 1.6: Express server entry point (`server/src/server.ts`) with Socket.io server and test database connectivity.

### Phase 2: Client Foundation & State Management
- Step 2.1: Initialize Vite React TypeScript in `client/` and configure Tailwind CSS & dependencies.
- Step 2.2: Setup `client/.env` and `client/.env.example`.
- Step 2.3: TypeScript interfaces (`client/src/types/index.ts`) matching server models.
- Step 2.4: Firebase client SDK configuration (`client/src/config/firebase.ts`).
- Step 2.5: API client (`client/src/lib/api.ts`) & Socket.io client (`client/src/lib/socket.ts`).
- Step 2.6: Custom state hooks: `useCart.ts` (with `idb-keyval` <16ms update contract) and `useOrderSocket.ts`.

### Phase 3: Customer QR Ordering View (Mobile-First)
- Step 3.1: Customer header (`client/src/components/layout/CustomerHeader.tsx`) showing table number & kitchen banner.
- Step 3.2: Menu item card (`client/src/components/cards/MenuItemCard.tsx`) with >=44px tap targets and stock badge.
- Step 3.3: Slide-up cart drawer (`client/src/components/drawers/CartDrawer.tsx`) with subtotal, 15% tax, and order submission.
- Step 3.4: Order tracking component (`client/src/components/tracker/OrderStatusTracker.tsx`).
- Step 3.5: Full customer menu page (`client/src/pages/CustomerMenuPage.tsx`) handling `/menu?table=N` QR landing.

### Phase 4: Kitchen Display & Owner Dashboard
- Step 4.1: Kitchen Kanban order ticket card (`client/src/components/cards/OrderTicketCard.tsx`) with status action buttons.
- Step 4.2: Kitchen Display page (`client/src/pages/KitchenDisplayPage.tsx`) with live orders queue and stock toggle drawer.
- Step 4.3: Owner KPI cards & Analytics dashboard (`client/src/pages/OwnerDashboardPage.tsx`).
- Step 4.4: Table QR code management and batch printing (`client/src/components/tables/TableQrManager.tsx`).
- Step 4.5: Staff login page (`client/src/pages/StaffLoginPage.tsx`) and application routing (`client/src/App.tsx`).

### Phase 5: Cloud Deployment & Integration Verification
- Step 5.1: `render.yaml` configuration for frontend static site and backend web service (including environment variables specification).
- Step 5.2: Verification of builds (`npm run build` for server and client) and type checks.
- Step 5.3: End-to-end smoke test: QR table scan -> order submission -> kitchen display live ticket -> status change notification back to customer.
