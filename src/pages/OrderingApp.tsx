import { motion } from 'framer-motion';
import { Search, ShoppingCart, Info, Star, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const categories = ['Signature', 'Starters', 'Mains', 'Desserts', 'Beverages'];
const dummyItems = [
   { id: 1, name: 'Truffle Wagyu Burger', desc: 'Premium wagyu beef, black truffle mayo, aged cheddar, brioche bun.', price: 34, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', cat: 'Signature' },
   { id: 2, name: 'Lobster Risotto', desc: 'Arborio rice, butter-poached lobster, saffron broth, parmesan crisp.', price: 42, img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80', cat: 'Mains' },
   { id: 3, name: 'Burrata Salad', desc: 'Fresh burrata, heirloom tomatoes, basil oil, balsamic glaze.', price: 18, img: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=500&q=80', cat: 'Starters' },
   { id: 4, name: 'Golden Lava Cake', desc: 'Dark chocolate fondant with a molten gold caramel center.', price: 15, img: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&q=80', cat: 'Desserts' },
];

const OrderingApp = () => {
  const { tenant } = useParams();
  const [activeCat, setActiveCat] = useState('Signature');
  const [cart, setCart] = useState<number[]>([]);

  return (
    <div style={{ background: '#050810', minHeight: '100vh', paddingBottom: '80px' }}>
       {/* App Header */}
       <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(5,8,16,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
             <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <ChevronLeft size={20} /> Exit
             </Link>
             <div style={{ fontWeight: 600, fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--accent-gold)' }}>
                {tenant?.toUpperCase().replace('-', ' ')}
             </div>
             <Info size={20} color="var(--text-secondary)" />
          </div>

          <div style={{ position: 'relative' }}>
             <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
             <input type="text" placeholder="Search menu..." style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '10px 16px 10px 40px', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
          </div>
       </header>

       {/* Horizontal Categories */}
       <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', padding: '16px', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
             <button 
                key={cat} 
                onClick={() => setActiveCat(cat)}
                style={{ 
                   background: activeCat === cat ? 'var(--accent-gold)' : 'transparent', 
                   color: activeCat === cat ? 'var(--bg-primary)' : 'var(--text-secondary)',
                   border: activeCat === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
                   padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s'
                }}
             >
                {cat}
             </button>
          ))}
       </div>

       {/* Menu Items Grid */}
       <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {dummyItems.filter(item => item.cat === activeCat || activeCat === 'Signature').map((item, idx) => (
             <motion.div 
               key={item.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               style={{ display: 'flex', gap: '16px', background: 'rgba(19,26,44,0.4)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}
             >
                <div style={{ flex: 1 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{item.name}</h3>
                      {item.cat === 'Signature' && <Star size={14} color="var(--accent-gold)" fill="var(--accent-gold)" />}
                   </div>
                   <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '12px' }}>{item.desc}</p>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-gold)', fontSize: '1.1rem' }}>${item.price}</span>
                      <button 
                         onClick={() => setCart([...cart, item.id])}
                         style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer' }}
                      >+</button>
                   </div>
                </div>
                <img src={item.img} alt={item.name} style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }} />
             </motion.div>
          ))}
       </div>

       {/* Floating Cart Button */}
       {cart.length > 0 && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }}
            style={{ position: 'fixed', bottom: '24px', left: '24px', right: '24px', zIndex: 20 }}
          >
             <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(212,175,55,0.3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <ShoppingCart size={20} />
                   <span>{cart.length} Items</span>
                </span>
                <span>View Cart &bull; ${cart.reduce((sum, id) => sum + (dummyItems.find(i => i.id === id)?.price || 0), 0)}</span>
             </button>
          </motion.div>
       )}
    </div>
  );
};

export default OrderingApp;
