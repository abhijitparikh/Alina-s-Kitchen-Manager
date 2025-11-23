/**
 * DATABASE CONNECTION SERVICE
 * 
 * To enable the database:
 * 1. Install the Supabase client:
 *    npm install @supabase/supabase-js
 * 
 * 2. Uncomment the code below and fill in your keys.
 */

// import { createClient } from '@supabase/supabase-js';

// // TODO: Replace with your actual project URL and Anon Key from Supabase Dashboard
// const SUPABASE_URL = 'https://your-project-id.supabase.co';
// const SUPABASE_KEY = 'your-anon-key';

// export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Example Helper Functions to replace localStorage calls
 */

/*
export const fetchOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data;
};

export const saveOrder = async (order: any) => {
  // Remove the ID if you want the DB to auto-generate it
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select();
    
  if (error) throw error;
  return data[0];
};

export const deleteOrderSupabase = async (id: string) => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);
  if (error) throw error;
};
*/