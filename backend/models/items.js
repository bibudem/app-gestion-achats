const supabase = require('../config/supabase.config');

class Items {

  // CREATE
  static async create(data) {
    if (!supabase) throw new Error('Supabase client non initialisé');

    const { data: result, error } = await supabase
      .from('tbl_items')
      .insert([data])
      .select('*');

    if (error) throw error;
    return result;
  }

  // READ one
  static async findById(id) {
    if (!supabase) throw new Error('Supabase client non initialisé');

    const { data: result, error } = await supabase
      .from('tbl_items')
      .select('*')
      .eq('id_item', id)
      .single();

    if (error) throw error;
    return result;
  }

  // READ all + pagination
  static async findAll(limit = 50, offset = 0) {
    if (!supabase) throw new Error('Supabase client non initialisé');

    const { data: result, error } = await supabase
      .from('tbl_items')
      .select('*')
      .order('date_creation', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return result;
  }

  // UPDATE
  static async update(id, data) {
    if (!supabase) throw new Error('Supabase client non initialisé');

    const { data: result, error } = await supabase
      .from('tbl_items')
      .update(data)
      .eq('id_item', id)
      .select('*');

    if (error) throw error;
    return result;
  }

  // DELETE
  static async delete(id) {
    if (!supabase) throw new Error('Supabase client non initialisé');

    const { data: result, error } = await supabase
      .from('tbl_items')
      .delete()
      .eq('id_item', id)
      .select('*');

    if (error) throw error;
    return result;
  }

  
}

module.exports = Items;
