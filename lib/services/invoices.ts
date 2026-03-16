import { supabase } from '../supabase';

export const invoiceService = {
  async create(invoiceData: {
    customer_id: string;
    post_date: string;
    due_date: string;
    payment_method: string;
    total_amount: number;
    discount_amount: number;
    net_total: number;
    items: Array<{
      product_id?: string;
      sku: string;
      product_name: string;
      quantity: number;
      price: number;
      discount: number;
      is_free?: boolean;
    }>;
  }) {
    const invoiceCode = await this.generateCode();

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_code: invoiceCode,
        customer_id: invoiceData.customer_id,
        post_date: invoiceData.post_date,
        due_date: invoiceData.due_date,
        payment_method: invoiceData.payment_method,
        total_amount: invoiceData.total_amount,
        discount_amount: invoiceData.discount_amount,
        net_total: invoiceData.net_total,
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(
        invoiceData.items.map(item => ({
          invoice_id: invoice.id,
          product_id: item.product_id || null,
          sku: item.sku || null,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          is_free: item.is_free || false,
        }))
      );

    if (itemsError) throw itemsError;

    for (const item of invoiceData.items) {
      if (!item.is_free) {
        const { data: product } = await supabase
          .from('products')
          .select('quantity')
          .eq('sku', item.sku)
          .single();

        if (product) {
          await supabase
            .from('products')
            .update({ quantity: product.quantity - item.quantity })
            .eq('sku', item.sku);
        }
      }
    }

    return { ...invoice, invoice_code: invoiceCode };
  },

  async getAll() {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customers (
          name,
          contact
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async generateCode() {
    const { data } = await supabase
      .from('invoices')
      .select('invoice_code')
      .order('invoice_code', { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return 'INV000001';

    const lastCode = data[0].invoice_code;
    const num = parseInt(lastCode.replace('INV', '')) + 1;
    return `INV${String(num).padStart(6, '0')}`;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customers (
          id,
          code,
          name,
          email,
          contact,
          address,
          city,
          country
        ),
        invoice_items (
          id,
          sku,
          product_name,
          quantity,
          price,
          discount,
          is_free
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getSalesData(groupBy: 'daily' | 'monthly' | 'yearly' = 'monthly') {
    const { data, error } = await supabase
      .from('invoices')
      .select('post_date, net_total')
      .order('post_date');

    if (error) throw error;

    const grouped: { [key: string]: number } = {};

    data?.forEach((invoice) => {
      const date = new Date(invoice.post_date);
      let key: string;

      if (groupBy === 'yearly') {
        key = date.getFullYear().toString();
      } else if (groupBy === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = invoice.post_date;
      }

      grouped[key] = (grouped[key] || 0) + invoice.net_total;
    });

    return Object.entries(grouped).map(([key, total]) => ({
      [groupBy === 'yearly' ? 'year' : groupBy === 'monthly' ? 'month' : 'date']: key,
      total_net: total,
    }));
  },
};
