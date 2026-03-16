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

  async updateInventory(sku: string, quantityChange: number) {
    const { data: product } = await supabase
      .from('products')
      .select('quantity')
      .eq('sku', sku)
      .single();

    if (!product) throw new Error('Product not found');

    const { error } = await supabase
      .from('products')
      .update({ quantity: product.quantity + quantityChange })
      .eq('sku', sku);

    if (error) throw error;
  },
};
