import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Don't show navbar in the actual QR Menu guest app
  if (location.pathname.startsWith('/menu/')) return null;

  return (
    <nav className="navbar glass-panel">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <span className="text-gradient">Lumina</span>Menu
        </Link>
        
        <div className="nav-links desktop-only">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/qr-menu" className={location.pathname === '/qr-menu' ? 'active' : ''}>QR Menu</Link>
          <Link to="/connect-online-delivery-portals-to-pos" className={location.pathname === '/connect-online-delivery-portals-to-pos' ? 'active' : ''}>POS Connect</Link>
          <Link to="/pricing">Pricing</Link>
        </div>

        <div className="nav-actions desktop-only">
          <Link to="/login" className="btn-outline" style={{marginRight: '1rem', padding: '8px 16px', fontSize: '0.9rem'}}>Sign In</Link>
          <Link to="/login" className="btn-primary" style={{padding: '8px 16px', fontSize: '0.9rem'}}>Start Free</Link>
        </div>

        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
        </button>
      </div>

      {isOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setIsOpen(false)}>Home <ChevronRight size={16} /></Link>
          <Link to="/qr-menu" onClick={() => setIsOpen(false)}>QR Menu <ChevronRight size={16} /></Link>
          <Link to="/connect-online-delivery-portals-to-pos" onClick={() => setIsOpen(false)}>POS Connect <ChevronRight size={16} /></Link>
          <Link to="/login" onClick={() => setIsOpen(false)}>Sign In <ChevronRight size={16} /></Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
