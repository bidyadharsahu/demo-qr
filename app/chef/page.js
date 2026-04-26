'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, ChefHat, Clock, CheckCircle2, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function ChefDashboard() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('netrik_user') || 'null');
    if (!u || u.type !== 'chef') { router.push('/login'); return; }
    setMe(u);
    load(u);
    const id = setInterval(() => load(u), 4000);
    return () => clearInterval(id);
  }, []);

  const load = async (u) => {
    const [r, o] = await Promise.all([
      fetch(`/api/restaurants/${u.restaurantId}`).then(r=>r.json()),
      fetch(`/api/orders?restaurantId=${u.restaurantId}`).then(r=>r.json()),
    ]);
    setRestaurant(r.restaurant);
    setOrders((o.orders || []).filter(x => ['pending','preparing','ready'].includes(x.status)));
  };

  const advance = async (o) => {
    const next = o.status === 'pending' ? 'preparing' : o.status === 'preparing' ? 'ready' : 'served';
    await fetch(`/api/orders/${o.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) });
    load(me);
  };

  const printTicket = (o) => {
    const w = window.open('', '_blank');
    if (!w) return;
    const lines = o.items.map(i => `<tr><td>${i.qty}×</td><td><b>${i.name}</b><br/><span style='color:#888;font-size:11px'>${i.nameEs||''}</span>${i.notes?`<div style='font-size:11px'>Note: ${i.notes}</div>`:''}</td></tr>`).join('');
    w.document.write(`<html><head><title>Ticket #${o.id.slice(0,6)}</title><style>body{font-family:monospace;width:300px;padding:10px}h2{margin:0}table{width:100%;border-collapse:collapse}td{padding:4px 0;border-bottom:1px dashed #ccc;vertical-align:top}</style></head><body>
      <h2>${restaurant?.name||''}</h2>
      <div>by Netrik Shop</div>
      <hr/>
      <div><b>Ticket #${o.id.slice(0,6).toUpperCase()}</b></div>
      <div>Table ${o.tableNumber} · Mesa ${o.tableNumber}</div>
      <div>${new Date(o.createdAt).toLocaleString()}</div>
      <hr/>
      <table>${lines}</table>
      ${o.allergy?`<p><b>Allergy:</b> ${o.allergy}</p>`:''}
      ${o.spicyLevel?`<p><b>Spice:</b> ${o.spicyLevel}</p>`:''}
      <script>window.onload=()=>window.print()</script>
    </body></html>`);
  };

  if (!me || !restaurant) return <div className="min-h-screen grid place-items-center bg-[#0b0b0d] text-white">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <header className="border-b border-white/10 sticky top-0 bg-black/60 backdrop-blur z-30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 grid place-items-center"><ChefHat className="h-5 w-5 text-black"/></div>
            <div>
              <div className="font-bold">{restaurant.name} · Kitchen / Cocina</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">by Netrik Shop · Chef</div>
            </div>
          </div>
          <Button variant="ghost" className="text-white/70" onClick={() => { localStorage.removeItem('netrik_user'); router.push('/login'); }}><LogOut className="h-4 w-4 mr-2"/>Logout</Button>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="text-sm text-white/60 mb-4">{orders.length} active tickets · bilingual</div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.length === 0 && <Card className="col-span-full bg-white/5 border-white/10"><CardContent className="p-12 text-center text-white/40 text-lg">All caught up — no pending tickets.</CardContent></Card>}
          {orders.map(o => (
            <Card key={o.id} className={`bg-white/5 border-white/10 ${o.status === 'pending' ? 'ring-2 ring-amber-400/40' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/50">Ticket #{o.id.slice(0,6).toUpperCase()}</div>
                    <div className="text-3xl font-black">Table {o.tableNumber}</div>
                    <div className="text-xs text-amber-300/80">Mesa {o.tableNumber}</div>
                  </div>
                  <Badge className={o.status === 'pending' ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' : o.status === 'preparing' ? 'bg-blue-400/20 text-blue-300 border-blue-400/30' : 'bg-green-400/20 text-green-300 border-green-400/30'}>{o.status}</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {o.items.map((i,idx) => (
                    <div key={idx} className="rounded-lg bg-black/40 border border-white/5 p-3">
                      <div className="text-lg font-bold">{i.qty}× {i.name}</div>
                      {i.nameEs && <div className="text-sm text-amber-300/80">{i.qty}× {i.nameEs}</div>}
                      {i.notes && <div className="text-xs text-white/60 mt-1">Note / Nota: {i.notes}</div>}
                    </div>
                  ))}
                </div>
                {(o.allergy || o.spicyLevel) && (
                  <div className="mt-3 rounded-lg bg-rose-400/10 border border-rose-400/30 p-3 text-sm">
                    {o.allergy && <div><span className="font-semibold text-rose-300">Allergy / Alergia:</span> {o.allergy}</div>}
                    {o.spicyLevel && <div><span className="font-semibold text-rose-300">Spice / Picante:</span> {o.spicyLevel}</div>}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-white/40 inline-flex items-center"><Clock className="h-3 w-3 mr-1"/>{new Date(o.createdAt).toLocaleTimeString()}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white" onClick={()=>printTicket(o)}><Printer className="h-3.5 w-3.5 mr-1"/>Print</Button>
                    {o.status !== 'ready' && <Button size="sm" onClick={()=>advance(o)} className="bg-amber-400 text-black hover:bg-amber-300">{o.status === 'pending' ? 'Start / Iniciar' : 'Ready / Listo'}<CheckCircle2 className="h-3.5 w-3.5 ml-1"/></Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
