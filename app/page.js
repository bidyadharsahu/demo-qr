'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Sparkles, ShieldCheck, PlayCircle } from 'lucide-react';
import { NetrikLogo } from '@/components/netrik-logo';

const HERO = 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
const INTERIOR = 'https://images.pexels.com/photos/32399761/pexels-photo-32399761.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
const CHEF = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';
const DISH = 'https://images.pexels.com/photos/35420084/pexels-photo-35420084.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
const TABLE = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80';

const FEATURES = [
  { t: 'AI Waiter with Memory', d: 'A conversational waiter that remembers allergies, preferences, and nudges payment smoothly.', img: 'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?auto=format&fit=crop&w=800&q=80' },
  { t: 'Visual Menu Studio', d: 'Photos + videos + rich descriptions, auto-updated from manager edits in seconds.', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80' },
  { t: 'Realtime UPI + Bills', d: 'Instant payment references, live status tags, and downloadable receipts.', img: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80' },
  { t: 'Kitchen Command', d: 'Live bilingual tickets with status actions for chefs and runners.', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80' },
  { t: 'Operations Cockpit', d: 'Central admin and per-restaurant analytics with exports and trend charts.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80' },
  { t: 'Multi-tenant Ready', d: 'Run multiple restaurants with isolated dashboards and data controls.', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80' },
];

const STEPS = [
  { n: '01', t: 'Onboard', d: 'Central admin adds the restaurant and credentials.' },
  { n: '02', t: 'Build menu', d: 'Manager uploads visuals and availability in seconds.' },
  { n: '03', t: 'Go live', d: 'Guests scan, chat, order, pay, and review.' },
];

export default function Home() {
  return (
    <div className="landing-root min-h-screen text-white">
      <header className="landing-nav sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <NetrikLogo className="h-10 w-10"/>
            <div>
              <div className="text-lg font-semibold tracking-tight">Netrik Shop</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-300/80">Restaurant OS</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">Workflow</a>
            <a href="#pricing" className="hover:text-white">Launch</a>
          </nav>
          <Link href="/login">
            <Button className="bg-amber-400 text-black hover:bg-amber-300 font-semibold">Login <ArrowRight className="ml-2 h-4 w-4"/></Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="landing-gradient" />
            <img src={HERO} alt="hero" className="absolute inset-0 w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050608]/60 via-[#050608]/80 to-[#050608]" />
            <div className="landing-orb landing-orb-1" />
            <div className="landing-orb landing-orb-2" />
          </div>
          <div className="relative container mx-auto px-6 pt-20 pb-20 lg:pt-28 lg:pb-28">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-emerald-200">
                  <Sparkles className="h-3 w-3"/> realtime restaurant OS
                </div>
                <h1 className="landing-display text-5xl md:text-7xl leading-[1.02]">
                  A cinematic QR dining flow that feels premium, fast, and alive.
                </h1>
                <p className="text-lg text-white/70 max-w-xl">
                  Turn every table into a concierge experience: visual menu previews, AI ordering, realtime UPI payments, and instant kitchen updates.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/login"><Button size="lg" className="bg-amber-400 text-black hover:bg-amber-300 font-semibold h-12 px-8">Launch dashboard <ArrowRight className="ml-2 h-4 w-4"/></Button></Link>
                  <Button size="lg" variant="outline" className="border-white/20 text-white/80 hover:bg-white/10 h-12 px-8">Book a walkthrough</Button>
                </div>
                <div className="grid grid-cols-3 gap-6 max-w-lg">
                  {[['5 min', 'Setup time'], ['+42%', 'Guest upsell'], ['24/7', 'Live monitoring']].map(([v, l]) => (
                    <div key={l} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-2xl font-bold">{v}</div>
                      <div className="text-xs uppercase tracking-wider text-white/50 mt-1">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="landing-card float-slow">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-emerald-200">Today</div>
                      <div className="text-2xl font-bold mt-1">Menu Highlights</div>
                    </div>
                    <div className="text-xs text-white/60">Table 4</div>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {[
                      { name: 'Truffle Pasta', price: '$18.50', img: DISH },
                      { name: 'Citrus Mint Cooler', price: '$6.00', img: CHEF },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
                        <img src={item.img} alt={item.name} className="h-12 w-12 rounded-lg object-cover"/>
                        <div className="flex-1">
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-xs text-white/50">Video + story preview</div>
                        </div>
                        <div className="text-amber-300 font-semibold">{item.price}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
                    <div className="text-sm">UPI payment live</div>
                    <div className="text-xs text-emerald-200">Ref: UPI-9JX2</div>
                  </div>
                </div>
                <div className="landing-card-secondary float-slower hidden md:block">
                  <img src={INTERIOR} alt="Interior" className="h-44 w-full rounded-2xl object-cover"/>
                  <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                    <span>Realtime occupancy</span>
                    <span className="inline-flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5"/> Live feed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="container mx-auto px-6 py-24">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-emerald-300 text-xs uppercase tracking-[0.3em]">Everything you need</div>
            <h2 className="landing-display text-4xl md:text-5xl mt-4">Designed for restaurants that move fast</h2>
            <p className="text-white/60 mt-4">From menu visuals to payments, every module is realtime and built to scale across tenants.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.t} className="bg-white/5 border-white/10 overflow-hidden group hover:bg-white/[0.08] transition-colors">
                <div className="h-44 overflow-hidden">
                  <img src={f.img} alt={f.t} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                </div>
                <CardContent className="p-6">
                  <div className="text-lg font-semibold text-white">{f.t}</div>
                  <p className="mt-2 text-sm text-white/60">{f.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 pb-24">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center">
            <div className="rounded-3xl overflow-hidden border border-white/10">
              <img src={TABLE} alt="Table" className="w-full h-full object-cover"/>
            </div>
            <div className="space-y-6">
              <div className="text-emerald-300 text-xs uppercase tracking-[0.3em]">Guest experience</div>
              <h3 className="landing-display text-4xl">Menus that feel alive</h3>
              <p className="text-white/70">Show rich visuals, video previews, and contextual suggestions in chat. Guests add to cart in seconds and see payment status tags in real time.</p>
              <div className="flex flex-wrap gap-3">
                {['Photos + video', 'AR-ready layout', 'Instant availability'].map((tag) => (
                  <div key={tag} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-wider text-white/70">{tag}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="py-24 border-y border-white/10 bg-gradient-to-b from-transparent to-white/[0.03]">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-emerald-300 text-xs uppercase tracking-[0.3em]">Workflow</div>
              <h2 className="landing-display text-4xl md:text-5xl mt-4">Launch in a morning, scale for years</h2>
            </div>
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              {STEPS.map((step) => (
                <div key={step.n} className="rounded-3xl border border-white/10 bg-black/50 p-6">
                  <div className="text-emerald-300 text-sm font-mono">{step.n}</div>
                  <div className="mt-3 text-xl font-semibold">{step.t}</div>
                  <p className="mt-2 text-sm text-white/60">{step.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="container mx-auto px-6 py-24 text-center">
          <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-400/10 via-amber-400/10 to-transparent p-12">
            <ShieldCheck className="h-10 w-10 mx-auto text-emerald-300"/>
            <h2 className="landing-display text-4xl mt-6">Ready for a production-grade launch?</h2>
            <p className="mt-4 text-white/60">Realtime sync, multi-tenant scaling, and a premium guest flow built for up to 5 restaurants on day one.</p>
            <Link href="/login"><Button size="lg" className="mt-8 bg-amber-400 text-black hover:bg-amber-300 font-semibold h-12 px-10">Login to dashboard <ArrowRight className="ml-2 h-4 w-4"/></Button></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-white/40">
        © {new Date().getFullYear()} Netrik Shop · Restaurant OS
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .landing-root {
          background: #050608;
          font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
        }
        .landing-display {
          font-family: 'Fraunces', 'Times New Roman', serif;
        }
        .landing-nav {
          background: rgba(5, 6, 8, 0.7);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .landing-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.25), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.2), transparent 45%),
            radial-gradient(circle at 50% 80%, rgba(14, 165, 233, 0.15), transparent 55%);
        }
        .landing-orb {
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 999px;
          filter: blur(80px);
          opacity: 0.5;
        }
        .landing-orb-1 {
          top: -80px;
          left: -80px;
          background: rgba(16, 185, 129, 0.4);
        }
        .landing-orb-2 {
          bottom: -120px;
          right: -60px;
          background: rgba(245, 158, 11, 0.35);
        }
        .landing-card {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(8, 10, 14, 0.85);
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
        }
        .landing-card-secondary {
          position: absolute;
          right: -10px;
          bottom: -40px;
          width: 70%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(8, 10, 14, 0.9);
          border-radius: 24px;
          padding: 18px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
        }
        .float-slow {
          animation: float 12s ease-in-out infinite;
        }
        .float-slower {
          animation: float 15s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
