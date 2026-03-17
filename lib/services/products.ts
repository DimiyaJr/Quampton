import { supabase } from '../supabase';

export const productService = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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
  },

  async updateInventory(id: string, quantityChange: number) {
    const rpcFn = quantityChange >= 0 ? 'increment_product_stock' : 'decrement_product_stock';
    const { error } = await supabase.rpc(rpcFn, {
      p_product_id: id,
      p_qty: Math.abs(quantityChange),
    });
    if (error) throw error;
  },
};
