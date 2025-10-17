import { supabase } from '@/lib/supabaseClient';

export async function fetchEvents() {
  return await supabase.from('events').select('*');
}

export async function createEvent(data) {
  return await supabase.from('events').insert(data).select().single();
}

export async function updateEvent(id, data) {
  return await supabase.from('events').update(data).eq('id', id).select().single();
}

export async function deleteEvent(id) {
  return await supabase.from('events').delete().eq('id', id);
}
