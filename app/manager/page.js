'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LogOut, BarChart3, ClipboardList, UtensilsCrossed, Table2, ChefHat, Plus, Trash2, Pencil, Printer, QrCode, DollarSign, TrendingUp, Download, Clock, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { NetrikLogo } from '@/components/netrik-logo';

const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Drinks', 'Specials'];
const FOOD_IMG = 'https://images.pexels.com/photos/35420084/pexels-photo-35420084.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';

export default function ManagerDashboard() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [tab, setTab] = useState('analytics');

  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({ todayRevenue: 0, todayOrders: 0, avgTicket: 0, topItems: [], byHour: [], last7: [] });

  // dialogs
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', category: 'Mains', image: FOOD_IMG, available: true });
  const [tableOpen, setTableOpen] = useState(false);
  const [tableForm, setTableForm] = useState({ number: '', seats: 2 });
  const [tableQr, setTableQr] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('netrik_user') || 'null');
    if (!u || u.type !== 'manager') { router.push('/login'); return; }
    setMe(u);
    loadAll(u);
    const id = setInterval(() => loadAll(u, true), 5000);
    return () => clearInterval(id);
  }, []);

  const loadAll = async (u, silent = false) => {
    if (!u) return;
    const headers = { 'X-User-Id': u.userId, 'X-Restaurant-Id': u.restaurantId };
    const [r, m, t, o, a] = await Promise.all([
      fetch(`/api/restaurants/${u.restaurantId}`).then(r => r.json()),
      fetch(`/api/menu?restaurantId=${u.restaurantId}`).then(r => r.json()),
      fetch(`/api/tables?restaurantId=${u.restaurantId}`).then(r => r.json()),
      fetch(`/api/orders?restaurantId=${u.restaurantId}`).then(r => r.json()),
      fetch(`/api/analytics?restaurantId=${u.restaurantId}`).then(r => r.json()),
    ]);
    setRestaurant(r.restaurant); setMenu(m.menu || []); setTables(t.tables || []); setOrders(o.orders || []); setAnalytics(a || {});
  };

  const saveItem = async () => {
    if (!itemForm.name || !itemForm.price) return toast.error('Name & price required');
    const body = { ...itemForm, price: parseFloat(itemForm.price), restaurantId: me.restaurantId };
    const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
    const method = editingItem ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) return toast.error('Failed');
    toast.success(editingItem ? 'Item updated' : 'Item added');
    setMenuOpen(false); setEditingItem(null); setItemForm({ name: '', description: '', price: '', category: 'Mains', image: FOOD_IMG, available: true });
    loadAll(me);
  };

  const toggleAvail = async (item) => {
    await fetch(`/api/menu/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, available: !item.available }) });
    loadAll(me);
  };

  const removeItem = async (item) => {
    if (!confirm(`Delete ${item.name}?`)) return;
    await fetch(`/api/menu/${item.id}`, { method: 'DELETE' });
    loadAll(me);
  };

  const addTable = async () => {
    if (!tableForm.number) return toast.error('Enter table number');
    const res = await fetch('/api/tables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...tableForm, restaurantId: me.restaurantId }) });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || 'Failed');
    toast.success('Table added');
    setTableOpen(false); setTableForm({ number: '', seats: 2 });
    loadAll(me);
  };

  const removeTable = async (t) => {
    if (!confirm(`Delete table ${t.number}?`)) return;
    await fetch(`/api/tables/${t.id}`, { method: 'DELETE' });
    loadAll(me);
  };

  const setTableStatus = async (t, status) => {
    await fetch(`/api/tables/${t.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    loadAll(me);
  };

  const setOrderStatus = async (o, status) => {
    await fetch(`/api/orders/${o.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    loadAll(me);
  };

  const downloadCSV = () => {
    const rows = [['Date','Order #','Table','Items','Total','Status']];
    orders.forEach(o => {
      rows.push([new Date(o.createdAt).toLocaleString(), o.id.slice(0,8), o.tableNumber, o.items.map(i=>`${i.qty}x ${i.name}`).join('; '), o.total.toFixed(2), o.status]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const tableUrl = (t) => `${baseUrl}/order/${t.id}`;

  const printQR = (t) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Table ${t.number} QR</title><style>body{font-family:system-ui;text-align:center;padding:40px;}h1{font-size:32px;margin:0}</style></head><body>
      <h1>${restaurant?.name || ''}</h1>
      <p style="color:#888">by Netrik Shop</p>
      <h2 style="margin:24px 0 6px">Table ${t.number}</h2>
      <p style="color:#444">Scan to order</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(tableUrl(t))}" style="margin:16px auto"/>
      <p style="color:#888;font-size:12px;">${tableUrl(t)}</p>
      <script>window.onload=()=>window.print()</script>
    </body></html>`);
  };

  if (!me || !restaurant) return <div className="min-h-screen grid place-items-center bg-[#0b0b0d] text-white">Loading…</div>;

  const pendingOrders = orders.filter(o => ['pending','preparing'].includes(o.status));
  const liveOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <header className="border-b border-white/10 sticky top-0 bg-black/60 backdrop-blur z-30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NetrikLogo className="h-10 w-10"/>
            <div>
              <div className="font-bold">{restaurant.name}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">by Netrik Shop · Manager</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-400/20 text-green-300 border-green-400/30"><span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"/> Live</Badge>
            <Button variant="ghost" className="text-white/70" onClick={() => { localStorage.removeItem('netrik_user'); router.push('/login'); }}><LogOut className="h-4 w-4 mr-2"/>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 grid grid-cols-5 max-w-3xl">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black"><BarChart3 className="h-4 w-4 mr-1.5"/>Analytics</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black"><ClipboardList className="h-4 w-4 mr-1.5"/>Orders</TabsTrigger>
            <TabsTrigger value="menu" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black"><UtensilsCrossed className="h-4 w-4 mr-1.5"/>Menu</TabsTrigger>
            <TabsTrigger value="tables" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black"><Table2 className="h-4 w-4 mr-1.5"/>Tables</TabsTrigger>
            <TabsTrigger value="kitchen" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black"><ChefHat className="h-4 w-4 mr-1.5"/>Kitchen</TabsTrigger>
          </TabsList>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-5">
              {[
                { i: <DollarSign/>, t: "Today's revenue", v: `$${analytics.todayRevenue?.toFixed(2) || '0.00'}` },
                { i: <ClipboardList/>, t: "Today's orders", v: analytics.todayOrders || 0 },
                { i: <TrendingUp/>, t: 'Avg ticket', v: `$${analytics.avgTicket?.toFixed(2) || '0.00'}` },
                { i: <Table2/>, t: 'Active tables', v: tables.filter(t => t.status === 'occupied').length + '/' + tables.length },
              ].map((c) => (
                <Card key={c.t} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 rounded-xl bg-amber-400/20 text-amber-300 grid place-items-center mb-3">{c.i}</div>
                    <div className="text-3xl font-black">{c.v}</div>
                    <div className="text-xs uppercase tracking-wider text-white/50 mt-1">{c.t}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-5">
              <Card className="bg-white/5 border-white/10 lg:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold">Revenue · last 7 days</div>
                    <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white" size="sm" onClick={downloadCSV}><Download className="h-4 w-4 mr-2"/>CSV</Button>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={analytics.last7 || []}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)"/>
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11}/>
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11}/>
                      <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}/>
                      <Line type="monotone" dataKey="revenue" stroke="#fbbf24" strokeWidth={2} dot={false}/>
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="font-semibold mb-4">Top items</div>
                  <div className="space-y-3">
                    {(analytics.topItems || []).slice(0,5).map((i,idx) => (
                      <div key={i.name} className="flex items-center gap-3">
                        <div className="text-xs font-mono text-amber-300 w-5">#{idx+1}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{i.name}</div>
                          <div className="text-xs text-white/40">{i.count} orders</div>
                        </div>
                        <div className="text-sm font-semibold text-amber-300">${i.revenue.toFixed(2)}</div>
                      </div>
                    ))}
                    {(!analytics.topItems || analytics.topItems.length === 0) && <div className="text-sm text-white/40">No data yet</div>}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="font-semibold mb-4">Orders by hour (today)</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.byHour || []}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)"/>
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={11}/>
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11}/>
                    <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}/>
                    <Bar dataKey="orders" fill="#fb7185" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">{liveOrders.length} live orders</div>
              <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white" size="sm" onClick={downloadCSV}><Download className="h-4 w-4 mr-2"/>Download CSV</Button>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              {orders.length === 0 && (<Card className="bg-white/5 border-white/10"><CardContent className="p-10 text-center text-white/40">No orders yet — customers will scan a table QR to place orders.</CardContent></Card>)}
              {orders.map((o) => (
                <Card key={o.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white/50">Order <span className="font-mono">#{o.id.slice(0,8)}</span></div>
                        <div className="font-semibold text-lg">Table {o.tableNumber}</div>
                      </div>
                      <Badge className={`${o.status === 'paid' ? 'bg-green-400/20 text-green-300 border-green-400/30' : o.status === 'ready' ? 'bg-blue-400/20 text-blue-300 border-blue-400/30' : 'bg-amber-400/20 text-amber-300 border-amber-400/30'}`}>{o.status}</Badge>
                    </div>
                    <div className="mt-3 space-y-1 text-sm">
                      {o.items.map((i,idx) => (
                        <div key={idx} className="flex justify-between"><span>{i.qty}× {i.name}{i.notes ? ` (${i.notes})` : ''}</span><span className="text-white/60">${(i.price*i.qty).toFixed(2)}</span></div>
                      ))}
                    </div>
                    {(o.allergy || o.spicyLevel) && (
                      <div className="mt-2 text-xs text-amber-300/80">{o.allergy ? `Allergy: ${o.allergy}` : ''} {o.spicyLevel ? ` · Spice: ${o.spicyLevel}` : ''}</div>
                    )}
                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                      <div className="font-bold text-lg text-amber-300">${o.total.toFixed(2)}</div>
                      <div className="flex gap-1">
                        {o.status === 'pending' && <Button size="sm" onClick={() => setOrderStatus(o, 'preparing')} className="bg-amber-400 text-black hover:bg-amber-300">Accept</Button>}
                        {o.status === 'preparing' && <Button size="sm" onClick={() => setOrderStatus(o, 'ready')} className="bg-blue-500 hover:bg-blue-400">Ready</Button>}
                        {o.status === 'ready' && <Button size="sm" onClick={() => setOrderStatus(o, 'served')} className="bg-green-500 hover:bg-green-400">Served</Button>}
                      </div>
                    </div>
                    <div className="text-xs text-white/40 mt-2">{new Date(o.createdAt).toLocaleTimeString()}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Menu */}
          <TabsContent value="menu" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">{menu.length} items · {menu.filter(m=>m.available).length} available</div>
              <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
                <DialogTrigger asChild><Button onClick={()=>{setEditingItem(null); setItemForm({ name:'', description:'', price:'', category:'Mains', image:FOOD_IMG, available:true })}} className="bg-amber-400 text-black hover:bg-amber-300"><Plus className="h-4 w-4 mr-1"/>Add item</Button></DialogTrigger>
                <DialogContent className="bg-[#111] border-white/10 text-white max-w-lg">
                  <DialogHeader><DialogTitle>{editingItem ? 'Edit item' : 'New menu item'}</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Name *</Label><Input value={itemForm.name} onChange={e=>setItemForm({...itemForm,name:e.target.value})} className="bg-white/5 border-white/10"/></div>
                    <div><Label>Description</Label><Textarea value={itemForm.description} onChange={e=>setItemForm({...itemForm,description:e.target.value})} className="bg-white/5 border-white/10"/></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Price ($) *</Label><Input type="number" step="0.01" value={itemForm.price} onChange={e=>setItemForm({...itemForm,price:e.target.value})} className="bg-white/5 border-white/10"/></div>
                      <div><Label>Category</Label>
                        <Select value={itemForm.category} onValueChange={v=>setItemForm({...itemForm,category:v})}>
                          <SelectTrigger className="bg-white/5 border-white/10"><SelectValue/></SelectTrigger>
                          <SelectContent className="bg-[#111] text-white border-white/10">{CATEGORIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div><Label>Image URL</Label><Input value={itemForm.image} onChange={e=>setItemForm({...itemForm,image:e.target.value})} className="bg-white/5 border-white/10"/></div>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 p-3"><div><div className="text-sm font-medium">Available</div><div className="text-xs text-white/50">Show on customer menu</div></div><Switch checked={itemForm.available} onCheckedChange={v=>setItemForm({...itemForm,available:v})}/></div>
                  </div>
                  <DialogFooter><Button onClick={saveItem} className="bg-amber-400 text-black hover:bg-amber-300">{editingItem ? 'Save' : 'Add'}</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menu.length === 0 && <Card className="md:col-span-2 lg:col-span-3 bg-white/5 border-white/10"><CardContent className="p-10 text-center text-white/40">No items yet — add your first dish.</CardContent></Card>}
              {menu.map(item => (
                <Card key={item.id} className="bg-white/5 border-white/10 overflow-hidden">
                  <div className="h-36 overflow-hidden"><img src={item.image || FOOD_IMG} alt={item.name} className="w-full h-full object-cover"/></div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-xs text-white/50">{item.category}</div>
                      </div>
                      <div className="font-bold text-amber-300">${item.price.toFixed(2)}</div>
                    </div>
                    {item.description && <div className="text-xs text-white/60 mt-2 line-clamp-2">{item.description}</div>}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2"><Switch checked={item.available} onCheckedChange={()=>toggleAvail(item)}/><span className="text-xs text-white/60">{item.available ? 'Available' : 'Out'}</span></div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={()=>{setEditingItem(item); setItemForm({ name:item.name, description:item.description||'', price:String(item.price), category:item.category, image:item.image||FOOD_IMG, available:item.available }); setMenuOpen(true);}}><Pencil className="h-4 w-4"/></Button>
                        <Button size="sm" variant="ghost" className="text-rose-400" onClick={()=>removeItem(item)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tables */}
          <TabsContent value="tables" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">{tables.length} tables</div>
              <Dialog open={tableOpen} onOpenChange={setTableOpen}>
                <DialogTrigger asChild><Button className="bg-amber-400 text-black hover:bg-amber-300"><Plus className="h-4 w-4 mr-1"/>Add table</Button></DialogTrigger>
                <DialogContent className="bg-[#111] border-white/10 text-white">
                  <DialogHeader><DialogTitle>New table</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Table number *</Label><Input value={tableForm.number} onChange={e=>setTableForm({...tableForm,number:e.target.value})} placeholder="e.g. 5" className="bg-white/5 border-white/10"/></div>
                    <div><Label>Seats</Label><Input type="number" value={tableForm.seats} onChange={e=>setTableForm({...tableForm,seats:parseInt(e.target.value)||2})} className="bg-white/5 border-white/10"/></div>
                  </div>
                  <DialogFooter><Button onClick={addTable} className="bg-amber-400 text-black hover:bg-amber-300">Add & generate QR</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tables.length === 0 && <Card className="col-span-full bg-white/5 border-white/10"><CardContent className="p-10 text-center text-white/40">No tables yet — add tables to generate QR codes.</CardContent></Card>}
              {tables.map(t => (
                <Card key={t.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase text-white/50">Table</div>
                        <div className="text-3xl font-black">{t.number}</div>
                        <div className="text-xs text-white/50">{t.seats} seats</div>
                      </div>
                      <Badge className={t.status === 'available' ? 'bg-green-400/20 text-green-300 border-green-400/30' : t.status === 'occupied' ? 'bg-rose-400/20 text-rose-300 border-rose-400/30' : 'bg-amber-400/20 text-amber-300 border-amber-400/30'}>{t.status}</Badge>
                    </div>
                    <button onClick={()=>setTableQr(t)} className="mt-3 w-full rounded-lg bg-white p-2"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(tableUrl(t))}`} alt="qr" className="w-full"/></button>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white" onClick={()=>printQR(t)}><Printer className="h-3.5 w-3.5 mr-1"/>Print</Button>
                      <Button size="sm" variant="ghost" className="text-rose-400" onClick={()=>removeTable(t)}><Trash2 className="h-3.5 w-3.5 mr-1"/>Delete</Button>
                    </div>
                    <Select value={t.status} onValueChange={v=>setTableStatus(t,v)}>
                      <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-xs h-8"><SelectValue/></SelectTrigger>
                      <SelectContent className="bg-[#111] text-white border-white/10">
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Dialog open={!!tableQr} onOpenChange={v=>!v && setTableQr(null)}>
              <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
                <DialogHeader><DialogTitle>Table {tableQr?.number} · QR</DialogTitle></DialogHeader>
                {tableQr && (
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-xl inline-block"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(tableUrl(tableQr))}`}/></div>
                    <div className="text-xs text-white/50 mt-3 break-all">{tableUrl(tableQr)}</div>
                    <Button className="mt-4 bg-amber-400 text-black hover:bg-amber-300" onClick={()=>printQR(tableQr)}><Printer className="h-4 w-4 mr-2"/>Print</Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Kitchen */}
          <TabsContent value="kitchen" className="space-y-4">
            <div className="text-sm text-white/60">{pendingOrders.length} active tickets · bilingual EN/ES</div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingOrders.length === 0 && <Card className="col-span-full bg-white/5 border-white/10"><CardContent className="p-10 text-center text-white/40">No tickets in the kitchen.</CardContent></Card>}
              {pendingOrders.map(o => (
                <Card key={o.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-white/50">Ticket #{o.id.slice(0,6).toUpperCase()}</div>
                        <div className="text-2xl font-black">Table {o.tableNumber} · Mesa {o.tableNumber}</div>
                      </div>
                      <Badge className={o.status === 'pending' ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' : 'bg-blue-400/20 text-blue-300 border-blue-400/30'}>{o.status}</Badge>
                    </div>
                    <div className="mt-3 space-y-2">
                      {o.items.map((i,idx) => (
                        <div key={idx} className="rounded-lg bg-black/40 border border-white/5 p-2">
                          <div className="font-semibold">{i.qty}× {i.name}</div>
                          {i.nameEs && <div className="text-xs text-amber-300/80">{i.qty}× {i.nameEs}</div>}
                          {i.notes && <div className="text-xs text-white/50 mt-1">Note: {i.notes}</div>}
                        </div>
                      ))}
                    </div>
                    {(o.allergy || o.spicyLevel) && (
                      <div className="mt-3 rounded-lg bg-rose-400/10 border border-rose-400/30 p-2 text-xs">
                        {o.allergy && <div><span className="font-semibold text-rose-300">Allergy / Alergia:</span> {o.allergy}</div>}
                        {o.spicyLevel && <div><span className="font-semibold text-rose-300">Spice / Picante:</span> {o.spicyLevel}</div>}
                      </div>
                    )}
                    <div className="mt-3 flex justify-between">
                      <div className="text-xs text-white/40 inline-flex items-center"><Clock className="h-3 w-3 mr-1"/>{new Date(o.createdAt).toLocaleTimeString()}</div>
                      {o.status === 'pending' && <Button size="sm" onClick={()=>setOrderStatus(o,'preparing')} className="bg-amber-400 text-black hover:bg-amber-300">Start / Iniciar</Button>}
                      {o.status === 'preparing' && <Button size="sm" onClick={()=>setOrderStatus(o,'ready')} className="bg-green-500 hover:bg-green-400"><CheckCircle2 className="h-3.5 w-3.5 mr-1"/>Ready / Listo</Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
