import { supabase } from '../supabase';

export const customerService = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('status', 1)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async create(customer: { name: string; email?: string; contact?: string; address?: string; city?: string; country?: string; status?: number }) {
    const code = await this.generateCode();
    const { data, error } = await supabase
      .from('customers')
      .insert({ ...customer, code })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('customers')
      .update({ status: 0 })
      .eq('id', id);

    if (error) throw error;
  },

  async generateCode() {
    const { data } = await supabase
      .from('customers')
      .select('code')
      .order('code', { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return 'CUS000001';

    const lastCode = data[0].code;
    const num = parseInt(lastCode.replace('CUS', '')) + 1;
    return `CUS${String(num).padStart(6, '0')}`;
  },
};
