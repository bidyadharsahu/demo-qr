import { motion } from 'framer-motion';
import { QrCode, Smartphone, BarChart3, Globe } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-overlay"></div>
        <img src="/hero_tablet_menu.png" alt="Luxury Tablet Menu" className="hero-bg-img" onError={(e) => {
           // Fallback if image not moved to public properly
           e.currentTarget.style.display = 'none';
        }}/>
        <div className="container hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-title"
          >
            Elevate Your <br />
            <span className="text-gradient">Dining Experience</span>
          </motion.h1>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="features-section container">
        <div className="section-header">
          <h2>Designed to <span className="text-gradient">Increase Sales</span></h2>
          <p>Showcase your food with beautiful photos and videos to mesmerize your guests.</p>
        </div>

        <div className="feature-grid">
          <motion.div whileHover={{ y: -10 }} className="feature-card glass-panel">
            <div className="feature-icon"><QrCode color="var(--accent-gold)" size={32} /></div>
            <h3>QR Menu</h3>
            <p>No app required. Scan QR on mobile to see the interactive menu. Unique codes identify tables automatically.</p>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className="feature-card glass-panel">
            <div className="feature-icon"><Smartphone color="var(--accent-gold)" size={32} /></div>
            <h3>Tablet Menu</h3>
            <p>Our tablet menu runs natively on iOS and Android, providing an immersive visual experience with autoplay videos.</p>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className="feature-card glass-panel">
            <div className="feature-icon"><BarChart3 color="var(--accent-gold)" size={32} /></div>
            <h3>Guest CRM</h3>
            <p>Capture guest profiles via social login and track every interaction. Run targeted marketing campaigns easily.</p>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className="feature-card glass-panel">
            <div className="feature-icon"><Globe color="var(--accent-gold)" size={32} /></div>
            <h3>Multilingual</h3>
            <p>Supports 50+ languages and 70+ currencies. The menu automatically opens in the guest's phone language.</p>
          </motion.div>
        </div>
      </section>
      
      {/* Dark divider section */}
      <div className="divider"></div>
    </div>
  );
};

export default Home;
