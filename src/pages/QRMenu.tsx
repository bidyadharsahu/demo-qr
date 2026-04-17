import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css'; // Reusing some base styles

const QRMenu = () => {
  return (
    <div className="animate-fade-in" style={{ paddingTop: '100px' }}>
      
      <section className="container" style={{ padding: '80px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '60px' }}>
        <div style={{ flex: '1 1 400px' }}>
          <motion.h1 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: '3.5rem', marginBottom: '24px' }}
          >
            Restaurant <span className="text-gradient">Scan Menu</span> Generator
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '32px' }}>
            Trusted by over 10,000 hotels, restaurants & food outlets worldwide. Transform your physical menu into a rich digital experience instantly.
          </motion.p>
          
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px' }}>
            {['No App Download Required', 'Instantly Update Prices & Items', 'Gather Guest Feedback', 'Increase Sales up to 30%'].map((item, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.1) }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontSize: '1.1rem' }}
              >
                <CheckCircle2 color="var(--accent-gold)" size={20} />
                {item}
              </motion.li>
            ))}
          </ul>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
             <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Try It For Free <ArrowRight size={20} />
             </Link>
          </motion.div>
        </div>

        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
           style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}
        >
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '32px', background: 'radial-gradient(circle at top left, rgba(212,175,55,0.15), transparent)' }}>
             <img src="/qr_code_menu_food.png" alt="QR Code on Table" style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', boxShadow: 'var(--shadow-card)' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default QRMenu;
