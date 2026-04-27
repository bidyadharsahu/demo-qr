'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Send, CreditCard, Star, Receipt, Utensils, ChefHat } from 'lucide-react';

export default function CustomerOrder() {
  const { tableId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]); // {id,name,nameEs,price,qty,notes}
  const [allergy, setAllergy] = useState('');
  const [spicy, setSpicy] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).slice(2));
  const [order, setOrder] = useState(null);
  const [stage, setStage] = useState('browsing'); // browsing | ordered | served | paying | feedback | done
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const chatEndRef = useRef(null);
  const [paymentSimulating, setPaymentSimulating] = useState(false);

  useEffect(() => {
    if (!tableId) return;
    (async () => {
      try {
        const r = await fetch(`/api/tables/${tableId}`, { cache: 'no-store' }).then(r => r.json());
        if (!r.table) { toast.error('Table not found'); return; }
        setTable(r.table);
        const rest = await fetch(`/api/restaurants/${r.table.restaurantId}`, { cache: 'no-store' }).then(r => r.json());
        setRestaurant(rest.restaurant);
        const m = await fetch(`/api/menu?restaurantId=${r.table.restaurantId}&availableOnly=1`, { cache: 'no-store' }).then(r => r.json());
        setMenu(m.menu || []);
        
        setMessages([
          { role: 'assistant', text: `Hi there! 👋 Welcome to ${rest.restaurant?.name || 'our restaurant'}. I'm your digital waiter. What are you craving today? You can ask for recommendations, add items, place your order, and pay online directly in this chat.` }
        ]);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [tableId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Poll order status
  useEffect(() => {
    if (!order) return;
    const id = setInterval(async () => {
      const r = await fetch(`/api/orders/${order.id}`, { cache: 'no-store' }).then(r => r.json());
      if (r.order) {
        setOrder(r.order);
        if (r.order.status === 'ready' && stage === 'ordered') {
          setStage('served');
          setMessages(m => [...m, { role: 'assistant', text: `✨ Good news! Your food is ready. Please enjoy your meal.` }]);
        }
      }
    }, 4000);
    return () => clearInterval(id);
  }, [order, stage]);

  const mergeItemsIntoCart = (baseCart, additions = []) => {
    const next = [...baseCart.map((x) => ({ ...x }))];
    additions.forEach((it) => {
      const foundMenu = menu.find((x) => x.id === it.id || String(x.name).toLowerCase() === String(it.name || '').toLowerCase());
      if (!foundMenu) return;
      const qty = Math.max(1, parseInt(it.quantity || '1', 10));
      const ex = next.find((x) => x.id === foundMenu.id);
      if (ex) ex.qty += qty;
      else next.push({ id: foundMenu.id, name: foundMenu.name, nameEs: foundMenu.nameEs || '', price: foundMenu.price, qty, notes: '' });
    });
    return next;
  };

  const placeOrder = async (itemsOverride = null) => {
    const items = itemsOverride || cart;
    if (items.length === 0) return toast.error('Cart is empty');
    const res = await fetch('/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId: restaurant.id, tableId: table.id, items, allergy, spicyLevel: spicy }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || 'Failed');
    setOrder(data.order);
    setStage('ordered');
    setCart([]);
    setMessages(m => [...m, { role: 'assistant', text: `✅ Awesome! I've placed your order with the kitchen (Ticket #${data.order.id.slice(0,6).toUpperCase()}). They are preparing your food now.` }]);
  };

  const addOnsAfterOrder = async (itemsOverride = null) => {
    const items = itemsOverride || cart;
    if (items.length === 0 || !order) return toast.error('Cart is empty');
    const res = await fetch(`/api/orders/${order.id}/addons`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || 'Failed');
    setOrder(data.order);
    setCart([]);
    setMessages(m => [...m, { role: 'assistant', text: `Done! I've added those to your existing tab. Your new total is $${data.order.total.toFixed(2)}.` }]);
  };

  const triggerPaymentFlow = () => {
    setStage('paying');
    setMessages(m => [...m, { role: 'assistant', text: `Redirecting to secure online payment for $${order.total.toFixed(2)}...` }]);
    // Simulate Stripe redirect
    setTimeout(() => {
      setPaymentSimulating(true);
    }, 1500);
  };

  const completeSimulatedPayment = async () => {
    setPaymentSimulating(false);
    if (!order) return;
    const res = await fetch('/api/payment/demo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || 'Payment failed');
    setOrder(data.order);
    setStage('feedback');
    setMessages(m => [...m, { role: 'assistant', text: `💳 Payment successful! Thank you so much. Could you spare a moment to rate your experience?` }]);
  };

  const submitFeedback = async () => {
    await fetch('/api/feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId: restaurant.id, tableId: table.id, orderId: order.id, rating, comment: feedback }),
    });
    setStage('done');
    setMessages(m => [...m, { role: 'assistant', text: `Thank you for your feedback! 🙏 Have a wonderful day, and we hope to see you again soon.` }]);
  };

  const sendMessage = async (textOverride = null) => {
    const text = textOverride || input.trim();
    if (!text || sending) return;
    setMessages(m => [...m, { role: 'user', text }]);
    if (!textOverride) setInput('');
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId, restaurantId: restaurant.id, tableId: table.id, language: 'en',
          message: text,
          menu: menu.map(m => ({ id: m.id, name: m.name, description: m.description, price: m.price, category: m.category })),
          cart,
          stage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat failed');
      
      let nextCart = cart;
      if (data.actions?.add_items?.length) {
        nextCart = mergeItemsIntoCart(cart, data.actions.add_items);
        setCart(nextCart);
      }

      if (data.actions?.set_allergy) setAllergy(data.actions.set_allergy);
      if (data.actions?.set_spicy) setSpicy(data.actions.set_spicy);

      // The AI might reply and place the order in the same turn
      if (data.actions?.place_order) {
        if (stage === 'browsing') await placeOrder(nextCart);
        else if (stage === 'ordered' || stage === 'served') await addOnsAfterOrder(nextCart);
      } else {
        // Just standard reply
        setMessages(m => [...m, { role: 'assistant', text: data.reply }]);
        
        // Show cart summary if items were added but not placed
        if (data.actions?.add_items?.length && stage === 'browsing') {
          const total = nextCart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
          setMessages(m => [...m, { role: 'assistant', text: `Your cart is currently at $${total.toFixed(2)}. Say "place order" when you are ready!` }]);
        }
      }

      if (data.actions?.pay_now && order && order.status !== 'paid') {
        triggerPaymentFlow();
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', text: 'Sorry, I lost connection for a moment. Could you say that again?' }]);
    } finally {
      setSending(false);
    }
  };

  if (!restaurant || !table) return <div className="min-h-screen bg-[#0b0b0d] text-white flex items-center justify-center font-sans">Connecting to your table...</div>;

  return (
    <div className="fixed inset-0 bg-black flex justify-center overflow-hidden overscroll-none">
      <div className="flex flex-col w-full h-full max-w-lg bg-[#0b0b0d] text-white font-sans shadow-2xl relative overflow-hidden">
      
      {/* Sleek App Header */}
      <div className="flex-none pt-safe bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md z-20 pb-4">
        <div className="px-5 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {restaurant.logoUrl ? (
              <img src={restaurant.logoUrl} alt="Logo" className="w-10 h-10 rounded-full border border-white/20 object-cover shadow-lg" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 grid place-items-center shadow-lg"><ChefHat className="text-black w-5 h-5"/></div>
            )}
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight shadow-black/50">{restaurant.name}</h1>
              <p className="text-[11px] text-white/60 font-medium uppercase tracking-widest">Table {table.number}</p>
            </div>
          </div>
          {order && (
            <div className="text-right">
               <div className="text-xl font-black text-amber-400">${order.total.toFixed(2)}</div>
               <div className="text-[10px] text-white/50 uppercase tracking-widest">{order.status}</div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 pt-2 hide-scrollbar scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-white/10 shrink-0 mr-2 mt-auto mb-1 flex items-center justify-center">
                <ChefHat className="w-3.5 h-3.5 text-white/60" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-black rounded-br-sm font-medium' : 'bg-[#1c1c1e] text-white/90 rounded-bl-sm border border-white/5'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start animate-in fade-in">
             <div className="w-6 h-6 rounded-full bg-white/10 shrink-0 mr-2 mt-auto mb-1 flex items-center justify-center">
                <ChefHat className="w-3.5 h-3.5 text-white/60" />
              </div>
            <div className="bg-[#1c1c1e] text-white/50 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center border border-white/5">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} className="h-2" />
      </div>

      {/* Quick Action Chips */}
      {stage === 'browsing' && !sending && cart.length === 0 && (
         <div className="px-4 pb-3 flex gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap animate-in slide-in-from-bottom-4">
           <button onClick={() => sendMessage("What are your popular dishes?")} className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-medium hover:bg-white/20 transition-colors">✨ Recommendations</button>
           <button onClick={() => sendMessage("Show me the menu")} className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-medium hover:bg-white/20 transition-colors"><Utensils className="w-3 h-3 inline mr-1.5"/> Menu</button>
         </div>
      )}

      {/* Input Area */}
      <div className="flex-none p-4 bg-[#0b0b0d] border-t border-white/10 pb-safe z-20">
        <div className="relative flex items-center">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && sendMessage()} 
            placeholder="Type your order or question..." 
            className="w-full bg-[#1c1c1e] border-white/10 text-[15px] h-12 rounded-full pl-5 pr-12 focus-visible:ring-amber-400 focus-visible:border-amber-400 transition-all placeholder:text-white/30" 
            disabled={sending || stage === 'paying' || stage === 'feedback' || stage === 'done'}
          />
          <button 
            onClick={() => sendMessage()} 
            disabled={sending || !input.trim() || stage === 'paying' || stage === 'feedback' || stage === 'done'} 
            className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-full bg-amber-400 text-black disabled:opacity-50 disabled:bg-white/10 disabled:text-white/30 transition-colors"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Stripe Payment Simulation Modal */}
      {paymentSimulating && (
        <div className="absolute inset-0 z-50 bg-[#0b0b0d] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
           <Card className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border-0">
             <div className="bg-[#635BFF] p-6 text-white text-center">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-90" />
                <h2 className="text-xl font-bold">Secure Checkout</h2>
                <p className="text-white/80 text-sm mt-1">{restaurant.name}</p>
             </div>
             <CardContent className="p-6 space-y-5 text-black">
                <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                  <div className="text-gray-500 text-sm font-medium">Total to pay</div>
                  <div className="text-3xl font-black">${order?.total.toFixed(2)}</div>
                </div>
                <div className="space-y-3">
                  <div className="h-12 bg-gray-100 rounded-xl w-full flex items-center px-4 text-gray-400 text-sm font-mono tracking-widest border border-gray-200">**** **** **** 4242</div>
                  <div className="flex gap-3">
                    <div className="h-12 bg-gray-100 rounded-xl w-1/2 flex items-center px-4 text-gray-400 text-sm border border-gray-200">MM / YY</div>
                    <div className="h-12 bg-gray-100 rounded-xl w-1/2 flex items-center px-4 text-gray-400 text-sm border border-gray-200">CVC</div>
                  </div>
                </div>
                <Button onClick={completeSimulatedPayment} className="w-full h-12 bg-[#635BFF] hover:bg-[#524be0] text-white rounded-xl text-lg font-semibold shadow-lg shadow-[#635BFF]/30 transition-all">Pay $${order?.total.toFixed(2)}</Button>
                <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">Powered by <span className="font-bold text-gray-700 tracking-tight">stripe</span></div>
             </CardContent>
           </Card>
        </div>
      )}

      {/* Feedback Modal Overlay */}
      {stage === 'feedback' && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-500">
          <Card className="bg-[#1c1c1e] border border-white/10 text-white w-full max-w-sm rounded-3xl shadow-2xl">
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 mx-auto text-amber-400 mb-4"/>
              <div className="text-2xl font-black mb-2">How was it?</div>
              <div className="text-sm text-white/60 leading-relaxed mb-6">Your feedback directly helps {restaurant.name} improve their service.</div>
              <div className="flex justify-center gap-2 mb-6">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={()=>setRating(n)} className={`transition-transform hover:scale-110 ${n <= rating ? 'text-amber-400' : 'text-white/20'}`}>
                    <Star className="h-10 w-10" fill={n <= rating ? 'currentColor' : 'none'}/>
                  </button>
                ))}
              </div>
              <Input placeholder="Leave a nice comment (optional)..." value={feedback} onChange={e=>setFeedback(e.target.value)} className="bg-black/50 border-white/10 rounded-xl h-12 mb-4 placeholder:text-white/30 text-[15px]"/>
              <Button onClick={submitFeedback} className="w-full bg-amber-400 text-black hover:bg-amber-300 h-12 rounded-xl text-lg font-bold shadow-lg shadow-amber-400/20">Submit Feedback</Button>
            </CardContent>
          </Card>
        </div>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .pt-safe { padding-top: env(safe-area-inset-top); }
      `}</style>
      </div>
    </div>
  );
}

