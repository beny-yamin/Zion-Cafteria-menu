# SECTION 4: SPEC-DRIVEN ARCHITECTURE (SINGLE-CAFE DIGITAL MENU & ORDERING SYSTEM)

## 4.1 Data Models (Mongoose & TypeScript Schemas)

### MenuItem Schema (`MenuItem`)
- `_id`: ObjectId (MongoDB auto-generated)
- `name`: String (e.g., "Classic Cheeseburger", "Iced Latte")
- `description`: String (Short item description)
- `price`: Number (Decimal/Float, e.g., 12.50)
- `category`: String (Enum: `['Starters', 'Main Dishes', 'Desserts', 'Hot Drinks', 'Cold Drinks']`)
- `dietaryTags`: Array of Strings (Enum: `['Vegetarian', 'Vegan', 'Spicy', 'Gluten-Free']`)
- `imageUrl`: String (URL or path to item photo)
- `basePrepTimeMinutes`: Number (Default: 15)
- `isAvailable`: Boolean (Default: true, toggled by kitchen out-of-stock switch)
- `createdAt` / `updatedAt`: Date / ISO string

### Order Schema (`Order`)
- `_id`: ObjectId (MongoDB auto-generated)
- `tableNumber`: Number (Table where the order originated)
- `items`: Array of Subdocuments (`OrderItem`):
  * `menuItemId`: ObjectId (References `MenuItem._id`)
  * `name`: String (Snapshot of name at time of order)
  * `price`: Number (Snapshot of price at time of order)
  * `quantity`: Number (Min: 1)
  * `specialInstructions`: String (e.g., "No onions, extra ice")
- `subtotal`: Number (Sum of item prices * quantities)
- `tax`: Number (Calculated tax amount)
- `totalAmount`: Number (`subtotal + tax`)
- `paymentStatus`: String (Enum: `['Pending', 'Paid']`, Default: 'Pending')
- `orderStatus`: String (Enum: `['Received', 'Cooking', 'Ready', 'Served', 'Cancelled']`, Default: 'Received')
- `estimatedPrepTimeMinutes`: Number (Current kitchen load wait time)
- `servedAt`: Date / ISO string (Timestamp when marked served, used for analytics)
- `createdAt` / `updatedAt`: Date / ISO string (Index: `{ orderStatus: 1, createdAt: -1 }`)

### Table Schema (`Table`)
- `_id`: ObjectId (MongoDB auto-generated)
- `tableNumber`: Number (Unique index, e.g., 1, 2, 3...)
- `qrCodeUrl`: String (Data URL or SVG/PNG path generated via `qrcode` package)
- `isOccupied`: Boolean (Default: false)
- `activeOrderId`: ObjectId (References `Order._id`, nullable)
- `createdAt` / `updatedAt`: Date / ISO string

### AdminUser Schema (`AdminUser`)
- `_id`: ObjectId (MongoDB auto-generated)
- `name`: String (Staff or Owner name)
- `email`: String (Unique, indexed)
- `passwordHash`: String (Bcrypt hashed password)
- `role`: String (Enum: `['Owner', 'KitchenStaff']`)
- `createdAt` / `updatedAt`: Date / ISO string

---

## 4.2 API Contracts & Endpoint Definitions

### Base URL: `/api`
- Protected routes require Header: `Authorization: Bearer <Firebase_ID_Token_or_JWT>`

### Endpoints
1. `GET /api/menu`
   - Response: `{ items: MenuItem[] }`
   - Logic: Public endpoint. Returns all menu items filtered by category and availability.
2. `POST /api/menu` (Admin/Owner only)
   - Payload: `{ name, description, price, category, dietaryTags, imageUrl, basePrepTimeMinutes }`
   - Response: `{ success: true, item: MenuItem }`
   - Logic: Creates and saves a new menu item.
3. `PATCH /api/menu/:id/stock` (Kitchen / Owner)
   - Payload: `{ isAvailable: boolean }`
   - Response: `{ success: true, item: MenuItem }`
   - Logic: Toggles item stock availability, immediately syncing across active customer sessions.
4. `POST /api/orders`
   - Payload: `{ tableNumber: number, items: Array<{ menuItemId: string, quantity: number, specialInstructions?: string }> }`
   - Response: `{ success: true, order: Order }`
   - Logic: Validates menu items, calculates subtotal/tax/total, creates order with `status: 'Received'`, and emits live Socket.io event `order:new`.
5. `GET /api/orders/active` (Kitchen Staff)
   - Response: `{ orders: Order[] }`
   - Logic: Fetches all active orders where `orderStatus` is NOT `Served` or `Cancelled`, sorted chronologically.
6. `PATCH /api/orders/:id/status` (Kitchen Staff)
   - Payload: `{ orderStatus: 'Cooking' | 'Ready' | 'Served' | 'Cancelled' }`
   - Response: `{ success: true, order: Order }`
   - Logic: Updates order status and broadcasts Socket.io event `order:status-change` to customer phone trackers.
7. `GET /api/tables` (Owner)
   - Response: `{ tables: Table[] }`
   - Logic: Returns all restaurant tables and their generated QR codes.
8. `POST /api/tables/generate` (Owner)
   - Payload: `{ totalTables: number }`
   - Response: `{ success: true, count: number }`
   - Logic: Generates table records and compiles QR code data URLs (`https://domain.com/menu?table=N`).
9. `GET /api/analytics/dashboard` (Owner)
   - Query Params: `range=today|week|month`
   - Response: `{ totalRevenue: number, orderCount: number, avgPrepTimeMinutes: number, topSellingItems: object[] }`
   - Logic: Aggregates completed orders within the specified date range.

---

## 4.3 Core Business Logic & Mathematical Formulas
- **Cart Calculations:**
  * Subtotal = $\sum (\text{item.price} \times \text{item.quantity})$
  * Tax = $\text{Subtotal} \times 0.15$ (15% VAT / service charge)
  * Total = $\text{Subtotal} + \text{Tax}$
- **Kitchen Prep Speed (Analytics):**
  * Average Prep Time = $\frac{\sum (\text{servedAt} - \text{createdAt})}{\text{Total Served Orders}}$ (in minutes)
- **Real-Time Socket Events:**
  * `order:new`: Broadcasts new customer order payload to kitchen tablet screen.
  * `order:status-change`: Broadcasts order progression (`Received` $\rightarrow$ `Cooking` $\rightarrow$ `Ready`) to table customer phone view.
  * `stock:toggle`: Broadcasts out-of-stock menu updates instantly to customer browsing grids.

---

## 4.4 Step-by-Step Implementation Sequence

### Phase 1: Server Infrastructure & Database Models
- Step 1.1: `server/src/config/db.ts` (Mongoose connection singleton)
- Step 1.2: `server/src/middleware/auth.ts` (JWT / Firebase token verification)
- Step 1.3: `server/src/models/MenuItem.ts` & `server/src/models/Order.ts`
- Step 1.4: `server/src/models/Table.ts` & `server/src/models/AdminUser.ts`
- Step 1.5: `server/src/controllers/menuController.ts` & `server/src/routes/menuRoutes.ts`
- Step 1.6: `server/src/controllers/orderController.ts` & `server/src/routes/orderRoutes.ts`
- Step 1.7: `server/src/controllers/tableController.ts` & `server/src/routes/tableRoutes.ts`
- Step 1.8: `server/src/controllers/analyticsController.ts` & `server/src/routes/analyticsRoutes.ts`
- Step 1.9: `server/src/server.ts` (Express server setup + Socket.io integration)

### Phase 2: Client Foundation & State Management
- Step 2.1: `client/src/types/index.ts` (TypeScript interfaces for Menu, Order, Table)
- Step 2.2: `client/src/lib/api.ts` (Axios client instance configured with base URL)
- Step 2.3: `client/src/lib/socket.ts` (Socket.io client singleton initialization)
- Step 2.4: `client/src/hooks/useCart.ts` (React state hook for cart items, quantities, and totals)
- Step 2.5: `client/src/hooks/useOrderSocket.ts` (Real-time listener for customer tracker and kitchen display)

### Phase 3: Customer QR Ordering View (Mobile-First)
- Step 3.1: `client/src/components/layout/CustomerHeader.tsx` (Table number display & kitchen load banner)
- Step 3.2: `client/src/components/cards/MenuItemCard.tsx` (Menu item display with stock check and Add button)
- Step 3.3: `client/src/components/drawers/CartDrawer.tsx` (Slide-up cart summary and order submission)
- Step 3.4: `client/src/pages/CustomerMenuPage.tsx` (Category filtering, search bar, and live order tracking screen)

### Phase 4: Kitchen Display & Owner Dashboard
- Step 4.1: `client/src/components/cards/OrderTicketCard.tsx` (Kitchen order card with status action buttons)
- Step 4.2: `client/src/pages/KitchenDisplayPage.tsx` (Live Kanban queue and out-of-stock toggle drawer)
- Step 4.3: `client/src/components/cards/KpiCard.tsx` & `client/src/pages/OwnerDashboardPage.tsx` (Revenue metrics and prep speed analytics)
- Step 4.4: `client/src/components/forms/MenuManagerModal.tsx` & QR code printable batch generator component

### Phase 5: Cloud Deployment & Integration Testing
- Step 5.1: `render.yaml` configuration for frontend static site and backend web service
- Step 5.2: End-to-end smoke test verifying table QR scan $\rightarrow$ customer order $\rightarrow$ real-time kitchen display $\rightarrow$ status update tracker.