'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Bot, QrCode, ChefHat, BarChart3, Utensils, Users, ShieldCheck, Sparkles } from 'lucide-react';

const Logo = ({ className = 'h-10 w-10' }) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="ng" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24"/>
        <stop offset="60%" stopColor="#fb7185"/>
        <stop offset="100%" stopColor="#f43f5e"/>
      </linearGradient>
      <linearGradient id="ng2" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#0b0b0d"/>
        <stop offset="100%" stopColor="#1f2937"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#ng)"/>
    <rect x="6" y="6" width="52" height="52" rx="13" fill="url(#ng2)"/>
    {/* Stylised "N" with a fork accent */}
    <path d="M20 46 L20 18 L26 18 L40 38 L40 18 L46 18 L46 46 L40 46 L26 26 L26 46 Z" fill="url(#ng)"/>
    {/* fork tines */}
    <path d="M48 14 L48 22 M51 14 L51 22 M54 14 L54 22" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="51" cy="26" r="1.6" fill="#fbbf24"/>
  </svg>
);

const HERO = 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
const INTERIOR = 'https://images.pexels.com/photos/32399761/pexels-photo-32399761.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
const CHEF = 'https://images.unsplash.com/photo-1759521296047-89338c8e083d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwzfHxjaGVmJTIwc2VydmluZ3xlbnwwfHx8fDE3NzcyMDM1MDh8MA&ixlib=rb-4.1.0&q=85';
const DISH = 'https://images.pexels.com/photos/35420084/pexels-photo-35420084.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
const CAFE = 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxjYWZlJTIwdGFibGV8ZW58MHx8fHwxNzc3MjAzNTE2fDA&ixlib=rb-4.1.0&q=85';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur bg-black/50 border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-10 w-10"/>
            <div>
              <div className="font-bold tracking-tight text-lg">Netrik Shop</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">Restaurant OS</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </nav>
          <Link href="/login">
            <Button className="bg-amber-400 text-black hover:bg-amber-300 font-semibold">Login <ArrowRight className="ml-2 h-4 w-4"/></Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO} className="w-full h-full object-cover opacity-70" alt="hero"/>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-[#0b0b0d]"/>
        </div>
        <div className="relative container mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs uppercase tracking-widest text-amber-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5"/> AI-powered Restaurant Suite
          </div>
          <h1 className="mt-8 text-5xl md:text-7xl font-black tracking-tight leading-[1.05] drop-shadow-2xl">
            Run your restaurant like
            <span className="block bg-gradient-to-r from-amber-300 via-rose-400 to-amber-300 bg-clip-text text-transparent">a five-star empire.</span>
          </h1>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/login"><Button size="lg" className="bg-amber-400 text-black hover:bg-amber-300 font-semibold h-12 px-8 shadow-2xl shadow-amber-400/30">Get Started <ArrowRight className="ml-2 h-4 w-4"/></Button></Link>
            <a href="#features"><Button size="lg" variant="outline" className="h-12 px-8 border-white/30 bg-white/10 backdrop-blur text-white hover:bg-white/20">See features</Button></a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-amber-300 text-xs uppercase tracking-[0.3em]">Everything you need</div>
          <h2 className="mt-4 text-4xl md:text-5xl font-black">A premium toolkit for premium restaurants</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {[
            { i: <Bot className="h-6 w-6"/>, t: 'AI Waiter Bot', d: 'Customers scan a QR, chat with an AI that takes orders, suggests dishes, handles allergies & spice levels — bilingual.', img: DISH },
            { i: <QrCode className="h-6 w-6"/>, t: 'QR Table Ordering', d: 'Generate printable QR codes per table. Status updates live to Available / Occupied / Paid.', img: CAFE },
            { i: <ChefHat className="h-6 w-6"/>, t: 'Kitchen Tickets', d: 'Real-time bilingual (EN/ES) tickets streamed to chef screens or printers.', img: CHEF },
            { i: <BarChart3 className="h-6 w-6"/>, t: 'Live Analytics', d: 'Beautiful dashboards: revenue trends, top-selling items, table turnover, downloadable CSV.', img: INTERIOR },
            { i: <Utensils className="h-6 w-6"/>, t: 'Smart Menu', d: 'Add dishes with photos, mark availability instantly, customers see updates in real time.', img: DISH },
            { i: <Users className="h-6 w-6"/>, t: 'Multi-tenant', d: 'One central admin, unlimited restaurants. Each gets a branded panel — “X Restaurant by Netrik Shop”.', img: INTERIOR },
          ].map((f) => (
            <Card key={f.t} className="bg-white/5 border-white/10 overflow-hidden group hover:bg-white/[0.07] transition-colors">
              <div className="h-40 overflow-hidden">
                <img src={f.img} alt={f.t} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
              </div>
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-xl bg-amber-400/20 text-amber-300 grid place-items-center mb-4">{f.i}</div>
                <div className="text-lg font-semibold text-white">{f.t}</div>
                <p className="mt-2 text-sm text-white/60">{f.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 bg-gradient-to-b from-transparent to-white/[0.02] border-y border-white/10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-amber-300 text-xs uppercase tracking-[0.3em]">How it works</div>
            <h2 className="mt-4 text-4xl md:text-5xl font-black">Live in 5 minutes</h2>
          </div>
          <div className="mt-14 grid md:grid-cols-4 gap-6">
            {[
              ['01', 'Onboard', 'Central admin adds your restaurant, generates manager & chef credentials.'],
              ['02', 'Setup menu & tables', 'Manager adds dishes and tables. QR codes are auto-generated.'],
              ['03', 'Print & place', 'Print QR codes and stick them on each table.'],
              ['04', 'Sit back', 'Customers scan, chat, order and pay. You watch the analytics.'],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl border border-white/10 bg-black/40 p-6">
                <div className="text-amber-300 text-sm font-mono">{n}</div>
                <div className="mt-2 text-xl font-bold">{t}</div>
                <p className="text-sm text-white/60 mt-2">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="container mx-auto px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-br from-amber-400/10 via-rose-500/5 to-transparent p-12">
          <ShieldCheck className="h-10 w-10 mx-auto text-amber-300"/>
          <h2 className="mt-6 text-4xl font-black">Ready to power your restaurant?</h2>
          <p className="mt-4 text-white/60">Two-tap login. Bilingual kitchen. AI waiter. Built for scale.</p>
          <Link href="/login"><Button size="lg" className="mt-8 bg-amber-400 text-black hover:bg-amber-300 font-semibold h-12 px-10">Login to dashboard <ArrowRight className="ml-2 h-4 w-4"/></Button></Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-white/40">
        © {new Date().getFullYear()} Netrik Shop · Restaurant OS
      </footer>
    </div>
  );
}
