import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();

  if (location.pathname.startsWith('/menu/')) return null;

  return (
    <footer className="app-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">NETRIK SHOP</p>
          <p className="footer-copy">Smart ordering and pricing platform for modern restaurants and hotels.</p>
        </div>

        <div>
          <p className="footer-title">Quick Links</p>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/qr-menu">QR Menu</Link>
            <Link to="/connect-online-delivery-portals-to-pos">POS Connect</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>

        <div>
          <p className="footer-title">Contact</p>
          <p className="footer-copy">support@netrikshop.com</p>
          <p className="footer-copy">+91 90000 00000</p>
          <p className="footer-copy">India</p>
        </div>
      </div>

      <div className="container footer-bottom">© {new Date().getFullYear()} NETRIK SHOP. All rights reserved.</div>
    </footer>
  );
};

export default Footer;
