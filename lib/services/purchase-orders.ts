import { supabase } from '../supabase';

export const purchaseOrderService = {
  async create(poData: {
    supplier_id: string;
    total_cost: number;
    items: Array<{
      product_id: string;
      quantity: number;
      cost: number;
    }>;
  }) {
    const poCode = await this.generateCode();

    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        po_code: poCode,
        supplier_id: poData.supplier_id,
        total_cost: poData.total_cost,
      })
      .select()
      .single();

    if (poError) throw poError;

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(
        poData.items.map(item => ({
          po_id: po.id,
          product_id: item.product_id,
          quantity: item.quantity,
          cost: item.cost,
        }))
      );

    if (itemsError) throw itemsError;

    for (const item of poData.items) {
      const { data: product } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.product_id)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({ quantity: product.quantity + item.quantity })
          .eq('id', item.product_id);
      }
    }

    return po;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (
          name,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (
          id,
          code,
          name,
          email,
          phone,
          address,
          city,
          country
        ),
        purchase_order_items (
          id,
          quantity,
          cost,
          products (
            id,
            sku,
            name
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async generateCode() {
    const { data } = await supabase
      .from('purchase_orders')
      .select('po_code')
      .order('po_code', { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return 'PO000001';

    const lastCode = data[0].po_code;
    const num = parseInt(lastCode.replace('PO', '')) + 1;
    return `PO${String(num).padStart(6, '0')}`;
  },
};
