import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [loginMode, setLoginMode] = useState<'central' | 'staff'>('central');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-gold-light) 0%, transparent 70%)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', zIndex: 0 }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{ width: '100%', maxWidth: '420px', padding: '40px', zIndex: 1, position: 'relative' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            <span className="text-gradient">NETRIK</span> SHOP
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {loginMode === 'central' ? 'Central Login' : 'Staff Login'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            className={loginMode === 'central' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setLoginMode('central')}
            style={{ width: '100%', padding: '10px 14px' }}
          >
            Central Login
          </button>
          <button
            type="button"
            className={loginMode === 'staff' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setLoginMode('staff')}
            style={{ width: '100%', padding: '10px 14px' }}
          >
            Staff Login
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
             <Mail size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
             <input type="email" placeholder="Email Address" style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '1rem', outline: 'none' }} />
          </div>
          <div style={{ position: 'relative' }}>
             <Lock size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
             <input type="password" placeholder="Password" style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '1rem', outline: 'none' }} />
          </div>

          <div style={{ textAlign: 'right' }}><a href="#" style={{ fontSize: '0.9rem', color: 'var(--accent-gold)' }}>Forgot Password?</a></div>

          <button className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {loginMode === 'central' ? 'Sign In Central' : 'Sign In Staff'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0', gap: '16px' }}>
           <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
           <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Or continue with</span>
           <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
           <button className="btn-outline" style={{ flex: 1, padding: '10px' }}>Google</button>
           <button className="btn-outline" style={{ flex: 1, padding: '10px' }}>Apple</button>
        </div>

        <p style={{textAlign: 'center', marginTop: '20px'}}>
             <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'underline'}}>Back to Home</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
