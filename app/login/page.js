'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Lock, ShieldCheck, ChefHat, UserCog, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState('staff');
  const [staffRole, setStaffRole] = useState('manager');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!userId || !password) return toast.error('Enter both fields');
    setLoading(true);
    try {
      const type = tab === 'central' ? 'central' : staffRole;
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, userId, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('netrik_user', JSON.stringify(data.user));
      toast.success(`Welcome, ${data.user.userId}`);
      if (data.user.type === 'central') router.push('/central');
      else if (data.user.type === 'manager') router.push('/manager');
      else if (data.user.type === 'chef') router.push('/chef');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src="https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080&w=1280" alt="" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/70 to-transparent"/>
        <div className="relative h-full flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 grid place-items-center font-black text-black">N</div>
            <span className="font-bold">Netrik Shop</span>
          </Link>
          <div>
            <div className="text-amber-300 text-xs uppercase tracking-[0.3em]">Restaurant OS</div>
            <h2 className="mt-3 text-5xl font-black leading-tight">Sign in to<br/>your dashboard.</h2>
            <p className="mt-4 text-white/60 max-w-md">Manage tables, menus, kitchen tickets and live orders — all in one beautifully designed control center.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md bg-white/5 border-white/10 text-white">
          <CardContent className="p-8">
            <Link href="/" className="text-xs text-white/50 inline-flex items-center gap-1 hover:text-white"><ArrowLeft className="h-3 w-3"/> Back to home</Link>
            <h1 className="mt-4 text-3xl font-black">Welcome back</h1>
            <p className="text-white/50 text-sm mt-1">Choose your login type below.</p>
            <Tabs value={tab} onValueChange={setTab} className="mt-6">
              <TabsList className="grid grid-cols-2 bg-white/5 border border-white/10">
                <TabsTrigger value="staff" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">Staff Login</TabsTrigger>
                <TabsTrigger value="central" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">Central Login</TabsTrigger>
              </TabsList>
              <TabsContent value="staff" className="mt-5">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button type="button" onClick={() => setStaffRole('manager')} className={`rounded-xl border p-3 text-left transition ${staffRole === 'manager' ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                    <UserCog className="h-5 w-5 mb-1 text-amber-300"/>
                    <div className="font-semibold">Manager</div>
                    <div className="text-xs text-white/50">Restaurant admin</div>
                  </button>
                  <button type="button" onClick={() => setStaffRole('chef')} className={`rounded-xl border p-3 text-left transition ${staffRole === 'chef' ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                    <ChefHat className="h-5 w-5 mb-1 text-amber-300"/>
                    <div className="font-semibold">Chef</div>
                    <div className="text-xs text-white/50">Kitchen view</div>
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="central" className="mt-5">
                <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm">
                  <ShieldCheck className="h-5 w-5 text-amber-300 mb-1"/>
                  <div className="font-semibold">Central Admin</div>
                  <div className="text-xs text-white/60">Manage all restaurants. Use credentials: <span className="font-mono text-amber-200">hello / 123456</span></div>
                </div>
              </TabsContent>
            </Tabs>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <Label className="text-white/70">User ID</Label>
                <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. hello or manager_xxx" className="bg-white/5 border-white/10 text-white mt-1.5"/>
              </div>
              <div>
                <Label className="text-white/70">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="bg-white/5 border-white/10 text-white pl-9"/>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-amber-400 text-black hover:bg-amber-300 font-semibold h-11">{loading ? 'Signing in…' : 'Sign in'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
