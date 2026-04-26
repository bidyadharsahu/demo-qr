'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Send, ShoppingCart, Plus, Minus, ChefHat, CreditCard, Star, MessageCircle, Sparkles, Receipt, X } from 'lucide-react';

const FOOD_FALLBACK = 'https://images.pexels.com/photos/35420084/pexels-photo-35420084.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';

export default function CustomerOrder() {
  const { tableId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]); // {id,name,nameEs,price,qty,notes}
  const [allergy, setAllergy] = useState('');
  const [spicy, setSpicy] = useState('');
  const [language, setLanguage] = useState('en');
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).slice(2));
  const [order, setOrder] = useState(null); // current placed order
  const [stage, setStage] = useState('browsing'); // browsing | ordered | served | paid | feedback | done
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!tableId) return;
    (async () => {
      const r = await fetch(`/api/tables/${tableId}`).then(r => r.json());
      if (!r.table) { toast.error('Table not found'); return; }
      setTable(r.table);
      const rest = await fetch(`/api/restaurants/${r.table.restaurantId}`).then(r => r.json());
      setRestaurant(rest.restaurant);
      const m = await fetch(`/api/menu?restaurantId=${r.table.restaurantId}&availableOnly=1`).then(r => r.json());
      setMenu(m.menu || []);
      // greet
      setMessages([{ role: 'assistant', text: `Welcome to ${rest.restaurant?.name}! 🍽️ I'm your AI waiter. Tell me what you're craving and I'll help you order. ¡Bienvenido!` }]);
    })();
  }, [tableId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Poll order status
  useEffect(() => {
    if (!order) return;
    const id = setInterval(async () => {
      const r = await fetch(`/api/orders/${order.id}`).then(r => r.json());
      if (r.order) {
        setOrder(r.order);
        if (r.order.status === 'ready' && stage === 'ordered') {
          setStage('served');
          setMessages(m => [...m, { role: 'assistant', text: `✨ Your food is ready! Please enjoy. When you're done, hit Pay below.` }]);
        }
      }
    }, 4000);
    return () => clearInterval(id);
  }, [order, stage]);

  const addToCart = (item) => {
    setCart(c => {
      const ex = c.find(x => x.id === item.id);
      if (ex) return c.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { id: item.id, name: item.name, nameEs: item.nameEs || '', price: item.price, qty: 1, notes: '' }];
    });
    toast.success(`${item.name} added`);
  };
  const inc = (id) => setCart(c => c.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x));
  const dec = (id) => setCart(c => c.flatMap(x => x.id === id ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x]));
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    const res = await fetch('/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId: restaurant.id, tableId: table.id, items: cart, allergy, spicyLevel: spicy }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || 'Failed');
    setOrder(data.order);
    setStage('ordered');
    toast.success('Order placed!');
    setMessages(m => [...m, { role: 'assistant', text: `✅ Order placed! Ticket #${data.order.id.slice(0,6).toUpperCase()}. The kitchen is preparing your food now.` }]);
  };

  const addOnsAfterOrder = async () => {
    if (cart.length === 0 || !order) return toast.error('Cart is empty');
    const res = await fetch(`/api/orders/${order.id}/addons`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || 'Failed');
    setOrder(data.order);
    setCart([]);
    toast.success('Added to your existing order');
    setMessages(m => [...m, { role: 'assistant', text: `Added to your tab. New total: $${data.order.total.toFixed(2)}.` }]);
  };

  const payNow = async () => {
    if (!order) return;
    const res = await fetch('/api/payment/demo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || 'Payment failed');
    setOrder(data.order);
    setStage('feedback');
    toast.success('Payment successful!');
    setMessages(m => [...m, { role: 'assistant', text: `💳 Payment received — thank you! Could you spare a moment to rate your experience?` }]);
  };

  const submitFeedback = async () => {
    await fetch('/api/feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId: restaurant.id, tableId: table.id, orderId: order.id, rating, comment: feedback }),
    });
    setStage('done');
    setMessages(m => [...m, { role: 'assistant', text: `Thank you! 🙏 Hope to see you again at ${restaurant.name}.` }]);
    setTimeout(() => setChatOpen(false), 2500);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId, restaurantId: restaurant.id, tableId: table.id, language,
          message: text,
          menu: menu.map(m => ({ id: m.id, name: m.name, description: m.description, price: m.price, category: m.category })),
          cart,
          stage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat failed');
      setMessages(m => [...m, { role: 'assistant', text: data.reply }]);
      // Bot may suggest items to add
      if (data.actions?.add_items?.length) {
        for (const it of data.actions.add_items) {
          const found = menu.find(x => x.id === it.id || x.name.toLowerCase() === (it.name || '').toLowerCase());
          if (found) {
            for (let i = 0; i < (it.quantity || 1); i++) addToCart(found);
          }
        }
      }
      if (data.actions?.set_allergy) setAllergy(data.actions.set_allergy);
      if (data.actions?.set_spicy) setSpicy(data.actions.set_spicy);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', text: 'Sorry, I had a hiccup. Could you say that again?' }]);
    } finally {
      setSending(false);
    }
  };

  if (!restaurant || !table) return <div className="min-h-screen grid place-items-center bg-[#0b0b0d] text-white">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white pb-32">
      <header className="sticky top-0 z-30 backdrop-blur bg-black/60 border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-bold">{restaurant.name}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">by Netrik Shop · Table {table.number}</div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-24 h-8 bg-white/5 border-white/10 text-xs"><SelectValue/></SelectTrigger>
              <SelectContent className="bg-[#111] text-white border-white/10">
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="es">ES</SelectItem>
              </SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild><Button size="sm" variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white relative"><ShoppingCart className="h-4 w-4 mr-1"/>Cart{cart.length > 0 && <Badge className="ml-2 bg-amber-400 text-black">{cart.reduce((s,x)=>s+x.qty,0)}</Badge>}</Button></SheetTrigger>
              <SheetContent className="bg-[#111] border-white/10 text-white w-full sm:max-w-md overflow-y-auto">
                <SheetHeader><SheetTitle className="text-white">{stage === 'ordered' ? 'Add-ons' : 'Your order'}</SheetTitle></SheetHeader>
                <div className="mt-4 space-y-2">
                  {cart.length === 0 && <div className="text-white/40 text-sm">Cart is empty.</div>}
                  {cart.map(it => (
                    <div key={it.id} className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                      <div className="flex-1"><div className="font-medium">{it.name}</div><div className="text-xs text-white/50">${it.price.toFixed(2)} each</div></div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={()=>dec(it.id)}><Minus className="h-3 w-3"/></Button>
                        <span className="w-6 text-center">{it.qty}</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={()=>inc(it.id)}><Plus className="h-3 w-3"/></Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <Input placeholder="Allergies (e.g. nuts, dairy)" value={allergy} onChange={e=>setAllergy(e.target.value)} className="bg-white/5 border-white/10"/>
                  <Select value={spicy} onValueChange={setSpicy}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Spice level (optional)"/></SelectTrigger>
                    <SelectContent className="bg-[#111] text-white border-white/10">
                      <SelectItem value="mild">Mild / Suave</SelectItem>
                      <SelectItem value="medium">Medium / Medio</SelectItem>
                      <SelectItem value="hot">Hot / Picante</SelectItem>
                      <SelectItem value="extra-hot">Extra Hot / Extra Picante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4 border-t border-white/10 pt-4 flex items-center justify-between">
                  <div className="text-white/60 text-sm">Subtotal</div>
                  <div className="text-2xl font-black text-amber-300">${total.toFixed(2)}</div>
                </div>
                {stage === 'browsing' ? (
                  <Button disabled={cart.length === 0} onClick={placeOrder} className="mt-3 w-full bg-amber-400 text-black hover:bg-amber-300 h-11"><ChefHat className="h-4 w-4 mr-2"/>Place Order</Button>
                ) : stage === 'ordered' || stage === 'served' ? (
                  <Button disabled={cart.length === 0} onClick={addOnsAfterOrder} className="mt-3 w-full bg-amber-400 text-black hover:bg-amber-300 h-11"><Plus className="h-4 w-4 mr-2"/>Add to my tab</Button>
                ) : null}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Order status banner */}
      {order && (
        <div className="container mx-auto px-4 mt-4">
          <Card className="bg-gradient-to-r from-amber-400/10 to-rose-400/10 border-amber-400/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-amber-300">Ticket #{order.id.slice(0,6).toUpperCase()}</div>
                <div className="font-semibold">Status: <span className="capitalize">{order.status}</span></div>
                <div className="text-xs text-white/60">Total: ${order.total.toFixed(2)}</div>
              </div>
              {stage === 'served' && order.status !== 'paid' && (<Button onClick={payNow} className="bg-green-500 hover:bg-green-400 text-white"><CreditCard className="h-4 w-4 mr-2"/>Pay ${order.total.toFixed(2)}</Button>)}
              {stage === 'ordered' && order.status === 'preparing' && <Badge className="bg-blue-400/20 text-blue-300 border-blue-400/30">Cooking…</Badge>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Menu */}
      <main className="container mx-auto px-4 py-6">
        <div className="text-amber-300 text-xs uppercase tracking-[0.3em]">Menu</div>
        <h1 className="text-3xl font-black mt-2">What are you craving today?</h1>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menu.length === 0 && <Card className="col-span-full bg-white/5 border-white/10"><CardContent className="p-10 text-center text-white/40">Menu is being prepared.</CardContent></Card>}
          {menu.map(item => (
            <Card key={item.id} className="bg-white/5 border-white/10 overflow-hidden">
              <div className="h-40 overflow-hidden"><img src={item.image || FOOD_FALLBACK} className="w-full h-full object-cover"/></div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-white/50">{item.category}</div>
                  </div>
                  <div className="font-bold text-amber-300">${item.price.toFixed(2)}</div>
                </div>
                {item.description && <div className="text-xs text-white/60 mt-2 line-clamp-2">{item.description}</div>}
                <Button size="sm" className="mt-3 w-full bg-amber-400 text-black hover:bg-amber-300" onClick={()=>addToCart(item)}><Plus className="h-4 w-4 mr-1"/>Add</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Feedback modal-like card */}
      {stage === 'feedback' && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/80 p-4">
          <Card className="bg-[#111] border-white/10 text-white w-full max-w-md">
            <CardContent className="p-6 text-center">
              <Receipt className="h-10 w-10 mx-auto text-amber-300"/>
              <div className="mt-3 text-2xl font-black">How was your meal?</div>
              <div className="text-sm text-white/50">Your feedback helps {restaurant.name} improve.</div>
              <div className="mt-5 flex justify-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={()=>setRating(n)} className={n <= rating ? 'text-amber-300' : 'text-white/30'}>
                    <Star className="h-8 w-8" fill={n <= rating ? 'currentColor' : 'none'}/>
                  </button>
                ))}
              </div>
              <Input placeholder="Optional comment…" value={feedback} onChange={e=>setFeedback(e.target.value)} className="mt-4 bg-white/5 border-white/10"/>
              <Button onClick={submitFeedback} className="mt-4 w-full bg-amber-400 text-black hover:bg-amber-300">Submit</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat widget */}
      <div className="fixed bottom-4 right-4 z-40">
        {!chatOpen && (
          <Button onClick={()=>setChatOpen(true)} className="h-14 w-14 rounded-full bg-amber-400 text-black hover:bg-amber-300 shadow-2xl shadow-amber-400/30"><MessageCircle className="h-6 w-6"/></Button>
        )}
        {chatOpen && (
          <Card className="w-[360px] sm:w-[400px] h-[520px] bg-[#111] border-white/10 flex flex-col shadow-2xl">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 grid place-items-center"><Sparkles className="h-4 w-4 text-black"/></div>
                <div>
                  <div className="text-sm font-semibold">AI Waiter</div>
                  <div className="text-[10px] text-amber-300/80 uppercase">Powered by Netrik AI</div>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={()=>setChatOpen(false)}><X className="h-4 w-4"/></Button>
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-amber-400 text-black' : 'bg-white/10 text-white'}`}>{m.text}</div>
                  </div>
                ))}
                {sending && <div className="flex"><div className="bg-white/10 text-white/60 rounded-2xl px-3 py-2 text-sm animate-pulse">typing…</div></div>}
                <div ref={chatEndRef}/>
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-white/10 flex items-center gap-2">
              <Input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder={language === 'es' ? 'Pregunta lo que sea…' : 'Ask me anything…'} className="bg-white/5 border-white/10" disabled={sending}/>
              <Button size="icon" onClick={sendMessage} disabled={sending} className="bg-amber-400 text-black hover:bg-amber-300"><Send className="h-4 w-4"/></Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
