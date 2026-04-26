import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

let cached = global._supabase;
if (!cached) {
  cached = global._supabase = { client: null };
}

export function getSupabase() {
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_KEY not set');
  if (!cached.client) {
    cached.client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'X-Client-Info': 'netrik-shop' } },
    });
  }
  return cached.client;
}

// ---------- Field mappers ----------
// DB uses snake_case; API uses camelCase + nested creds for restaurants.

export const restaurantToApi = (r) => r ? ({
  id: r.id,
  name: r.name,
  ownerName: r.owner_name,
  contact: r.contact,
  address: r.address || '',
  domain: r.domain || '',
  subscription: r.subscription,
  managerCreds: { userId: r.manager_user_id, password: r.manager_password },
  chefCreds:    { userId: r.chef_user_id,    password: r.chef_password },
  createdAt: r.created_at,
  updatedAt: r.updated_at || null,
}) : null;

export const menuToApi = (m) => m ? ({
  id: m.id, restaurantId: m.restaurant_id, name: m.name, nameEs: m.name_es || '',
  description: m.description || '', price: parseFloat(m.price), category: m.category, image: m.image || '',
  available: m.available, createdAt: m.created_at,
}) : null;

export const tableToApi = (t) => t ? ({
  id: t.id, restaurantId: t.restaurant_id, number: t.number, seats: t.seats, status: t.status,
  createdAt: t.created_at,
}) : null;

export const orderToApi = (o) => o ? ({
  id: o.id, restaurantId: o.restaurant_id, tableId: o.table_id, tableNumber: o.table_number,
  items: (o.items || []).map(it => ({ ...it, price: parseFloat(it.price) })),
  total: parseFloat(o.total), status: o.status, allergy: o.allergy || '', spicyLevel: o.spicy_level || '',
  paidAt: o.paid_at, createdAt: o.created_at, updatedAt: o.updated_at || null,
}) : null;
