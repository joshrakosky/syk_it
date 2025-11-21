# Stryker Christmas Store

A simple ecommerce store for Stryker's holiday product selection. Users select products from two categories, provide shipping information, and receive an order confirmation. Administrators can export all orders to Excel for production.

## Features

- **Landing Page**: Email entry to start the order process
- **Product Choice 1**: Select from apparel products with color/size options
- **Product Choice 2**: Select from kit products with optional color/size
- **Shipping Form**: Collect shipping information
- **Order Confirmation**: Display order number
- **Duplicate Prevention**: Email-based tracking prevents multiple orders
- **Admin Export**: Excel export functionality for order management

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
3. Copy `.env.local.example` to `.env.local`
4. Add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_PASSWORD` (optional, defaults to 'stryker2024')

### 3. Add Products

Add your products via the Supabase dashboard or SQL. Products should have:
- `category`: 'choice1' or 'choice2'
- `requires_color`: boolean
- `requires_size`: boolean
- `available_colors`: array of strings (if requires_color is true)
- `available_sizes`: array of strings (if requires_size is true)

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment

Deploy to Vercel:

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Admin Access

Visit `/admin` to access the order management dashboard. Use the admin password to view and export orders.

## Order Flow

1. User enters email on landing page
2. Selects product from Choice 1 (with variants if needed)
3. Selects product from Choice 2 (with variants if needed)
4. Enters shipping information
5. Receives order confirmation with order number

## Database Schema

- **products**: Product catalog
- **orders**: Order information with shipping details
- **order_items**: Individual items in each order

## Excel Export

The admin page exports orders in a format ready for import into production systems. Each row contains:
- Order Number
- Email
- Product Name
- Color (if applicable)
- Size (if applicable)
- Full shipping address
- Order Date
