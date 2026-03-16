# Retail Flow - Supabase Integration Guide

## ✅ Completed Work

### 1. Database Schema
- Complete Supabase database schema created and deployed
- Tables: product_categories, products, suppliers, customers, purchase_orders, purchase_order_items, invoices, invoice_items
- Row Level Security (RLS) enabled on all tables
- Proper indexes and foreign key relationships
- Auto-generated codes for suppliers, customers, and invoices

### 2. UI Improvements
- Removed all purple colors, now using professional blue/slate palette
- Primary color: Sky blue (#0ea5e9)
- Fully responsive design for mobile, tablet, and desktop
- Improved spacing, shadows, and visual hierarchy
- Updated all pages: Home, Inventory, Products, Categories, Purchase Orders, Suppliers, Customers, POS

### 3. Infrastructure
- Supabase client library created at `lib/supabase-client.ts`
- TypeScript types defined for all database tables
- @supabase/supabase-js package installed
- Environment variables configured

## 🔄 Next Steps to Complete Integration

### Step 1: Create Service Layer

Create `lib/services/` directory with service files for each entity:

**Example: `lib/services/products.ts`**
```typescript
import { supabase } from '@/lib/supabase-client';

export const productService = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(product: any) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
```

Create similar services for:
- `customers.ts`
- `suppliers.ts`
- `categories.ts`
- `purchase-orders.ts`
- `invoices.ts`

### Step 2: Update Component Data Fetching

Replace axios calls with Supabase service calls:

**Before:**
```typescript
const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
const products = response.data;
```

**After:**
```typescript
import { productService } from '@/lib/services/products';

const products = await productService.getAll();
```

### Step 3: Implement Authentication

1. Enable Email/Password auth in Supabase dashboard
2. Create auth context:

```typescript
// lib/auth-context.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase-client';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

3. Update auth page to use Supabase:

```typescript
const handleLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  router.push('/home');
};
```

### Step 4: Handle Image Uploads

Use Supabase Storage for product images:

```typescript
const uploadImage = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
```

### Step 5: Update Invoice Generation

Store invoice data in Supabase:

```typescript
const saveInvoice = async (invoiceData: any) => {
  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      invoice_code: generateInvoiceCode(),
      customer_id: customerId,
      post_date: postDate,
      due_date: dueDate,
      payment_method: paymentMethod,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      net_total: netTotal
    })
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // Create invoice items
  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(
      cart.map(item => ({
        invoice_id: invoice.id,
        product_id: item.id,
        sku: item.sku,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        is_free: item.isFree || false
      }))
    );

  if (itemsError) throw itemsError;

  // Update inventory
  for (const item of cart) {
    await supabase.rpc('decrement_inventory', {
      product_sku: item.sku,
      qty: item.quantity
    });
  }

  return invoice;
};
```

### Step 6: Create Database Functions

Add this to a new migration for inventory management:

```sql
CREATE OR REPLACE FUNCTION decrement_inventory(product_sku text, qty integer)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET quantity = quantity - qty
  WHERE sku = product_sku;
END;
$$;

CREATE OR REPLACE FUNCTION increment_inventory(product_sku text, qty integer)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET quantity = quantity + qty
  WHERE sku = product_sku;
END;
$$;
```

## 📊 Database Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| product_categories | Product categorization | id, name, status |
| products | Product inventory | sku, product_name, quantity, price, max_discount |
| suppliers | Supplier management | code, name, contact, address |
| customers | Customer records | code, name, contact, email |
| purchase_orders | Supplier orders | po_code, supplier_id, total_cost |
| invoices | Sales invoices | invoice_code, customer_id, net_total |
| invoice_items | Invoice line items | invoice_id, product_id, quantity, price |

## 🎨 Color Palette

- **Primary (Sky Blue)**: #0ea5e9 - Main actions, highlights
- **Secondary (Slate)**: #64748b - Neutral elements
- **Success**: #10b981 - Positive actions
- **Warning**: #f59e0b - Alerts
- **Danger**: #ef4444 - Delete/critical actions
- **Background**: #f8fafc - Page backgrounds
- **Text**: #0f172a - Primary text

## 🚀 Quick Start

1. All database tables are already created in Supabase
2. Environment variables are configured in `.env`
3. UI is fully responsive and updated
4. Follow the steps above to integrate Supabase into your components
5. Test each feature after migration

## 📝 Notes

- RLS policies are permissive for authenticated users - adjust as needed for production
- Add proper error handling in all service calls
- Consider adding loading states during data fetches
- Implement optimistic updates for better UX
- Add validation before database operations
