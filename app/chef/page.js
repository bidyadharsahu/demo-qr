'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Clock, CheckCircle2, Printer, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { NetrikLogo } from '@/components/netrik-logo';

export default function ChefDashboard() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [language, setLanguage] = useState('both');
  const [autoPrint, setAutoPrint] = useState(true);
  const printedRef = useRef(new Set()); // order IDs already auto-printed
  const seededRef = useRef(false); // skip auto-print on first load (existing tickets)
  const printIframeRef = useRef(null);
  const lastNewOrderToastRef = useRef(0);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('netrik_user') || 'null');
    if (!u || u.type !== 'chef') { router.push('/login'); return; }
    setMe(u);
    // Load auto-print preference
    const ap = localStorage.getItem('netrik_chef_autoprint');
    if (ap !== null) setAutoPrint(ap === '1');
    load(u);
    let channel;
    if (u) {
      import('@/lib/supabase').then(({ getSupabase }) => {
        const sb = getSupabase();
        if (sb) {
          channel = sb.channel('chef-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${u.restaurantId}` }, () => {
              load(u);
            })
            .subscribe();
        }
      });
    }

    // Polling fallback so realtime works even when Supabase realtime is off
    const poll = setInterval(() => load(u), 5000);

    return () => {
      if (channel) channel.unsubscribe();
      clearInterval(poll);
    };
  }, [router]);

  const persistAutoPrint = (v) => {
    setAutoPrint(v);
    try { localStorage.setItem('netrik_chef_autoprint', v ? '1' : '0'); } catch {}
  };

  const load = async (u) => {
    try {
      const [r, o] = await Promise.all([
        fetch(`/api/restaurants/${u.restaurantId}`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`/api/orders?restaurantId=${u.restaurantId}`, { cache: 'no-store' }).then(r => r.json()),
      ]);
      setRestaurant(r.restaurant);
      const active = (o.orders || []).filter(x => ['pending', 'preparing', 'ready'].includes(x.status));
      setOrders(active);

      // Auto-print logic — only for fresh new pending orders that weren't printed yet
      const newPending = active.filter(x => x.status === 'pending' && !printedRef.current.has(x.id));
      if (!seededRef.current) {
        // First load — seed already-existing tickets so we don't re-print them
        active.forEach(x => printedRef.current.add(x.id));
        seededRef.current = true;
      } else if (newPending.length > 0) {
        // Notify and auto-print
        const now = Date.now();
        if (now - lastNewOrderToastRef.current > 1000) {
          lastNewOrderToastRef.current = now;
          toast.success(`🔔 New ticket — Table ${newPending[0].tableNumber}`, { duration: 3500 });
          try {
            const a = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQQAAAAAAA==');
            a.volume = 0.4; a.play().catch(() => {});
          } catch {}
        }
        if (autoPrint) {
          newPending.forEach((order, idx) => {
            // Stagger by 250ms so multiple new orders print one after another
            setTimeout(() => silentPrintTicket(order, r.restaurant), idx * 250);
            printedRef.current.add(order.id);
          });
        } else {
          newPending.forEach(o => printedRef.current.add(o.id));
        }
      }
    } catch (e) {
      console.error('chef load failed', e);
    }
  };

  const advance = async (o) => {
    const next = o.status === 'pending' ? 'preparing' : o.status === 'preparing' ? 'ready' : 'served';
    await fetch(`/api/orders/${o.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) });
    load(me);
  };

  const buildTicketHtml = (o, rest) => {
    const lines = (o.items || []).map(i => `<tr><td>${i.qty}×</td><td><b>${i.name}</b><br/><span style='color:#888;font-size:11px'>${i.nameEs || ''}</span>${i.notes ? `<div style='font-size:11px'>Note: ${i.notes}</div>` : ''}</td></tr>`).join('');
    return `<html><head><title>Ticket #${o.id.slice(0, 6)}</title><style>
      @page { size: 80mm auto; margin: 4mm; }
      body{font-family:monospace;width:300px;padding:6px;color:#000}
      h2{margin:0 0 4px}table{width:100%;border-collapse:collapse}
      td{padding:4px 0;border-bottom:1px dashed #ccc;vertical-align:top}
      .small{font-size:11px;color:#444}
      hr{border:none;border-top:1px dashed #aaa;margin:6px 0}
    </style></head><body>
      <h2>${rest?.name || 'Restaurant'}</h2>
      <div class="small">by Netrik Shop</div>
      <hr/>
      <div><b>Ticket #${o.id.slice(0, 6).toUpperCase()}</b></div>
      <div>Table ${o.tableNumber} · Mesa ${o.tableNumber}</div>
      <div class="small">${new Date(o.createdAt).toLocaleString()}</div>
      <hr/>
      <table>${lines}</table>
      ${o.allergy ? `<p><b>Allergy:</b> ${o.allergy}</p>` : ''}
      ${o.spicyLevel ? `<p><b>Spice:</b> ${o.spicyLevel}</p>` : ''}
    </body></html>`;
  };

  // Manual print — opens new window like before
  const printTicket = (o) => {
    const w = window.open('', '_blank');
    if (!w) {
      // popup blocked — fall back to silent iframe print
      silentPrintTicket(o, restaurant);
      return;
    }
    w.document.write(buildTicketHtml(o, restaurant) + `<script>window.onload=()=>window.print()<\/script>`);
    w.document.close();
  };

  // Silent / auto print via hidden iframe (works without popup)
  const silentPrintTicket = (o, rest) => {
    try {
      const iframe = printIframeRef.current;
      if (!iframe) return;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(buildTicketHtml(o, rest || restaurant));
      doc.close();
      // Wait one tick so styles apply, then print
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (err) {
          console.error('auto-print failed', err);
        }
      }, 200);
    } catch (err) {
      console.error('auto-print error', err);
    }
  };

  if (!me || !restaurant) return <div className="min-h-screen grid place-items-center bg-[#0b0b0d] text-white">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <header className="border-b border-white/10 sticky top-0 bg-black/60 backdrop-blur z-30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {restaurant.logoUrl ? (
              <img src={restaurant.logoUrl} alt={restaurant.name} className="h-9 w-9 rounded-xl object-cover border border-white/10" />
            ) : (
              <NetrikLogo className="h-9 w-9" />
            )}
            <div>
              <div className="font-bold">{restaurant.name} · {language === 'es' ? 'Cocina' : language === 'both' ? 'Kitchen / Cocina' : 'Kitchen'}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">by Netrik Shop · Chef</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Auto-print toggle */}
            <button
              onClick={() => persistAutoPrint(!autoPrint)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition ${autoPrint ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-white/15 bg-white/5 text-white/60'}`}
              title={autoPrint ? 'Auto-print is ON — new tickets print automatically' : 'Auto-print is OFF'}
            >
              {autoPrint ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
              Auto-print {autoPrint ? 'on' : 'off'}
            </button>
            <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
              {[
                ['en', 'EN'],
                ['es', 'ES'],
                ['both', 'Both'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLanguage(value)}
                  className={`rounded-md px-2.5 py-1 text-xs transition ${language === value ? 'bg-amber-400 text-black' : 'text-white/70 hover:bg-white/10'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Button variant="ghost" className="text-white/70" onClick={() => { localStorage.removeItem('netrik_user'); router.push('/login'); }}><LogOut className="h-4 w-4 mr-2" />Logout</Button>
          </div>
        </div>
      </header>

      {/* Auto-print enable hint — once-off prompt to ensure browsers allow print() */}
      {autoPrint && !seededRef.current && (
        <div className="container mx-auto px-6 pt-3 text-[11px] text-amber-200/80">Tip: keep this tab focused and allow popups so the kitchen printer fires automatically.</div>
      )}

      <main className="container mx-auto px-6 py-8">
        <div className="text-sm text-white/60 mb-4 flex items-center gap-3">
          <span>{orders.length} active tickets · {language === 'es' ? 'Spanish' : language === 'both' ? 'Bilingual' : 'English'}</span>
          {autoPrint && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 border border-emerald-400/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-200"><Printer className="h-3 w-3"/>Auto-print ready</span>}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.length === 0 && <Card className="col-span-full bg-white/5 border-white/10"><CardContent className="p-12 text-center text-white/40 text-lg">All caught up — no pending tickets.</CardContent></Card>}
          {orders.map(o => (
            <Card key={o.id} className={`bg-white/5 border-white/10 transition ${o.status === 'pending' ? 'ring-2 ring-amber-400/40 animate-pulse-once' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/50">Ticket #{o.id.slice(0, 6).toUpperCase()}</div>
                    <div className="text-3xl font-black">{language === 'es' ? `Mesa ${o.tableNumber}` : `Table ${o.tableNumber}`}</div>
                    {language === 'both' && <div className="text-xs text-amber-300/80">Mesa {o.tableNumber}</div>}
                  </div>
                  <Badge className={o.status === 'pending' ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' : o.status === 'preparing' ? 'bg-blue-400/20 text-blue-300 border-blue-400/30' : 'bg-green-400/20 text-green-300 border-green-400/30'}>{o.status}</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {o.items.map((i, idx) => (
                    <div key={idx} className="rounded-lg bg-black/40 border border-white/5 p-3">
                      <div className="text-lg font-bold">{i.qty}× {language === 'es' ? (i.nameEs || i.name) : i.name}</div>
                      {language === 'both' && i.nameEs && <div className="text-sm text-amber-300/80">{i.qty}× {i.nameEs}</div>}
                      {i.notes && <div className="text-xs text-white/60 mt-1">{language === 'es' ? 'Nota' : language === 'both' ? 'Note / Nota' : 'Note'}: {i.notes}</div>}
                    </div>
                  ))}
                </div>
                {(o.allergy || o.spicyLevel) && (
                  <div className="mt-3 rounded-lg bg-rose-400/10 border border-rose-400/30 p-3 text-sm">
                    {o.allergy && <div><span className="font-semibold text-rose-300">{language === 'es' ? 'Alergia' : language === 'both' ? 'Allergy / Alergia' : 'Allergy'}:</span> {o.allergy}</div>}
                    {o.spicyLevel && <div><span className="font-semibold text-rose-300">{language === 'es' ? 'Picante' : language === 'both' ? 'Spice / Picante' : 'Spice'}:</span> {o.spicyLevel}</div>}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-white/40 inline-flex items-center"><Clock className="h-3 w-3 mr-1" />{new Date(o.createdAt).toLocaleTimeString()}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white" onClick={() => printTicket(o)}><Printer className="h-3.5 w-3.5 mr-1" />Print</Button>
                    {o.status !== 'ready' && <Button size="sm" onClick={() => advance(o)} className="bg-amber-400 text-black hover:bg-amber-300">{o.status === 'pending' ? (language === 'es' ? 'Iniciar' : language === 'both' ? 'Start / Iniciar' : 'Start') : (language === 'es' ? 'Listo' : language === 'both' ? 'Ready / Listo' : 'Ready')}<CheckCircle2 className="h-3.5 w-3.5 ml-1" /></Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Hidden iframe used for auto-printing without popup blockers */}
      <iframe ref={printIframeRef} title="kitchen-printer" style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '0', height: '0', border: '0' }} />

      <style jsx global>{`
        @keyframes pulseOnce { 0% { box-shadow: 0 0 0 0 rgba(252, 211, 77, 0.55); } 70% { box-shadow: 0 0 0 14px rgba(252, 211, 77, 0); } 100% { box-shadow: 0 0 0 0 rgba(252, 211, 77, 0); } }
        .animate-pulse-once { animation: pulseOnce 1.6s ease-out 1; }
      `}</style>
    </div>
  );
}
