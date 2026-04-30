# NexaCart - E-commerce Application with Admin Panel

A modern e-commerce application built with React, TypeScript, and Supabase, featuring admin product management and Razorpay payment integration.


## Features
### Admin Features
- **Product Management**: Add, edit, delete products

- **Inventory Control**: Update stock levels and prices
- **Order Management**: View and manage customer orders
- **User Management**: Admin role-based access control

### User Features
- **Product Catalog**: Browse products by category
- **Shopping Cart**: Add/remove items, update quantities
- **Secure Checkout**: Razorpay payment integration
- **Order Tracking**: View order history and status


## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS
- **Backend**: Supabase (Database & Auth)
- **Payment**: Razorpay
- **State Management**: Zustand
- **UI Components**: Lucide Icons, Motion

## Prerequisites

- Node.js 18+
- Supabase account
- Razorpay account (for payments)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the environment file and configure your keys:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Gemini AI (for AI features)
GEMINI_API_KEY="your_gemini_api_key"

# Supabase (Database & Auth)
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Razorpay (Payments)
VITE_RAZORPAY_KEY_ID="your_razorpay_key_id"

# App URL (for local development)
APP_URL="http://localhost:3001"
```

### 3. Database Setup

**For New Setup:**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL commands from `supabase_schema.sql`
4. Enable replication for real-time updates (Database > Replication)

**For Existing Setup:**
If you already have the basic schema and get policy errors:
1. Run the migration script from `database_migration.sql`
2. This will add new payment tables and update existing structures

### 4. Admin Setup

Create an admin user:

1. Register a new account at `http://localhost:3001/register`
2. In Supabase SQL Editor, run:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

### 5. Razorpay Configuration

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your API keys from Dashboard > Settings > API Keys
3. Add the Key ID to your `.env` file

## Running the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## Usage Guide

### Admin Panel

1. **Sign in** as an admin user
2. Navigate to `/admin/inventory` to manage products
3. **Add Products**: Click "Add New Product"
4. **Edit Products**: Click the edit icon on any product
5. **Update Stock**: Edit product to change stock levels
6. **Delete Products**: Click the trash icon to remove products

### Customer Experience

1. **Browse Products**: View products on the homepage
2. **Add to Cart**: Click "Add to Cart" on any product
3. **Checkout**: Fill shipping details and pay with Razorpay
4. **Order History**: View orders in user dashboard

## Database Schema

The application uses the following main tables:

- `products`: Product information and inventory
- `orders`: Customer orders and status
- `order_items`: Individual items in each order
- `payments`: Payment records and verification
- `profiles`: User profiles and roles

## Security Features

- Row Level Security (RLS) on all tables
- Admin role-based access control
- Secure payment verification
- Environment variable protection

## Development

### Project Structure
```
src/
  components/     # Reusable UI components
  pages/         # Page components
    admin/       # Admin panel pages
    auth/        # Authentication pages
    user/        # User dashboard pages
  lib/           # Utilities and services
  store/         # State management
  api/           # API integrations
```

### Adding New Features

1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update state in `src/store/`
4. Add database migrations to `supabase_schema.sql`

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
Ensure you add all environment variables to your hosting platform.

## Troubleshooting

### Common Issues

1. **Supabase Connection**: Check your URL and keys in `.env`
2. **Admin Access**: Verify user role in `profiles` table
3. **Payment Issues**: Ensure Razorpay keys are correct
4. **Build Errors**: Check all environment variables are set

### Getting Help

- Check the browser console for errors
- Verify Supabase RLS policies
- Ensure all environment variables are configured
- Check network connectivity

## License

This project is for educational purposes. Please ensure compliance with Razorpay and Supabase terms of service.
