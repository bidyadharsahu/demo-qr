import { motion } from 'framer-motion';
import { Database, Link as LinkIcon, Server } from 'lucide-react';
import './Home.css';

const DeliveryConnect = () => {
  return (
    <div className="animate-fade-in" style={{ paddingTop: '120px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>Connect Online <span className="text-gradient">Delivery Portals</span> to POS</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
           Seamlessly integrate your digital menu with 300+ POS systems and payment gateways. Reduce manual entry and streamline your kitchen workflow.
        </p>
      </div>

      <div className="container">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 40px', position: 'relative', overflow: 'hidden' }}>
           
           {/* Abstract connection UI */}
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '600px', marginBottom: '60px', position: 'relative' }}>
              
              <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, var(--accent-gold), transparent)', opacity: 0.3 }}></div>

              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="glass-panel" style={{ padding: '24px', zIndex: 2, background: 'var(--bg-secondary)', borderRadius: '50%' }}>
                 <Database size={40} color="var(--accent-gold)" />
              </motion.div>
              
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} style={{ zIndex: 2 }}>
                 <LinkIcon size={32} color="var(--text-secondary)" />
              </motion.div>

              <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 1 }} className="glass-panel" style={{ padding: '24px', zIndex: 2, background: 'var(--bg-secondary)', borderRadius: '50%' }}>
                 <Server size={40} color="var(--text-primary)" />
              </motion.div>
           </div>

           <img src="/food_delivery_pos.png" alt="POS Dashboard Match" style={{ width: '100%', maxWidth: '800px', borderRadius: '16px', boxShadow: 'var(--shadow-card)' }} onError={(e) => { e.currentTarget.style.display = 'none'; }}/>
        </div>
      </div>
    </div>
  );
};

export default DeliveryConnect;
