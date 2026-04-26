import { NextResponse } from 'next/server';
import { getSupabase, restaurantToApi, menuToApi, tableToApi, orderToApi } from '@/lib/supabase';
import { llmChat } from '@/lib/llm';

const json = (data, status = 200) => NextResponse.json(data, { status });
const err = (message, status = 400) => NextResponse.json({ error: message }, { status });

const slug = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 18) || 'rest';
const rand = (n = 4) => Math.random().toString(36).slice(2, 2 + n);
const randPwd = () => Math.floor(100000 + Math.random() * 900000).toString();

function stripJson(text) {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) {
    try { return { actions: JSON.parse(m[1]), reply: text.replace(m[0], '').trim() }; } catch {}
  }
  return { actions: null, reply: text };
}

async function handler(request, { params }) {
  const path = (params?.path || []).join('/');
  const method = request.method;
  let sb;
  try { sb = getSupabase(); }
  catch (e) { return err('Supabase not configured: ' + e.message, 500); }

  try {
    // ============ AUTH ============
    if (path === 'auth/login' && method === 'POST') {
      const { type, userId, password } = await request.json();
      if (!type || !userId || !password) return err('Missing fields');
      if (type === 'central') {
        const { data, error } = await sb.from('users').select('*').eq('type', 'central').eq('user_id', userId).eq('password', password).maybeSingle();
        if (error) return err(error.message, 500);
        if (!data) return err('Invalid credentials', 401);
        return json({ user: { id: data.id, type: 'central', userId: data.user_id } });
      }
      const field = type === 'manager' ? 'manager_user_id' : type === 'chef' ? 'chef_user_id' : null;
      const passField = type === 'manager' ? 'manager_password' : type === 'chef' ? 'chef_password' : null;
      if (!field) return err('Invalid type');
      const { data, error } = await sb.from('restaurants').select('*').eq(field, userId).eq(passField, password).maybeSingle();
      if (error) return err(error.message, 500);
      if (!data) return err('Invalid credentials', 401);
      return json({ user: { type, userId, restaurantId: data.id, restaurantName: data.name } });
    }

    // ============ RESTAURANTS ============
    if (path === 'restaurants' && method === 'GET') {
      const { data, error } = await sb.from('restaurants').select('*').order('created_at', { ascending: false });
      if (error) return err(error.message, 500);
      return json({ restaurants: (data || []).map(restaurantToApi) });
    }
    if (path === 'restaurants' && method === 'POST') {
      const body = await request.json();
      if (!body.name || !body.ownerName || !body.contact) return err('Missing required fields');
      const s = slug(body.name) + '_' + rand(4);
      const row = {
        name: body.name,
        owner_name: body.ownerName,
        contact: body.contact,
        address: body.address || '',
        domain: body.domain || '',
        subscription: body.subscription || 'Pro',
        manager_user_id: 'manager_' + s,
        manager_password: randPwd(),
        chef_user_id: 'chef_' + s,
        chef_password: randPwd(),
      };
      const { data, error } = await sb.from('restaurants').insert(row).select('*').single();
      if (error) return err(error.message, 500);
      return json({ restaurant: restaurantToApi(data) });
    }
    const restMatch = path.match(/^restaurants\/([^\/]+)$/);
    if (restMatch) {
      const id = restMatch[1];
      if (method === 'GET') {
        const { data, error } = await sb.from('restaurants').select('*').eq('id', id).maybeSingle();
        if (error) return err(error.message, 500);
        if (!data) return err('Not found', 404);
        return json({ restaurant: restaurantToApi(data) });
      }
      if (method === 'PUT') {
        const body = await request.json();
        const upd = { updated_at: new Date().toISOString() };
        if (body.name !== undefined) upd.name = body.name;
        if (body.ownerName !== undefined) upd.owner_name = body.ownerName;
        if (body.contact !== undefined) upd.contact = body.contact;
        if (body.address !== undefined) upd.address = body.address;
        if (body.domain !== undefined) upd.domain = body.domain;
        if (body.subscription !== undefined) upd.subscription = body.subscription;
        const { data, error } = await sb.from('restaurants').update(upd).eq('id', id).select('*').single();
        if (error) return err(error.message, 500);
        return json({ restaurant: restaurantToApi(data) });
      }
      if (method === 'DELETE') {
        // FK cascade defined in schema handles menu/tables/orders
        const { error } = await sb.from('restaurants').delete().eq('id', id);
        if (error) return err(error.message, 500);
        return json({ ok: true });
      }
    }

    // ============ MENU ============
    if (path === 'menu' && method === 'GET') {
      const url = new URL(request.url);
      const restaurantId = url.searchParams.get('restaurantId');
      const availableOnly = url.searchParams.get('availableOnly');
      let q = sb.from('menu').select('*').eq('restaurant_id', restaurantId).order('category', { ascending: true }).order('name', { ascending: true });
      if (availableOnly) q = q.eq('available', true);
      const { data, error } = await q;
      if (error) return err(error.message, 500);
      return json({ menu: (data || []).map(menuToApi) });
    }
    if (path === 'menu' && method === 'POST') {
      const body = await request.json();
      const row = {
        restaurant_id: body.restaurantId,
        name: body.name,
        name_es: body.nameEs || '',
        description: body.description || '',
        price: parseFloat(body.price) || 0,
        category: body.category || 'Mains',
        image: body.image || '',
        available: body.available !== false,
      };
      const { data, error } = await sb.from('menu').insert(row).select('*').single();
      if (error) return err(error.message, 500);
      return json({ item: menuToApi(data) });
    }
    const menuMatch = path.match(/^menu\/([^\/]+)$/);
    if (menuMatch) {
      const id = menuMatch[1];
      if (method === 'PUT') {
        const body = await request.json();
        const upd = {};
        if (body.name !== undefined) upd.name = body.name;
        if (body.description !== undefined) upd.description = body.description;
        if (body.price !== undefined) upd.price = parseFloat(body.price);
        if (body.category !== undefined) upd.category = body.category;
        if (body.image !== undefined) upd.image = body.image;
        if (body.available !== undefined) upd.available = body.available;
        if (body.nameEs !== undefined) upd.name_es = body.nameEs;
        const { error } = await sb.from('menu').update(upd).eq('id', id);
        if (error) return err(error.message, 500);
        return json({ ok: true });
      }
      if (method === 'DELETE') {
        const { error } = await sb.from('menu').delete().eq('id', id);
        if (error) return err(error.message, 500);
        return json({ ok: true });
      }
    }

    // ============ TABLES ============
    if (path === 'tables' && method === 'GET') {
      const url = new URL(request.url);
      const restaurantId = url.searchParams.get('restaurantId');
      const { data, error } = await sb.from('rest_tables').select('*').eq('restaurant_id', restaurantId).order('number', { ascending: true });
      if (error) return err(error.message, 500);
      return json({ tables: (data || []).map(tableToApi) });
    }
    if (path === 'tables' && method === 'POST') {
      const body = await request.json();
      const row = {
        restaurant_id: body.restaurantId,
        number: String(body.number),
        seats: parseInt(body.seats) || 2,
        status: 'available',
      };
      const { data, error } = await sb.from('rest_tables').insert(row).select('*').single();
      if (error) return err(error.message, 500);
      return json({ table: tableToApi(data) });
    }
    const tblMatch = path.match(/^tables\/([^\/]+)$/);
    if (tblMatch) {
      const id = tblMatch[1];
      if (method === 'GET') {
        const { data, error } = await sb.from('rest_tables').select('*').eq('id', id).maybeSingle();
        if (error) return err(error.message, 500);
        if (!data) return err('Not found', 404);
        return json({ table: tableToApi(data) });
      }
      if (method === 'PUT') {
        const body = await request.json();
        const upd = {};
        if (body.number !== undefined) upd.number = String(body.number);
        if (body.seats !== undefined) upd.seats = parseInt(body.seats);
        if (body.status !== undefined) upd.status = body.status;
        const { error } = await sb.from('rest_tables').update(upd).eq('id', id);
        if (error) return err(error.message, 500);
        return json({ ok: true });
      }
      if (method === 'DELETE') {
        const { error } = await sb.from('rest_tables').delete().eq('id', id);
        if (error) return err(error.message, 500);
        return json({ ok: true });
      }
    }

    // ============ ORDERS ============
    if (path === 'orders' && method === 'GET') {
      const url = new URL(request.url);
      const restaurantId = url.searchParams.get('restaurantId');
      const { data, error } = await sb.from('orders').select('*').eq('restaurant_id', restaurantId).order('created_at', { ascending: false }).limit(200);
      if (error) return err(error.message, 500);
      return json({ orders: (data || []).map(orderToApi) });
    }
    if (path === 'orders' && method === 'POST') {
      const body = await request.json();
      const { data: tbl, error: te } = await sb.from('rest_tables').select('*').eq('id', body.tableId).maybeSingle();
      if (te) return err(te.message, 500);
      if (!tbl) return err('Invalid table');
      const items = (body.items || []).map(i => ({ id: i.id, name: i.name, nameEs: i.nameEs || '', price: parseFloat(i.price), qty: parseInt(i.qty) || 1, notes: i.notes || '' }));
      const total = items.reduce((s, i) => s + i.price * i.qty, 0);
      const row = {
        restaurant_id: body.restaurantId,
        table_id: body.tableId,
        table_number: tbl.number,
        items,
        total,
        status: 'pending',
        allergy: body.allergy || '',
        spicy_level: body.spicyLevel || '',
      };
      const { data, error } = await sb.from('orders').insert(row).select('*').single();
      if (error) return err(error.message, 500);
      await sb.from('rest_tables').update({ status: 'occupied' }).eq('id', body.tableId);
      return json({ order: orderToApi(data) });
    }
    const orderMatch = path.match(/^orders\/([^\/]+)$/);
    if (orderMatch) {
      const id = orderMatch[1];
      if (method === 'GET') {
        const { data, error } = await sb.from('orders').select('*').eq('id', id).maybeSingle();
        if (error) return err(error.message, 500);
        if (!data) return err('Not found', 404);
        return json({ order: orderToApi(data) });
      }
      if (method === 'PUT') {
        const body = await request.json();
        const upd = { updated_at: new Date().toISOString() };
        if (body.status) upd.status = body.status;
        const { error } = await sb.from('orders').update(upd).eq('id', id);
        if (error) return err(error.message, 500);
        if (body.status === 'paid') {
          const { data: o } = await sb.from('orders').select('table_id').eq('id', id).maybeSingle();
          if (o) await sb.from('rest_tables').update({ status: 'available' }).eq('id', o.table_id);
        }
        return json({ ok: true });
      }
    }
    const addonsMatch = path.match(/^orders\/([^\/]+)\/addons$/);
    if (addonsMatch && method === 'POST') {
      const id = addonsMatch[1];
      const body = await request.json();
      const { data: o, error: ge } = await sb.from('orders').select('*').eq('id', id).maybeSingle();
      if (ge) return err(ge.message, 500);
      if (!o) return err('Not found', 404);
      const items = [...(o.items || [])];
      for (const it of (body.items || [])) {
        const ex = items.find(x => x.id === it.id);
        if (ex) ex.qty += parseInt(it.qty) || 1;
        else items.push({ id: it.id, name: it.name, nameEs: it.nameEs || '', price: parseFloat(it.price), qty: parseInt(it.qty) || 1, notes: it.notes || '' });
      }
      const total = items.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0);
      const newStatus = o.status === 'served' ? 'preparing' : o.status;
      const { data, error } = await sb.from('orders').update({ items, total, status: newStatus, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
      if (error) return err(error.message, 500);
      return json({ order: orderToApi(data) });
    }

    // ============ PAYMENT (DEMO) ============
    if (path === 'payment/demo' && method === 'POST') {
      const { orderId } = await request.json();
      const { data: o, error: ge } = await sb.from('orders').select('*').eq('id', orderId).maybeSingle();
      if (ge) return err(ge.message, 500);
      if (!o) return err('Order not found', 404);
      const { data, error } = await sb.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', orderId).select('*').single();
      if (error) return err(error.message, 500);
      await sb.from('rest_tables').update({ status: 'available' }).eq('id', o.table_id);
      return json({ order: orderToApi(data) });
    }

    // ============ FEEDBACK ============
    if (path === 'feedback' && method === 'POST') {
      const body = await request.json();
      const row = {
        restaurant_id: body.restaurantId,
        table_id: body.tableId,
        order_id: body.orderId,
        rating: parseInt(body.rating) || null,
        comment: body.comment || '',
      };
      const { error } = await sb.from('feedback').insert(row);
      if (error) return err(error.message, 500);
      return json({ ok: true });
    }

    // ============ ANALYTICS (manager) ============
    if (path === 'analytics' && method === 'GET') {
      const url = new URL(request.url);
      const restaurantId = url.searchParams.get('restaurantId');
      const { data: all, error } = await sb.from('orders').select('*').eq('restaurant_id', restaurantId).neq('status', 'cancelled');
      if (error) return err(error.message, 500);
      const orders = (all || []);
      const today = new Date(); today.setHours(0,0,0,0);
      const todays = orders.filter(o => new Date(o.created_at) >= today);
      const todayRevenue = todays.reduce((s,o)=>s+parseFloat(o.total),0);
      const todayOrders = todays.length;
      const avgTicket = todayOrders ? todayRevenue / todayOrders : 0;
      const itemMap = {};
      orders.forEach(o => (o.items || []).forEach(i => {
        const k = i.name;
        itemMap[k] = itemMap[k] || { name: k, count: 0, revenue: 0 };
        itemMap[k].count += i.qty;
        itemMap[k].revenue += i.qty * parseFloat(i.price);
      }));
      const topItems = Object.values(itemMap).sort((a,b)=>b.revenue-a.revenue).slice(0,10);
      const byHourMap = {};
      for (let h = 0; h < 24; h++) byHourMap[h] = { hour: `${String(h).padStart(2,'0')}h`, orders: 0 };
      todays.forEach(o => { const h = new Date(o.created_at).getHours(); byHourMap[h].orders += 1; });
      const byHour = Object.values(byHourMap);
      const last7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i);
        const next = new Date(d); next.setDate(next.getDate()+1);
        const rev = orders.filter(o => new Date(o.created_at) >= d && new Date(o.created_at) < next).reduce((s,o)=>s+parseFloat(o.total),0);
        last7.push({ date: d.toLocaleDateString('en-US',{month:'short',day:'numeric'}), revenue: Math.round(rev*100)/100 });
      }
      return json({ todayRevenue, todayOrders, avgTicket, topItems, byHour, last7 });
    }

    // ============ CENTRAL STATS ============
    if (path === 'central/stats' && method === 'GET') {
      const { data: restaurants } = await sb.from('restaurants').select('*');
      const { data: orders } = await sb.from('orders').select('*').neq('status', 'cancelled');
      const totalRevenue = (orders || []).reduce((s,o)=>s+parseFloat(o.total),0);
      const planPrice = { Starter: 49, Pro: 99, Premium: 199, Enterprise: 499 };
      const mrr = (restaurants || []).reduce((s,r)=>s+(planPrice[r.subscription]||0),0);
      const byPlanMap = {};
      (restaurants || []).forEach(r => { byPlanMap[r.subscription] = (byPlanMap[r.subscription]||0)+1; });
      const byPlan = Object.entries(byPlanMap).map(([name,value])=>({ name, value }));
      const trend = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-i);
        const next = new Date(d); next.setDate(next.getDate()+1);
        const rev = (orders || []).filter(o => new Date(o.created_at) >= d && new Date(o.created_at) < next).reduce((s,o)=>s+parseFloat(o.total),0);
        trend.push({ date: d.toLocaleDateString('en-US',{month:'short',day:'numeric'}), revenue: Math.round(rev*100)/100 });
      }
      return json({ totalRestaurants: (restaurants || []).length, totalRevenue, totalOrders: (orders || []).length, mrr, byPlan, trend });
    }

    // ============ AI WAITER CHAT ============
    if (path === 'chat' && method === 'POST') {
      const body = await request.json();
      const { sessionId, restaurantId, tableId, language = 'en', message, menu = [], cart = [], stage = 'browsing' } = body;
      const { data: restaurant } = await sb.from('restaurants').select('name').eq('id', restaurantId).maybeSingle();
      const { data: session } = await sb.from('chat_sessions').select('*').eq('session_id', sessionId).maybeSingle();
      const history = (session?.history || []);
      const menuStr = menu.map(m => `- ${m.id} | ${m.name} ($${m.price}) [${m.category}]${m.description ? ' — ' + m.description : ''}`).join('\n');
      const cartStr = cart.length ? cart.map(c => `${c.qty}x ${c.name}`).join(', ') : '(empty)';
      const sys = `You are a warm, witty, professional AI waiter for "${restaurant?.name}". Always reply in ${language === 'es' ? 'Spanish' : 'English'} (mirror the customer's language if they switch). Engage naturally, suggest pairings, mention specials, ask about allergies and spice preferences. Keep replies concise (2-4 sentences max). Sound human, not robotic.

CURRENT MENU (only recommend these; use the exact id when adding to cart):
${menuStr || '(menu loading)'}

CURRENT CART: ${cartStr}
ORDER STAGE: ${stage}

When the customer wants to add items, respond conversationally AND append a JSON code block with actions. Format strictly:
\`\`\`json
{"add_items":[{"id":"<menu-item-id>","name":"<exact name>","quantity":1}], "set_allergy":"<text or empty>", "set_spicy":"<mild|medium|hot|extra-hot|empty>"}
\`\`\`
Only include keys that change. Do NOT mention the JSON to the customer.`;
      const messages = [
        { role: 'system', content: sys },
        ...history.slice(-12),
        { role: 'user', content: message },
      ];
      let raw;
      try {
        raw = await llmChat({ messages, model: 'gemini/gemini-2.5-flash', temperature: 0.8 });
      } catch (e) {
        console.error('LLM err', e);
        return json({ reply: language === 'es' ? 'Disculpe, tuve un problema. ¿Podría repetir?' : 'Sorry, I had a hiccup. Could you repeat that?', actions: null });
      }
      const { reply, actions } = stripJson(raw);
      const newHistory = [...history, { role: 'user', content: message }, { role: 'assistant', content: raw }].slice(-30);
      await sb.from('chat_sessions').upsert({ session_id: sessionId, restaurant_id: restaurantId, table_id: tableId, history: newHistory, updated_at: new Date().toISOString() });
      return json({ reply: reply || raw, actions });
    }

    // ============ HEALTH ============
    if (path === '' || path === 'health') {
      // Quick check: can we hit Supabase?
      const { error } = await sb.from('users').select('user_id').limit(1);
      return json({ status: 'ok', service: 'netrik-shop', db: error ? `error: ${error.message}` : 'supabase-ok', time: new Date().toISOString() });
    }

    return err(`Not found: /${path}`, 404);
  } catch (e) {
    console.error('API error', e);
    return err(e.message || 'Server error', 500);
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
