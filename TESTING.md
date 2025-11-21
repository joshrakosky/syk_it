# Testing Guide for Stryker Christmas Store

## Quick Start Testing

### 1. Environment Setup ✅
- Environment variables are already configured in `.env.local`
- Supabase database tables are created
- Sample products are loaded

### 2. Start Development Server

The dev server should already be running. If not:

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## Testing the Order Flow

### Step 1: Landing Page (`/`)
1. ✅ Enter a valid email address (e.g., `test@example.com`)
2. ✅ Click "Start Shopping"
3. ✅ Should redirect to `/choice1`

**Test Cases:**
- ❌ Try submitting without email → Should show error
- ❌ Try invalid email format → Should show error

### Step 2: Product Choice 1 (`/choice1`)
1. ✅ Select a product from dropdown (e.g., "Stryker Logo T-Shirt")
2. ✅ Product details should appear (thumbnail, description, specs)
3. ✅ Select color (if required)
4. ✅ Select size (if required)
5. ✅ Click "Continue to Choice 2"

**Test Cases:**
- ❌ Try continuing without selecting product → Should show error
- ❌ Try continuing without color/size when required → Should show error
- ✅ Test products that don't require color/size

### Step 3: Product Choice 2 (`/choice2`)
1. ✅ Select a product from dropdown (e.g., "Holiday Gift Kit")
2. ✅ Product details should appear
3. ✅ Select color/size if required
4. ✅ Click "Continue to Shipping"

**Test Cases:**
- Same validation tests as Choice 1
- ✅ Test back button → Should return to Choice 1

### Step 4: Shipping Information (`/shipping`)
1. ✅ Fill in all required fields:
   - Full Name
   - Street Address
   - City
   - State
   - ZIP Code
   - Country (defaults to USA)
2. ✅ Click "Submit Order"

**Test Cases:**
- ❌ Try submitting with empty fields → Should show error
- ✅ Test back button → Should return to Choice 2

### Step 5: Order Confirmation (`/confirmation`)
1. ✅ Should display order number (format: `STRYKER-{timestamp}-{random}`)
2. ✅ Should show success message
3. ✅ "Start New Order" button should clear session and return to landing

**Test Cases:**
- ✅ Verify order number is unique
- ✅ Verify order is saved in database

---

## Testing Duplicate Prevention

### Test Case: Duplicate Email
1. ✅ Complete an order with email `test@example.com`
2. ✅ Try to start a new order with the same email
3. ❌ Should be blocked at order submission with error: "An order already exists for this email address"

**Note:** The duplicate check happens at order submission, not at email entry. This allows users to review their selections before being blocked.

---

## Testing Admin Export

### Access Admin Panel
1. ✅ Navigate to `/admin`
2. ✅ Enter password: `stryker2024` (or your custom password)
3. ✅ Click "Login"

### View Orders
1. ✅ Should see list of all orders
2. ✅ Each order shows:
   - Order Number
   - Email
   - Products (with color/size if applicable)
   - Shipping Address
   - Order Date

### Export to Excel
1. ✅ Click "Export to Excel" button
2. ✅ File should download: `stryker-orders-{date}.xlsx`
3. ✅ Open in Excel/Google Sheets
4. ✅ Verify columns:
   - Order Number
   - Email
   - Product Name
   - Color
   - Size
   - Shipping Name
   - Shipping Address
   - Shipping City
   - Shipping State
   - Shipping ZIP
   - Shipping Country
   - Order Date

**Test Cases:**
- ✅ Export with multiple orders
- ✅ Export with orders that have variants
- ✅ Export with orders without variants

---

## Database Verification

### Check Orders in Supabase
1. Go to Supabase Dashboard → Table Editor → `christmas_orders`
2. ✅ Verify orders are being created
3. ✅ Verify email uniqueness constraint works

### Check Order Items
1. Go to `christmas_order_items` table
2. ✅ Verify each order has 2 items (one from each choice)
3. ✅ Verify color/size are stored correctly

### Check Products
1. Go to `christmas_products` table
2. ✅ Verify 6 sample products exist:
   - 3 in `choice1` category
   - 3 in `choice2` category

---

## Common Issues & Solutions

### Issue: Products not loading
- **Check:** Browser console for errors
- **Check:** Supabase connection in `.env.local`
- **Check:** Table name is `christmas_products` (not `products`)

### Issue: Order submission fails
- **Check:** All required fields are filled
- **Check:** Email is unique (not already used)
- **Check:** Browser console for API errors
- **Check:** Supabase RLS policies allow inserts

### Issue: Admin page shows no orders
- **Check:** Orders exist in `christmas_orders` table
- **Check:** Table name matches in admin code

### Issue: Excel export fails
- **Check:** Browser allows downloads
- **Check:** `xlsx` package is installed
- **Check:** There are orders to export

---

## Manual Database Testing

### Add More Products via Supabase SQL Editor:

```sql
INSERT INTO christmas_products (name, description, category, requires_color, requires_size, available_colors, available_sizes) 
VALUES 
('New Product Name', 'Product description', 'choice1', true, true, ARRAY['Red', 'Blue'], ARRAY['M', 'L']);
```

### Clear Test Orders:

```sql
-- Delete all test orders (careful - this deletes everything!)
DELETE FROM christmas_order_items;
DELETE FROM christmas_orders;
```

---

## Performance Testing

- ✅ Test with multiple browser tabs (should work independently)
- ✅ Test session persistence (refresh page - should maintain state)
- ✅ Test with slow network (should show loading states)

---

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

## Next Steps After Testing

1. ✅ Add your actual products to `christmas_products` table
2. ✅ Update product images (add `thumbnail_url` values)
3. ✅ Customize admin password in `.env.local`
4. ✅ Deploy to Vercel
5. ✅ Test production deployment

