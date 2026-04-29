'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, QrCode, MessagesSquare, ChefHat, Activity, Volume2, VolumeX } from 'lucide-react';
import { NetrikLogo } from '@/components/netrik-logo';

// Background hero video sources (Pexels CDN, royalty-free)
const HERO_VIDEO_PRIMARY = 'https://videos.pexels.com/video-files/4253920/4253920-hd_1920_1080_25fps.mp4';
const HERO_VIDEO_FALLBACK = 'https://videos.pexels.com/video-files/2620043/2620043-hd_1920_1080_30fps.mp4';
const HERO_POSTER = 'https://images.pexels.com/photos/32399761/pexels-photo-32399761.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1600';

// Curated imagery (warm, cinematic restaurant)
const IMG_INTERIOR = 'https://images.pexels.com/photos/32399761/pexels-photo-32399761.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400';
const IMG_DISH = 'https://images.pexels.com/photos/23644633/pexels-photo-23644633.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400';
const IMG_CHEF = 'https://images.pexels.com/photos/36430074/pexels-photo-36430074.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400';
const IMG_KITCHEN = 'https://images.pexels.com/photos/36430075/pexels-photo-36430075.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400';
const IMG_DINER = 'https://images.pexels.com/photos/30238704/pexels-photo-30238704.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400';
const IMG_QR = 'https://images.pexels.com/photos/10032377/pexels-photo-10032377.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400';

const STEPS = [
  {
    n: '01',
    icon: QrCode,
    t: 'Scan the table QR',
    d: 'Every table carries a unique code. Guests scan it with their phone — no app, no signup. The chat opens instantly.',
  },
  {
    n: '02',
    icon: MessagesSquare,
    t: 'Chat with the AI Waiter',
    d: 'A warm, intelligent waiter that understands cravings, allergies and spice levels — and quietly takes the order in a single conversation.',
  },
  {
    n: '03',
    icon: ChefHat,
    t: 'Live ticket to the kitchen',
    d: 'The moment the order is placed, the chef sees it on screen. Status flows back to the guest in realtime — preparing, ready, served.',
  },
  {
    n: '04',
    icon: Activity,
    t: 'Manager sees everything live',
    d: 'Tables, orders, payments, kitchen — one calm dashboard. Every action across every table updates instantly.',
  },
];

const GALLERY = [IMG_INTERIOR, IMG_DISH, IMG_CHEF, IMG_KITCHEN, IMG_DINER, IMG_QR];

export default function Home() {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Reveal-on-scroll
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Scroll state for nav
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Ensure autoplay works on mobile
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
  }, []);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div className="netrik-root min-h-screen text-white">
      {/* NAV */}
      <header className={`netrik-nav fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <NetrikLogo className="h-9 w-9" />
            <div>
              <div className="text-[15px] font-medium tracking-[0.18em] uppercase">Netrik Shop</div>
              <div className="text-[9px] uppercase tracking-[0.4em] text-amber-200/70">Restaurant OS</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-[11px] uppercase tracking-[0.32em] text-white/60">
            <a href="#story" className="hover:text-amber-200 transition">Story</a>
            <a href="#flow" className="hover:text-amber-200 transition">Flow</a>
            <a href="#live" className="hover:text-amber-200 transition">Live</a>
            <a href="#gallery" className="hover:text-amber-200 transition">Gallery</a>
          </nav>
          <Link href="/login">
            <Button className="bg-amber-300 text-black hover:bg-amber-200 font-medium tracking-[0.18em] uppercase text-[11px] h-10 px-5 rounded-full">
              Enter <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* HERO with background video */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={HERO_POSTER}
        >
          <source src={HERO_VIDEO_PRIMARY} type="video/mp4" />
          <source src={HERO_VIDEO_FALLBACK} type="video/mp4" />
        </video>

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black" />
        <div className="absolute inset-0 hero-vignette" />
        <div className="absolute inset-0 hero-grain pointer-events-none" />

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          aria-label="Toggle sound"
          className="absolute right-6 bottom-6 z-20 h-11 w-11 rounded-full border border-white/20 bg-black/40 backdrop-blur flex items-center justify-center text-white/80 hover:text-amber-200 hover:border-amber-200/40 transition"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Hero content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div data-reveal className="reveal">
            <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] text-amber-200/80 mb-8">
              <span className="h-px w-8 bg-amber-200/60" />
              Realtime Restaurant OS
              <span className="h-px w-8 bg-amber-200/60" />
            </div>
          </div>

          <h1 className="netrik-display text-[14vw] sm:text-[10vw] md:text-[8.5vw] lg:text-[7.5vw] leading-[0.95] max-w-6xl mx-auto">
            <span className="block hero-line">Scan. Sit.</span>
            <span className="block hero-line hero-line-delay text-amber-200 italic font-light">Savour.</span>
          </h1>

          <p data-reveal className="reveal reveal-delay-2 mt-10 max-w-xl text-base md:text-lg text-white/75 font-light leading-relaxed">
            One QR on every table. A warm AI waiter that knows your menu by heart.
            Orders that fly to the kitchen — and a manager who sees it all, live.
          </p>

          <div data-reveal className="reveal reveal-delay-3 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-amber-300 text-black hover:bg-amber-200 font-medium tracking-[0.18em] uppercase text-[12px] h-12 px-8 rounded-full">
                Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#flow">
              <Button size="lg" variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-amber-200 font-medium tracking-[0.18em] uppercase text-[12px] h-12 px-8 rounded-full">
                See the flow
              </Button>
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
            <div className="text-[9px] uppercase tracking-[0.4em]">Scroll</div>
            <div className="scroll-line" />
          </div>
        </div>
      </section>

      {/* STORY — short, classy, on-message */}
      <section id="story" className="relative py-28 md:py-36 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div data-reveal className="reveal">
            <div className="text-[10px] uppercase tracking-[0.5em] text-amber-200/80 mb-6">The idea</div>
            <h2 className="netrik-display text-4xl md:text-6xl leading-[1.05]">
              A restaurant should feel like <em className="text-amber-200">a conversation</em>,
              not a queue at the counter.
            </h2>
            <p className="mt-8 text-white/65 text-lg max-w-3xl mx-auto leading-relaxed font-light">
              Netrik Shop turns every table into its own little universe. The guest scans,
              chats with the AI waiter, watches the order move through the kitchen — all in
              realtime. The restaurant runs on one calm screen.
            </p>
          </div>
        </div>

        {/* Decorative hairlines */}
        <div className="netrik-hairline-top" />
        <div className="netrik-hairline-bottom" />
      </section>

      {/* FLOW — 4 steps, the actual business model */}
      <section id="flow" className="relative py-24 md:py-32 px-6 bg-[#0a0907]">
        <div className="container mx-auto max-w-6xl">
          <div data-reveal className="reveal text-center mb-16">
            <div className="text-[10px] uppercase tracking-[0.5em] text-amber-200/80 mb-4">How it works</div>
            <h2 className="netrik-display text-4xl md:text-5xl">From scan to served — in one flow.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.n}
                  data-reveal
                  className={`reveal step-card group ${i % 2 ? 'md:translate-y-10' : ''}`}
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <div className="flex items-start gap-5">
                    <div className="step-icon">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-200/80 text-xs tracking-[0.4em]">STEP {s.n}</span>
                        <span className="h-px flex-1 ml-4 bg-gradient-to-r from-amber-200/30 to-transparent" />
                      </div>
                      <h3 className="netrik-display text-2xl md:text-3xl mt-3">{s.t}</h3>
                      <p className="mt-3 text-white/60 leading-relaxed font-light">{s.d}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SPLIT — guest experience visual */}
      <section className="relative py-24 md:py-32 px-6">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div data-reveal className="reveal relative aspect-[4/5] overflow-hidden rounded-sm group">
            <img src={IMG_QR} alt="Scan QR at table" className="w-full h-full object-cover image-soft-zoom" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="text-amber-200 text-[10px] uppercase tracking-[0.4em]">The guest side</div>
              <div className="netrik-display text-3xl md:text-4xl mt-2 leading-tight">No app. No wait. Just scan.</div>
            </div>
          </div>

          <div className="space-y-7">
            <div data-reveal className="reveal">
              <div className="text-[10px] uppercase tracking-[0.5em] text-amber-200/80 mb-4">Guest experience</div>
              <h3 className="netrik-display text-4xl md:text-5xl leading-[1.08]">
                A waiter who never <em className="text-amber-200">forgets</em>.
              </h3>
            </div>
            <p data-reveal className="reveal text-white/70 text-lg leading-relaxed font-light">
              The AI waiter remembers allergies, spice preferences, and what the table loved last time.
              It explains dishes, suggests pairings, and quietly turns the chat into a complete order.
            </p>
            <ul className="space-y-3">
              {[
                'Bilingual menu, instant translations',
                'Live status — preparing, ready, served',
                'Add-ons mid-meal without flagging anyone down',
                'Pay straight from the chat, then leave a review',
              ].map((tag, i) => (
                <li
                  key={tag}
                  data-reveal
                  className="reveal flex items-center gap-3 text-white/75"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <span className="h-px w-6 bg-amber-200/60" />
                  <span className="font-light tracking-wide">{tag}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* LIVE — restaurant side */}
      <section id="live" className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={IMG_KITCHEN} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black" />
        </div>

        <div className="container mx-auto max-w-6xl">
          <div data-reveal className="reveal text-center mb-16">
            <div className="text-[10px] uppercase tracking-[0.5em] text-amber-200/80 mb-4">The restaurant side</div>
            <h2 className="netrik-display text-4xl md:text-6xl leading-[1.05]">
              Every table, every order, <span className="italic text-amber-200">live</span>.
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-white/65 text-lg font-light">
              The chef sees tickets the second a guest taps send. The manager sees revenue,
              tables and kitchen status moving in realtime — no refresh, no delay.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { t: 'Kitchen Tickets', d: 'Bilingual tickets fly in instantly. Chefs advance status with a tap.', img: IMG_CHEF },
              { t: 'Manager Cockpit', d: 'Tables, orders, menu, analytics — one calm screen, always live.', img: IMG_INTERIOR },
              { t: 'Realtime Data', d: 'Revenue, average ticket and table turnover update as guests order.', img: IMG_DINER },
            ].map((c, i) => (
              <div
                key={c.t}
                data-reveal
                className="reveal live-card group"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="overflow-hidden">
                  <img src={c.img} alt={c.t} className="w-full h-72 object-cover image-soft-zoom" />
                </div>
                <div className="p-6">
                  <div className="netrik-display text-xl">{c.t}</div>
                  <p className="mt-2 text-sm text-white/55 font-light leading-relaxed">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY MARQUEE */}
      <section id="gallery" className="relative py-20 md:py-28 overflow-hidden">
        <div data-reveal className="reveal text-center mb-12 px-6">
          <div className="text-[10px] uppercase tracking-[0.5em] text-amber-200/80 mb-4">Moments</div>
          <h2 className="netrik-display text-4xl md:text-5xl">A premium feel. Every service.</h2>
        </div>
        <div className="marquee">
          <div className="marquee-track">
            {[...GALLERY, ...GALLERY].map((src, i) => (
              <div key={i} className="marquee-item">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-28 md:py-36">
        <div data-reveal className="reveal container mx-auto max-w-3xl text-center">
          <h2 className="netrik-display text-4xl md:text-6xl leading-[1.05]">
            Ready when your <em className="text-amber-200">first guest</em> sits down?
          </h2>
          <p className="mt-6 text-white/65 text-lg font-light">
            Login, add your restaurant, print the QR cards — and you’re live tonight.
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-amber-300 text-black hover:bg-amber-200 font-medium tracking-[0.2em] uppercase text-[12px] h-12 px-10 rounded-full">
                Enter Netrik <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs uppercase tracking-[0.32em] text-white/40">
          <div className="flex items-center gap-3">
            <NetrikLogo className="h-6 w-6" />
            <span>Netrik Shop · Restaurant OS</span>
          </div>
          <div>© {new Date().getFullYear()} — Crafted for hospitality.</div>
        </div>
      </footer>

      {/* Theme + animation styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

        .netrik-root {
          background: #06050a;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          letter-spacing: 0.005em;
        }
        .netrik-display {
          font-family: 'Cormorant Garamond', 'Times New Roman', serif;
          font-weight: 500;
          letter-spacing: -0.01em;
        }

        /* NAV */
        .netrik-nav {
          background: linear-gradient(to bottom, rgba(6, 5, 10, 0.55), rgba(6, 5, 10, 0));
          transition: background 0.5s ease, border-color 0.5s ease, backdrop-filter 0.5s ease;
        }
        .netrik-nav.is-scrolled {
          background: rgba(6, 5, 10, 0.78);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* HERO LINES */
        .hero-line {
          opacity: 0;
          transform: translateY(40px);
          filter: blur(10px);
          animation: heroLine 1.1s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
        }
        .hero-line-delay { animation-delay: 0.35s; }
        @keyframes heroLine {
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        /* HERO OVERLAYS */
        .hero-vignette {
          background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 80%);
        }
        .hero-grain {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>");
          opacity: 0.06;
          mix-blend-mode: overlay;
        }
        .scroll-line {
          width: 1px;
          height: 42px;
          background: linear-gradient(to bottom, rgba(252, 211, 77, 0.8), transparent);
          animation: scrollPulse 2.4s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { transform: scaleY(0.4); transform-origin: top; opacity: 0.4; }
          50% { transform: scaleY(1); transform-origin: top; opacity: 1; }
        }

        /* REVEAL */
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.95s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.95s cubic-bezier(0.2, 0.7, 0.2, 1);
        }
        .reveal.is-visible { opacity: 1; transform: translateY(0); }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.4s; }

        /* HAIRLINES */
        .netrik-hairline-top, .netrik-hairline-bottom {
          position: absolute; left: 50%; transform: translateX(-50%);
          width: 1px; height: 60px;
          background: linear-gradient(to bottom, transparent, rgba(252, 211, 77, 0.45), transparent);
        }
        .netrik-hairline-top { top: 0; }
        .netrik-hairline-bottom { bottom: 0; }

        /* STEP CARD */
        .step-card {
          padding: 28px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border-radius: 6px;
          transition: border-color 0.5s ease, background 0.5s ease, transform 0.5s ease;
        }
        .step-card:hover {
          border-color: rgba(252, 211, 77, 0.35);
          background: linear-gradient(180deg, rgba(252, 211, 77, 0.04), rgba(255,255,255,0.01));
        }
        .step-icon {
          height: 46px; width: 46px; flex: none;
          border-radius: 999px;
          border: 1px solid rgba(252, 211, 77, 0.4);
          color: rgb(252, 211, 77);
          display: flex; align-items: center; justify-content: center;
          background: rgba(252, 211, 77, 0.06);
        }

        /* IMAGE ZOOM */
        .image-soft-zoom { transition: transform 1.5s cubic-bezier(0.2, 0.7, 0.2, 1); }
        .group:hover .image-soft-zoom { transform: scale(1.05); }

        /* LIVE CARD */
        .live-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(10, 9, 7, 0.7);
          backdrop-filter: blur(8px);
          border-radius: 4px;
          overflow: hidden;
          transition: border-color 0.5s ease, transform 0.5s ease;
        }
        .live-card:hover {
          border-color: rgba(252, 211, 77, 0.35);
          transform: translateY(-4px);
        }

        /* MARQUEE */
        .marquee { width: 100%; overflow: hidden; mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); }
        .marquee-track {
          display: flex; gap: 20px;
          width: max-content;
          animation: marquee 38s linear infinite;
        }
        .marquee-item {
          flex: none;
          width: 360px; height: 240px;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal, .hero-line { opacity: 1; transform: none; filter: none; animation: none; transition: none; }
          .marquee-track { animation: none; }
          .scroll-line { animation: none; }
        }
      `}</style>
    </div>
  );
}
