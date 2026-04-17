import { motion } from 'framer-motion';
import { 
  QrCode, Smartphone, BarChart3, Globe, 
  Layout, Users, Megaphone, Truck, 
  MessageSquare, Wallet, Award, Bot, 
  Gift, CreditCard, Calendar, MessageCircle, 
  Link2, Info, Bitcoin, Star, 
  Accessibility, ShoppingBag, ArrowRight, Play
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const features = [
    { icon: Layout, title: "Multiple Menu Layouts", description: "Custom Design your Menu! Customize to match your brand's aesthetics." },
    { icon: Smartphone, title: "Tablet Menus", description: "Digital eMenus with autoplay videos. Collect fast guest feedback seamlessly." },
    { icon: Users, title: "Social Login", description: "Capture Guest Profile! Guests share contact details via Facebook, Google, or Apple ID." },
    { icon: BarChart3, title: "Guest CRM", description: "Records every interaction with the guest, including 'Last Visit' automatically." },
    { icon: Megaphone, title: "Campaigns", description: "Run Campaigns to Increase Sales! Trigger Pop Ups, Promo Videos based on guest action." },
    { icon: Truck, title: "Online Delivery & Pick-up Menu", description: "With 0% commission! Accept direct online delivery and takeaways easily." },
    { icon: MessageSquare, title: "SMS & WhatsApp Marketing", description: "Increase REPEAT Footfall! Filter guests based on behavior and send targeted messages." },
    { icon: Wallet, title: "DigitalStamp Cards", description: "Now in Apple & Google Wallet. Motivate guests to share contact details." },
    { icon: Award, title: "Loyalty", description: "Loyalty & Cash Back Feature! Increase brand loyalty and drive repeat orders." },
    { icon: Bot, title: "AI-POWERED", description: "Menu Description Generator. Generate descriptive, engaging, and informative text." },
    { icon: Gift, title: "Gift Vouchers", description: "Digital Gift Cards! Convert regulars into brand ambassadors instantly." },
    { icon: CreditCard, title: "Pay at Table", description: "Pay Now or Pay Later! Enhance the dining experience with quick bill settlement." },
    { icon: Calendar, title: "Reservations", description: "Accept Restaurant Reservations with a complete module and table management integration." },
    { icon: Globe, title: "Multilingual & Multi-Currency", description: "50+ Languages & 70+ Currencies. Changes currency based on guest preference." },
    { icon: MessageCircle, title: "Chat", description: "Chat with your guests! Guests can message from within the Menu to staff." },
    { icon: Link2, title: "Integration", description: "Connect with over 300+ POS platforms and Payment Gateway solutions." },
    { icon: Info, title: "Nutrition Facts", description: "Detailed Nutrition Information! Calorie counts, macronutrients, and allergen information." },
    { icon: Bitcoin, title: "CRYPTO Payments", description: "Your Guests Can Now Pay With CRYPTO! Leading the way in settlement innovation." },
    { icon: Star, title: "Guest Feedback", description: "Collect Guest Feedback automatically aligned with external third-party systems." },
    { icon: Smartphone, title: "My Menu Manager", description: "Receive Orders on the GO! Perfect for beachside, pool side, or room service." },
    { icon: Accessibility, title: "Accessibility Compliant", description: "WCAG 2.1 Compliant. Meets the needs of all guests accurately." },
    { icon: ShoppingBag, title: "Order, Pay & Collect", description: "Digital Signage to show Order Status. Perfect for QSRs or busy bars." },
  ];

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-overlay"></div>
        <img src="/hero_tablet_menu.png" alt="Luxury Tablet Menu" className="hero-bg-img" onError={(e) => {
           e.currentTarget.style.display = 'none';
        }}/>
        <div className="container hero-content">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="hero-badge glass-panel"
          >
            All-in-one menu platform for restaurants, bars, cafes, and hotels!
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-title"
          >
            Designed to <br />
            <span className="text-gradient">INCREASE</span> your sales by 30%
          </motion.h1>
          <motion.p
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.8, delay: 0.4 }}
             className="hero-subtitle"
          >
            Start receiving direct online orders with 0% commission. <br/> No APP required. Scan QR on mobile to see menu!
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hero-cta"
          >
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={18} fill="currentColor" /> Watch this NOW
            </button>
            <button className="btn-outline">Join Webinar</button>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="showcase-section container">
        <div className="showcase-card glass-panel flex-row">
            <div className="showcase-content">
                <h2>Showcase your food with beautiful photos and videos</h2>
                <p>The decision making on what to order is no longer driven by price but more driven by the way food is being presented. This guarantees an increase in your sales because your guests will be mesmerized by your food and will definitely be tempted to order more!</p>
                <div className="showcase-stats">
                  <div className="stat">
                     <h4>+30%</h4>
                     <span>Avg. Sale Increase</span>
                  </div>
                  <div className="stat">
                     <h4>0%</h4>
                     <span>Commission</span>
                  </div>
                </div>
            </div>
            <div className="showcase-media">
                <div className="media-placeholder">
                   <QrCode size={64} color="var(--accent-gold)" opacity={0.5} />
                   <div className="floating-card top-left"><Smartphone size={24} /> Tablet Native</div>
                   <div className="floating-card bottom-right"><QrCode size={24} /> No App Needed</div>
                </div>
            </div>
        </div>
      </section>

      {/* Comprehensive Feature Grid */}
      <section className="features-section container">
        <div className="section-header">
          <h2>Everything you need <br/><span className="text-gradient">in one platform</span></h2>
          <p>Discover our extensive suite of advanced features designed specifically for the hospitality industry.</p>
        </div>

        <div className="feature-grid-large">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="feature-card-modern glass-panel"
              >
                <div className="feature-icon-wrapper">
                  <Icon color="var(--accent-gold)" size={28} />
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.description}</p>
                <div className="card-hover-effect">
                    <ArrowRight size={16} color="var(--accent-gold)" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
            <div className="section-header">
            <h2>You are in <span className="text-gradient">Good Company!</span></h2>
            <p>Running in 4200+ restaurants and 450+ hotels across 70 countries.</p>
            </div>
            
            <div className="testimonials-grid">
                <div className="testimonial-card glass-panel">
                    <div className="stars">★★★★★</div>
                    <p>"Guests can now enjoy a menu copy on their personal device by scanning the restaurant’s QR code and without the need to download any app."</p>
                    <div className="author">
                        <strong>Floor Bleeker</strong>
                        <span>Group CTO, Accor</span>
                    </div>
                </div>
                <div className="testimonial-card glass-panel">
                    <div className="stars">★★★★★</div>
                    <p>"Achieved an impressive 15% increase in customer spending. Enhances the ability to showcase product quality effectively."</p>
                    <div className="author">
                        <strong>Steven Holloway</strong>
                        <span>Director, Sunset Hospitality</span>
                    </div>
                </div>
                <div className="testimonial-card glass-panel">
                    <div className="stars">★★★★★</div>
                    <p>"Extremely useful with high-end features. The backend is very simple that even a non-technical teammate can update content easily."</p>
                    <div className="author">
                        <strong>Meraj Mohammed</strong>
                        <span>Cluster IT Head, Rixos Hotels</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Dark divider section */}
      <div className="divider"></div>
    </div>
  );
};

export default Home;
