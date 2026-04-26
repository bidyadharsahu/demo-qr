'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, LogOut, Building2, Users, DollarSign, Activity, QrCode, Pencil, Trash2, Copy, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { NetrikLogo } from '@/components/netrik-logo';

const SUBSCRIPTIONS = ['Starter', 'Pro', 'Premium', 'Enterprise'];
const COLORS = ['#fbbf24', '#fb7185', '#34d399', '#60a5fa'];

export default function CentralAdmin() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [list, setList] = useState([]);
  const [stats, setStats] = useState({ totalRestaurants: 0, totalRevenue: 0, totalOrders: 0, mrr: 0, byPlan: [], trend: [] });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showCredsFor, setShowCredsFor] = useState(null);
  const [form, setForm] = useState({ name: '', ownerName: '', contact: '', address: '', domain: '', subscription: 'Pro' });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('netrik_user') || 'null');
    if (!u || u.type !== 'central') { router.push('/login'); return; }
    setMe(u);
    refresh();
  }, []);

  const refresh = async () => {
    const r = await fetch('/api/restaurants');
    const d = await r.json();
    setList(d.restaurants || []);
    const s = await fetch('/api/central/stats');
    setStats(await s.json());
  };

  const save = async () => {
    if (!form.name || !form.ownerName || !form.contact) return toast.error('Fill required fields');
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/restaurants/${editing.id}` : '/api/restaurants';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || 'Failed');
    toast.success(editing ? 'Restaurant updated' : 'Restaurant created');
    if (!editing && data.restaurant) {
      setShowCredsFor(data.restaurant);
    }
    setOpen(false); setEditing(null); setForm({ name: '', ownerName: '', contact: '', address: '', domain: '', subscription: 'Pro' });
    refresh();
  };

  const startEdit = (r) => {
    setEditing(r);
    setForm({ name: r.name, ownerName: r.ownerName, contact: r.contact, address: r.address || '', domain: r.domain || '', subscription: r.subscription });
    setOpen(true);
  };

  const remove = async (r) => {
    if (!confirm(`Delete ${r.name}? This cannot be undone.`)) return;
    await fetch(`/api/restaurants/${r.id}`, { method: 'DELETE' });
    toast.success('Deleted');
    refresh();
  };

  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied'); };

  if (!me) return null;

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <header className="border-b border-white/10 sticky top-0 bg-black/60 backdrop-blur z-30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NetrikLogo className="h-10 w-10"/>
            <div>
              <div className="font-bold">Central Admin</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">Netrik Shop · HQ</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-amber-400 text-black"><ShieldCheck className="h-3 w-3 mr-1"/> {me.userId}</Badge>
            <Button variant="ghost" className="text-white/70 hover:text-white" onClick={() => { localStorage.removeItem('netrik_user'); router.push('/login'); }}><LogOut className="h-4 w-4 mr-2"/>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* KPI cards */}
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { i: <Building2/>, t: 'Restaurants', v: stats.totalRestaurants, sub: 'active tenants' },
            { i: <DollarSign/>, t: 'Total Revenue', v: `$${(stats.totalRevenue || 0).toLocaleString()}`, sub: 'across all tenants' },
            { i: <Activity/>, t: 'Orders Served', v: (stats.totalOrders || 0).toLocaleString(), sub: 'all-time' },
            { i: <Users/>, t: 'MRR', v: `$${(stats.mrr || 0).toLocaleString()}`, sub: 'monthly recurring' },
          ].map((c) => (
            <Card key={c.t} className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-amber-400/20 text-amber-300 grid place-items-center">{c.i}</div>
                  <Badge variant="outline" className="text-white/60 border-white/20">live</Badge>
                </div>
                <div className="mt-4 text-3xl font-black">{c.v}</div>
                <div className="text-xs uppercase tracking-wider text-white/50 mt-1">{c.t}</div>
                <div className="text-xs text-white/40 mt-0.5">{c.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="bg-white/5 border-white/10 lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold">Revenue trend</div>
                  <div className="text-xs text-white/50">Last 14 days across all restaurants</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={stats.trend || []}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)"/>
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11}/>
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11}/>
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}/>
                  <Line type="monotone" dataKey="revenue" stroke="#fbbf24" strokeWidth={2} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="font-semibold mb-4">Subscription mix</div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={stats.byPlan || []} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                    {(stats.byPlan || []).map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]}/>))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 text-xs mt-2">
                {(stats.byPlan || []).map((p, i) => (
                  <div key={p.name} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}/>{p.name} ({p.value})</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants list */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-semibold text-lg">Restaurants</div>
                <div className="text-xs text-white/50">{list.length} tenants</div>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditing(null); setForm({ name: '', ownerName: '', contact: '', address: '', domain: '', subscription: 'Pro' }); }} className="bg-amber-400 text-black hover:bg-amber-300"><Plus className="h-4 w-4 mr-2"/>Add restaurant</Button>
                </DialogTrigger>
                <DialogContent className="bg-[#111] border-white/10 text-white">
                  <DialogHeader><DialogTitle>{editing ? 'Edit restaurant' : 'New restaurant'}</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Restaurant name *</Label><Input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="bg-white/5 border-white/10"/></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Owner name *</Label><Input value={form.ownerName} onChange={(e)=>setForm({...form,ownerName:e.target.value})} className="bg-white/5 border-white/10"/></div>
                      <div><Label>Contact *</Label><Input value={form.contact} onChange={(e)=>setForm({...form,contact:e.target.value})} className="bg-white/5 border-white/10"/></div>
                    </div>
                    <div><Label>Address</Label><Input value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} className="bg-white/5 border-white/10"/></div>
                    <div><Label>Domain (editable later)</Label><Input value={form.domain} onChange={(e)=>setForm({...form,domain:e.target.value})} placeholder="oasis-cafe.com" className="bg-white/5 border-white/10"/></div>
                    <div><Label>Subscription plan</Label>
                      <Select value={form.subscription} onValueChange={(v)=>setForm({...form,subscription:v})}>
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue/></SelectTrigger>
                        <SelectContent className="bg-[#111] text-white border-white/10">{SUBSCRIPTIONS.map(s=>(<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter><Button onClick={save} className="bg-amber-400 text-black hover:bg-amber-300">{editing ? 'Save changes' : 'Create & generate credentials'}</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-white/50 text-xs uppercase">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2">Restaurant</th>
                    <th className="text-left py-3 px-2">Owner</th>
                    <th className="text-left py-3 px-2">Plan</th>
                    <th className="text-left py-3 px-2">Domain</th>
                    <th className="text-left py-3 px-2">Created</th>
                    <th className="text-right py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 && (<tr><td colSpan={6} className="py-10 text-center text-white/40">No restaurants yet — add your first to get started.</td></tr>)}
                  {list.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                      <td className="py-3 px-2">
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-xs text-white/40">by Netrik Shop</div>
                      </td>
                      <td className="py-3 px-2">
                        <div>{r.ownerName}</div>
                        <div className="text-xs text-white/40">{r.contact}</div>
                      </td>
                      <td className="py-3 px-2"><Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30">{r.subscription}</Badge></td>
                      <td className="py-3 px-2 font-mono text-xs text-white/60">{r.domain || '—'}</td>
                      <td className="py-3 px-2 text-xs text-white/50">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-right">
                        <Button size="sm" variant="ghost" className="text-white/70" onClick={() => setShowCredsFor(r)}><QrCode className="h-4 w-4"/></Button>
                        <Button size="sm" variant="ghost" className="text-white/70" onClick={() => startEdit(r)}><Pencil className="h-4 w-4"/></Button>
                        <Button size="sm" variant="ghost" className="text-rose-400" onClick={() => remove(r)}><Trash2 className="h-4 w-4"/></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Credentials & QR Modal */}
        <Dialog open={!!showCredsFor} onOpenChange={(v) => !v && setShowCredsFor(null)}>
          <DialogContent className="bg-[#111] border-white/10 text-white max-w-lg">
            <DialogHeader><DialogTitle>Credentials — {showCredsFor?.name}</DialogTitle></DialogHeader>
            {showCredsFor && (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 p-4 bg-black/30">
                  <div className="text-xs uppercase tracking-wider text-amber-300 mb-2">Manager Login</div>
                  <div className="flex items-center justify-between gap-2"><span className="font-mono text-sm">{showCredsFor.managerCreds?.userId}</span><Button size="sm" variant="ghost" onClick={()=>copy(showCredsFor.managerCreds?.userId)}><Copy className="h-3 w-3"/></Button></div>
                  <div className="flex items-center justify-between gap-2"><span className="font-mono text-sm">{showCredsFor.managerCreds?.password}</span><Button size="sm" variant="ghost" onClick={()=>copy(showCredsFor.managerCreds?.password)}><Copy className="h-3 w-3"/></Button></div>
                </div>
                <div className="rounded-xl border border-white/10 p-4 bg-black/30">
                  <div className="text-xs uppercase tracking-wider text-amber-300 mb-2">Chef Login</div>
                  <div className="flex items-center justify-between gap-2"><span className="font-mono text-sm">{showCredsFor.chefCreds?.userId}</span><Button size="sm" variant="ghost" onClick={()=>copy(showCredsFor.chefCreds?.userId)}><Copy className="h-3 w-3"/></Button></div>
                  <div className="flex items-center justify-between gap-2"><span className="font-mono text-sm">{showCredsFor.chefCreds?.password}</span><Button size="sm" variant="ghost" onClick={()=>copy(showCredsFor.chefCreds?.password)}><Copy className="h-3 w-3"/></Button></div>
                </div>
                <div className="rounded-xl border border-white/10 p-4 bg-black/30 text-center">
                  <div className="text-xs uppercase tracking-wider text-amber-300 mb-2">Tenant QR</div>
                  <img alt="qr" src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(JSON.stringify({ tenant: showCredsFor.id, name: showCredsFor.name, domain: showCredsFor.domain }))}`} className="mx-auto rounded-lg"/>
                  <div className="text-xs text-white/40 mt-2">Scan to view tenant info</div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
