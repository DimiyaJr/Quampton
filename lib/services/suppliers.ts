import { supabase } from '../supabase';

export const supplierService = {
  async getAll() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('status', 1)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async create(supplier: any) {
    const code = await this.generateCode();
    const { data, error } = await supabase
      .from('suppliers')
      .insert({ ...supplier, code })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('suppliers')
      .update({ status: 0 })
      .eq('id', id);

    if (error) throw error;
  },

  async generateCode() {
    const { data } = await supabase
      .from('suppliers')
      .select('code')
      .order('code', { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return 'SUP000001';

    const lastCode = data[0].code;
    const num = parseInt(lastCode.replace('SUP', '')) + 1;
    return `SUP${String(num).padStart(6, '0')}`;
  },
};
