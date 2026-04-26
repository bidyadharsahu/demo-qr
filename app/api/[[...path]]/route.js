import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/mongodb';
import { llmChat } from '@/lib/llm';

const json = (data, status = 200) => NextResponse.json(data, { status });
const err = (message, status = 400) => NextResponse.json({ error: message }, { status });

const CENTRAL_USER = { userId: 'hello', password: '123456' };

const slug = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 18) || 'rest';
const rand = (n = 6) => Math.random().toString(36).slice(2, 2 + n);
const randPwd = () => Math.floor(100000 + Math.random() * 900000).toString();

async function ensureCentral(db) {
  const u = await db.collection('users').findOne({ userId: CENTRAL_USER.userId, type: 'central' });
  if (!u) {
    await db.collection('users').insertOne({ id: uuidv4(), type: 'central', ...CENTRAL_USER, createdAt: new Date().toISOString() });
  }
}

function stripJson(text) {
  // Extract a json block if present
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) {
    try { return { actions: JSON.parse(m[1]), reply: text.replace(m[0], '').trim() }; } catch {}
  }
  return { actions: null, reply: text };
}

async function handler(request, { params }) {
  const path = (params?.path || []).join('/');
  const method = request.method;
  const db = await getDb();
  await ensureCentral(db);

  try {
    // ---------- AUTH ----------
    if (path === 'auth/login' && method === 'POST') {
      const { type, userId, password } = await request.json();
      if (!type || !userId || !password) return err('Missing fields');
      if (type === 'central') {
        const u = await db.collection('users').findOne({ type: 'central', userId, password });
        if (!u) return err('Invalid credentials', 401);
        return json({ user: { id: u.id, type: 'central', userId: u.userId } });
      }
      // manager / chef stored on restaurants
      const field = type === 'manager' ? 'managerCreds' : type === 'chef' ? 'chefCreds' : null;
      if (!field) return err('Invalid type');
      const r = await db.collection('restaurants').findOne({ [`${field}.userId`]: userId, [`${field}.password`]: password });
      if (!r) return err('Invalid credentials', 401);
      return json({ user: { type, userId, restaurantId: r.id, restaurantName: r.name } });
    }

    // ---------- RESTAURANTS ----------
    if (path === 'restaurants' && method === 'GET') {
      const list = await db.collection('restaurants').find({}).sort({ createdAt: -1 }).toArray();
      return json({ restaurants: list.map(({ _id, ...r }) => r) });
    }
    if (path === 'restaurants' && method === 'POST') {
      const body = await request.json();
      if (!body.name || !body.ownerName || !body.contact) return err('Missing required fields');
      const id = uuidv4();
      const s = slug(body.name) + '_' + rand(4);
      const restaurant = {
        id,
        name: body.name,
        ownerName: body.ownerName,
        contact: body.contact,
        address: body.address || '',
        domain: body.domain || '',
        subscription: body.subscription || 'Pro',
        managerCreds: { userId: 'manager_' + s, password: randPwd() },
        chefCreds: { userId: 'chef_' + s, password: randPwd() },
        createdAt: new Date().toISOString(),
      };
      await db.collection('restaurants').insertOne(restaurant);
      return json({ restaurant });
    }
    const restMatch = path.match(/^restaurants\/([^\/]+)$/);
    if (restMatch) {
      const id = restMatch[1];
      if (method === 'GET') {
        const r = await db.collection('restaurants').findOne({ id });
        if (!r) return err('Not found', 404);
        const { _id, ...rest } = r;
        return json({ restaurant: rest });
      }
      if (method === 'PUT') {
        const body = await request.json();
        await db.collection('restaurants').updateOne({ id }, { $set: { name: body.name, ownerName: body.ownerName, contact: body.contact, address: body.address, domain: body.domain, subscription: body.subscription, updatedAt: new Date().toISOString() } });
        const r = await db.collection('restaurants').findOne({ id });
        const { _id, ...rest } = r;
        return json({ restaurant: rest });
      }
      if (method === 'DELETE') {
        await db.collection('restaurants').deleteOne({ id });
        await db.collection('menu').deleteMany({ restaurantId: id });
        await db.collection('tables').deleteMany({ restaurantId: id });
        await db.collection('orders').deleteMany({ restaurantId: id });
        return json({ ok: true });
      }
    }

    // ---------- MENU ----------
    if (path === 'menu' && method === 'GET') {
      const url = new URL(request.url);
      const restaurantId = url.searchParams.get('restaurantId');
      const availableOnly = url.searchParams.get('availableOnly');
      const q = { restaurantId };
      if (availableOnly) q.available = true;
      const list = await db.collection('menu').find(q).sort({ category: 1, name: 1 }).toArray();
      return json({ menu: list.map(({ _id, ...m }) => m) });
    }
    if (path === 'menu' && method === 'POST') {
      const body = await request.json();
      const item = { id: uuidv4(), restaurantId: body.restaurantId, name: body.name, description: body.description || '', price: parseFloat(body.price) || 0, category: body.category || 'Mains', image: body.image || '', available: body.available !== false, nameEs: body.nameEs || '', createdAt: new Date().toISOString() };
      await db.collection('menu').insertOne(item);
      return json({ item });
    }
    const menuMatch = path.match(/^menu\/([^\/]+)$/);
    if (menuMatch) {
      const id = menuMatch[1];
      if (method === 'PUT') {
        const body = await request.json();
        const $set = {};
        ['name', 'description', 'price', 'category', 'image', 'available', 'nameEs'].forEach(k => { if (body[k] !== undefined) $set[k] = body[k]; });
        if ($set.price !== undefined) $set.price = parseFloat($set.price);
        await db.collection('menu').updateOne({ id }, { $set });
        return json({ ok: true });
      }
      if (method === 'DELETE') {
        await db.collection('menu').deleteOne({ id });
        return json({ ok: true });
      }
    }

    // ---------- TABLES ----------
    if (path === 'tables' && method === 'GET') {
      const url = new URL(request.url);
      const restaurantId = url.searchParams.get('restaurantId');
      const list = await db.collection('tables').find({ restaurantId }).sort({ number: 1 }).toArray();
      return json({ tables: list.map(({ _id, ...t }) => t) });
    }
    if (path === 'tables' && method === 'POST') {
      const body = await request.json();
      const id = uuidv4();
      const t = { id, restaurantId: body.restaurantId, number: String(body.number), seats: body.seats || 2, status: 'available', createdAt: new Date().toISOString() };
      await db.collection('tables').insertOne(t);
      return json({ table: t });
    }
    const tblMatch = path.match(/^tables\/([^\/]+)$/);
    if (tblMatch) {
      const id = tblMatch[1];
      if (method === 'GET') {
        const t = await db.collection('tables').findOne({ id });
        if (!t) return err('Not found', 404);
        const { _id, ...rest } = t;
        return json({ table: rest });
      }
      if (method === 'PUT') {
        const body = await request.json();
        const $set = {};
        ['number', 'seats', 'status'].forEach(k => { if (body[k] !== undefined) $set[k] = body[k]; });
        await db.collection('tables').updateOne({ id }, { $set });
        return json({ ok: true });
      }
      if (method === 'DELETE') {
        await db.collection('tables').deleteOne({ id });
        return json({ ok: true });
      }
    }

    // ---------- ORDERS ----------
    if (path === 'orders' && method === 'GET') {
      const url = new URL(request.url);
      const restaurantId = url.searchParams.get('restaurantId');
      const list = await db.collection('orders').find({ restaurantId }).sort({ createdAt: -1 }).limit(200).toArray();
      return json({ orders: list.map(({ _id, ...o }) => o) });
    }
    if (path === 'orders' && method === 'POST') {
      const body = await request.json();
      const table = await db.collection('tables').findOne({ id: body.tableId });
      if (!table) return err('Invalid table');
      const items = (body.items || []).map(i => ({ id: i.id, name: i.name, nameEs: i.nameEs || '', price: parseFloat(i.price), qty: parseInt(i.qty) || 1, notes: i.notes || '' }));
      const total = items.reduce((s, i) => s + i.price * i.qty, 0);
      const order = {
        id: uuidv4(),
        restaurantId: body.restaurantId,
        tableId: body.tableId,
        tableNumber: table.number,
        items,
        total,
        status: 'pending',
        allergy: body.allergy || '',
        spicyLevel: body.spicyLevel || '',
        createdAt: new Date().toISOString(),
      };
      await db.collection('orders').insertOne(order);
      await db.collection('tables').updateOne({ id: body.tableId }, { $set: { status: 'occupied' } });
      return json({ order });
    }
    const orderMatch = path.match(/^orders\/([^\/]+)$/);
    if (orderMatch) {
      const id = orderMatch[1];
      if (method === 'GET') {
        const o = await db.collection('orders').findOne({ id });
        if (!o) return err('Not found', 404);
        const { _id, ...rest } = o;
        return json({ order: rest });
      }
      if (method === 'PUT') {
        const body = await request.json();
        const $set = { updatedAt: new Date().toISOString() };
        if (body.status) $set.status = body.status;
        await db.collection('orders').updateOne({ id }, { $set });
        if (body.status === 'paid') {
          const o = await db.collection('orders').findOne({ id });
          if (o) await db.collection('tables').updateOne({ id: o.tableId }, { $set: { status: 'available' } });
        }
        return json({ ok: true });
      }
    }
    const addonsMatch = path.match(/^orders\/([^\/]+)\/addons$/);
    if (addonsMatch && method === 'POST') {
      const id = addonsMatch[1];
      const body = await request.json();
      const o = await db.collection('orders').findOne({ id });
      if (!o) return err('Not found', 404);
      const items = [...o.items];
      for (const it of (body.items || [])) {
        const ex = items.find(x => x.id === it.id);
        if (ex) ex.qty += parseInt(it.qty) || 1;
        else items.push({ id: it.id, name: it.name, nameEs: it.nameEs || '', price: parseFloat(it.price), qty: parseInt(it.qty) || 1, notes: it.notes || '' });
      }
      const total = items.reduce((s, i) => s + i.price * i.qty, 0);
      await db.collection('orders').updateOne({ id }, { $set: { items, total, status: o.status === 'served' ? 'preparing' : o.status, updatedAt: new Date().toISOString() } });
      const updated = await db.collection('orders').findOne({ id });
      const { _id, ...rest } = updated;
      return json({ order: rest });
    }

    // ---------- PAYMENT (DEMO) ----------
    if (path === 'payment/demo' && method === 'POST') {
      const { orderId } = await request.json();
      const o = await db.collection('orders').findOne({ id: orderId });
      if (!o) return err('Order not found', 404);
      await db.collection('orders').updateOne({ id: orderId }, { $set: { status: 'paid', paidAt: new Date().toISOString() } });
      await db.collection('tables').updateOne({ id: o.tableId }, { $set: { status: 'available' } });
      const updated = await db.collection('orders').findOne({ id: orderId });
      const { _id, ...rest } = updated;
      return json({ order: rest });
    }

    // ---------- FEEDBACK ----------
    if (path === 'feedback' && method === 'POST') {
      const body = await request.json();
      const fb = { id: uuidv4(), ...body, createdAt: new Date().toISOString() };
      await db.collection('feedback').insertOne(fb);
      return json({ ok: true });
    }

    // ---------- ANALYTICS (manager) ----------
    if (path === 'analytics' && method === 'GET') {
      const url = new URL(request.url);
      const restaurantId = url.searchParams.get('restaurantId');
      const all = await db.collection('orders').find({ restaurantId, status: { $ne: 'cancelled' } }).toArray();
      const today = new Date(); today.setHours(0,0,0,0);
      const todays = all.filter(o => new Date(o.createdAt) >= today);
      const todayRevenue = todays.reduce((s,o)=>s+o.total,0);
      const todayOrders = todays.length;
      const avgTicket = todayOrders ? todayRevenue / todayOrders : 0;
      // top items
      const itemMap = {};
      all.forEach(o => o.items.forEach(i => { const k = i.name; itemMap[k] = itemMap[k] || { name: k, count: 0, revenue: 0 }; itemMap[k].count += i.qty; itemMap[k].revenue += i.qty * i.price; }));
      const topItems = Object.values(itemMap).sort((a,b)=>b.revenue-a.revenue).slice(0,10);
      // by hour today
      const byHourMap = {};
      for (let h = 0; h < 24; h++) byHourMap[h] = { hour: `${String(h).padStart(2,'0')}h`, orders: 0 };
      todays.forEach(o => { const h = new Date(o.createdAt).getHours(); byHourMap[h].orders += 1; });
      const byHour = Object.values(byHourMap);
      // last 7 days
      const last7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i);
        const next = new Date(d); next.setDate(next.getDate()+1);
        const rev = all.filter(o => new Date(o.createdAt) >= d && new Date(o.createdAt) < next).reduce((s,o)=>s+o.total,0);
        last7.push({ date: d.toLocaleDateString('en-US',{month:'short',day:'numeric'}), revenue: Math.round(rev*100)/100 });
      }
      return json({ todayRevenue, todayOrders, avgTicket, topItems, byHour, last7 });
    }

    // ---------- CENTRAL STATS ----------
    if (path === 'central/stats' && method === 'GET') {
      const restaurants = await db.collection('restaurants').find({}).toArray();
      const orders = await db.collection('orders').find({ status: { $ne: 'cancelled' } }).toArray();
      const totalRevenue = orders.reduce((s,o)=>s+o.total,0);
      const planPrice = { Starter: 49, Pro: 99, Premium: 199, Enterprise: 499 };
      const mrr = restaurants.reduce((s,r)=>s+(planPrice[r.subscription]||0),0);
      const byPlanMap = {};
      restaurants.forEach(r => { byPlanMap[r.subscription] = (byPlanMap[r.subscription]||0)+1; });
      const byPlan = Object.entries(byPlanMap).map(([name,value])=>({ name, value }));
      const trend = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-i);
        const next = new Date(d); next.setDate(next.getDate()+1);
        const rev = orders.filter(o => new Date(o.createdAt) >= d && new Date(o.createdAt) < next).reduce((s,o)=>s+o.total,0);
        trend.push({ date: d.toLocaleDateString('en-US',{month:'short',day:'numeric'}), revenue: Math.round(rev*100)/100 });
      }
      return json({ totalRestaurants: restaurants.length, totalRevenue, totalOrders: orders.length, mrr, byPlan, trend });
    }

    // ---------- CHAT (AI Waiter) ----------
    if (path === 'chat' && method === 'POST') {
      const body = await request.json();
      const { sessionId, restaurantId, tableId, language = 'en', message, menu = [], cart = [], stage = 'browsing' } = body;
      const restaurant = await db.collection('restaurants').findOne({ id: restaurantId });
      const session = await db.collection('chat_sessions').findOne({ sessionId }) || { sessionId, restaurantId, tableId, history: [] };
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
        ...(session.history || []).slice(-12),
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
      const newHistory = [...(session.history || []), { role: 'user', content: message }, { role: 'assistant', content: raw }].slice(-30);
      await db.collection('chat_sessions').updateOne({ sessionId }, { $set: { sessionId, restaurantId, tableId, history: newHistory, updatedAt: new Date().toISOString() } }, { upsert: true });
      return json({ reply: reply || raw, actions });
    }

    // ---------- HEALTH ----------
    if (path === '' || path === 'health') {
      return json({ status: 'ok', service: 'netrik-shop', time: new Date().toISOString() });
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
