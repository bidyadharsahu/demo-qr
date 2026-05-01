'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUpRight, Volume2, VolumeX, QrCode, MessageSquare, ChefHat, BarChart3 } from 'lucide-react';
import { NetrikLogo } from '@/components/netrik-logo';

// Reliable public-CDN restaurant ambiance videos (with fallback chain)
const BG_VIDEOS = [
  'https://videos.pexels.com/video-files/4253170/4253170-hd_1920_1080_30fps.mp4',
  'https://videos.pexels.com/video-files/3196284/3196284-uhd_2560_1440_25fps.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-restaurant-tables-prepared-for-a-meal-4079-large.mp4',
];
const POSTER = 'https://images.unsplash.com/photo-1650490534612-d9ba46776916?auto=format&fit=crop&w=1920&q=80';
const INTERIOR_2 = 'https://images.unsplash.com/photo-1703793578040-07e1778b6b2c?auto=format&fit=crop&w=1600&q=80';
const CANDLE = 'https://images.unsplash.com/photo-1713026464108-c9929157ed55?auto=format&fit=crop&w=1400&q=80';
const PHONE_TABLE = 'https://images.pexels.com/photos/10032377/pexels-photo-10032377.jpeg?auto=compress&cs=tinysrgb&w=1400';

export default function Landing() {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [videoIdx, setVideoIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reveal-on-scroll for elements with .reveal
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleVideoError = () => {
    if (videoIdx < BG_VIDEOS.length - 1) setVideoIdx((i) => i + 1);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const STORY = [
    { n: '01', icon: <QrCode className="h-5 w-5" />, t: 'Scan', d: 'Guest scans the QR placed on the table.' },
    { n: '02', icon: <MessageSquare className="h-5 w-5" />, t: 'Chat & order', d: 'A warm AI waiter opens. Guests browse, ask, and order — all in chat.' },
    { n: '03', icon: <ChefHat className="h-5 w-5" />, t: 'Kitchen ticket', d: 'Order flies live to the kitchen with allergy, spice & notes attached.' },
    { n: '04', icon: <BarChart3 className="h-5 w-5" />, t: 'Manager sees it all', d: 'Tables, revenue, and orders update in realtime on the dashboard.' },
  ];

  return (
    <div className="netrik-landing min-h-screen text-white overflow-x-hidden">
      {/* ───────── NAV ───────── */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'bg-black/70 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl border border-amber-300/40 bg-gradient-to-br from-amber-300/20 to-amber-500/5 grid place-items-center text-amber-200 font-black text-sm tracking-tighter">NS</div>
              <div className="absolute -inset-0.5 rounded-xl bg-amber-300/20 blur-lg opacity-0 group-hover:opacity-60 transition" />
            </div>
            <div>
              <div className="text-[15px] font-bold tracking-[0.18em] uppercase">Netrik Shop</div>
              <div className="text-[9px] tracking-[0.4em] text-white/50 uppercase">Restaurant OS</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-12 text-[11px] tracking-[0.4em] uppercase text-white/70">
            <a href="#story" className="hover:text-amber-200 transition">Story</a>
            <a href="#flow" className="hover:text-amber-200 transition">Flow</a>
            <a href="#live" className="hover:text-amber-200 transition">Live</a>
          </nav>
          <Link href="/login">
            <Button className="rounded-full bg-amber-300 hover:bg-amber-200 text-black font-bold tracking-[0.25em] uppercase text-[11px] h-10 px-6">
              Enter <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* ───────── HERO ───────── */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background video */}
        <video
          ref={videoRef}
          key={BG_VIDEOS[videoIdx]}
          autoPlay
          loop
          muted
          playsInline
          poster={POSTER}
          onError={handleVideoError}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={BG_VIDEOS[videoIdx]} type="video/mp4" />
        </video>
        {/* Overlay layers */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black" />
        <div className="absolute inset-0 vignette" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <div className="inline-flex items-center gap-3 mb-8 reveal">
            <span className="h-px w-12 bg-amber-200/60" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-amber-100/80">Realtime Restaurant OS</span>
            <span className="h-px w-12 bg-amber-200/60" />
          </div>

          <h1 className="netrik-display leading-[0.95] reveal">
            <span className="block text-[clamp(56px,12vw,180px)] text-white">Scan. Sit.</span>
            <span className="block text-[clamp(56px,12vw,180px)] italic text-amber-300 -mt-2">Savour.</span>
          </h1>

          <p className="mt-10 text-base md:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed reveal">
            One QR on every table. A warm AI waiter that knows your menu by heart.<br className="hidden md:block"/> Orders fly to the kitchen — and a manager who sees it all, live.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-5 reveal">
            <Link href="/login">
              <Button size="lg" className="rounded-full bg-amber-300 hover:bg-amber-200 text-black font-bold tracking-[0.2em] uppercase text-[12px] h-14 px-9 shadow-2xl shadow-amber-300/20">
                Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#flow" className="group inline-flex items-center gap-3 rounded-full border border-white/30 hover:border-amber-300 hover:bg-amber-300/5 px-8 h-14 transition-all">
              <span className="text-[12px] tracking-[0.2em] uppercase font-semibold text-white group-hover:text-amber-200">See the flow</span>
              <ArrowUpRight className="h-4 w-4 text-white/70 group-hover:text-amber-200 group-hover:rotate-12 transition" />
            </a>
          </div>
        </div>

        {/* Mute toggle */}
        <button
          onClick={toggleMute}
          className="absolute bottom-7 right-6 z-20 h-11 w-11 rounded-full border border-white/20 bg-black/40 backdrop-blur grid place-items-center hover:bg-black/60 transition"
          aria-label="Toggle sound"
        >
          {muted ? <VolumeX className="h-4 w-4 text-white/80" /> : <Volume2 className="h-4 w-4 text-amber-200" />}
        </button>

        {/* Scroll indicator */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.5em] uppercase text-white/50 flex flex-col items-center gap-2">
          <span>Scroll</span>
          <span className="w-px h-8 bg-gradient-to-b from-white/60 to-transparent scroll-line" />
        </div>
      </section>

      {/* ───────── STORY ───────── */}
      <section id="story" className="relative py-32 px-6">
        <div className="absolute inset-0">
          <img src={INTERIOR_2} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
        </div>
        <div className="relative max-w-[1200px] mx-auto">
          <div className="text-center mb-20 reveal">
            <div className="text-[10px] tracking-[0.5em] uppercase text-amber-200/80 mb-5">— Our story —</div>
            <h2 className="netrik-display text-[clamp(36px,5vw,72px)] leading-[1.05]">
              Built for restaurants that<br/><span className="italic text-amber-300">move at the speed of a guest.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
            <div className="space-y-7 reveal">
              <p className="text-lg text-white/80 leading-relaxed">
                Netrik Shop is a complete operating system for the modern table. The guest scans a QR, an AI waiter opens, and from that moment everything — menu, order, kitchen ticket, payment, feedback — happens live, inside one chat.
              </p>
              <p className="text-lg text-white/80 leading-relaxed">
                There are no apps to download. No PDFs. No flagging down a server. Just a <span className="text-amber-200">warm conversation</span> that ends in a perfectly cooked dish — and a dashboard where you watch it all unfold.
              </p>
              <div className="grid grid-cols-3 gap-5 pt-6">
                {[['5 min', 'Setup'], ['100%', 'Realtime'], ['0', 'Apps to install']].map(([v, l]) => (
                  <div key={l} className="border-l border-amber-300/30 pl-4">
                    <div className="text-3xl netrik-display text-amber-300">{v}</div>
                    <div className="text-[10px] tracking-[0.3em] uppercase text-white/50 mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative reveal">
              <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-amber-300/20 via-transparent to-transparent blur-2xl opacity-60" />
              <div className="relative rounded-[24px] overflow-hidden border border-amber-200/20 shadow-2xl">
                <img src={PHONE_TABLE} alt="QR on table" className="w-full h-[520px] object-cover" />
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-black/55 backdrop-blur px-5 py-4">
                  <div className="text-[10px] tracking-[0.4em] uppercase text-amber-200/80">Live</div>
                  <div className="mt-1 text-sm font-semibold">Table 7 · Order placed</div>
                  <div className="text-xs text-white/60">Allergy: peanuts · Spice: medium</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FLOW ───────── */}
      <section id="flow" className="relative py-32 px-6 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20 reveal">
            <div className="text-[10px] tracking-[0.5em] uppercase text-amber-200/80 mb-5">— The flow —</div>
            <h2 className="netrik-display text-[clamp(36px,5vw,72px)] leading-[1.05]">
              Four steps. <span className="italic text-amber-300">Zero friction.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STORY.map((s, i) => (
              <div key={s.n} className="reveal group relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-7 hover:border-amber-300/40 hover:bg-amber-300/[0.03] transition-all duration-500" style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="absolute top-7 right-7 text-[11px] tracking-[0.3em] uppercase text-amber-200/40 group-hover:text-amber-200/90 transition">{s.n}</div>
                <div className="h-12 w-12 rounded-2xl border border-amber-300/30 bg-amber-300/5 grid place-items-center text-amber-200 mb-7">
                  {s.icon}
                </div>
                <div className="netrik-display text-2xl mb-2">{s.t}</div>
                <div className="text-sm text-white/60 leading-relaxed">{s.d}</div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── LIVE ───────── */}
      <section id="live" className="relative py-32 px-6">
        <div className="absolute inset-0">
          <img src={CANDLE} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
        </div>
        <div className="relative max-w-[1100px] mx-auto text-center">
          <div className="reveal">
            <div className="text-[10px] tracking-[0.5em] uppercase text-amber-200/80 mb-5">— Live —</div>
            <h2 className="netrik-display text-[clamp(36px,5vw,72px)] leading-[1.05]">
              Watch every table.<br/><span className="italic text-amber-300">In realtime.</span>
            </h2>
            <p className="mt-7 text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              Every QR scan, every order, every payment — the manager dashboard updates the moment it happens. The chef gets the ticket the second it lands.
            </p>
          </div>

          <div className="mt-14 reveal">
            <div className="inline-flex items-center gap-4 rounded-full border border-amber-200/30 bg-black/50 backdrop-blur px-2 py-2">
              <div className="flex items-center gap-2 px-4">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
                </span>
                <span className="text-[11px] tracking-[0.3em] uppercase text-white/80">Live now</span>
              </div>
              <Link href="/login">
                <Button className="rounded-full bg-amber-300 hover:bg-amber-200 text-black font-bold tracking-[0.2em] uppercase text-[11px] h-11 px-7">
                  Open Dashboard <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="relative border-t border-white/5 py-10 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] tracking-[0.3em] uppercase text-white/40">
          <div>© {new Date().getFullYear()} Netrik Shop · Restaurant OS</div>
          <div className="flex items-center gap-6">
            <a href="#story" className="hover:text-amber-200 transition">Story</a>
            <a href="#flow" className="hover:text-amber-200 transition">Flow</a>
            <Link href="/login" className="hover:text-amber-200 transition">Enter</Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        .netrik-landing { background: #050506; font-family: 'Inter', system-ui, sans-serif; }
        .netrik-display { font-family: 'Fraunces', 'Times New Roman', serif; font-weight: 600; letter-spacing: -0.02em; }
        .vignette {
          background: radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.6) 100%);
        }
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1);
        }
        .reveal-in {
          opacity: 1;
          transform: translateY(0);
        }
        .scroll-line {
          animation: scrollPulse 1.8s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { transform: scaleY(0.4); transform-origin: top; opacity: 0.4; }
          50% { transform: scaleY(1); transform-origin: top; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
