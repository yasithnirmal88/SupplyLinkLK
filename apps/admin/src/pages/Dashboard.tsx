import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Store, 
  Truck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  BarChart3,
  Calendar
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface Stats {
  totalUsers: number;
  totalSuppliers: number;
  totalBusinesses: number;
  pendingQueueCount: number;
  approvedToday: number;
  rejectedToday: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient('/admin/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="h-20 w-1/3 bg-slate-200 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-32 bg-slate-200 rounded-3xl" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <p className="text-primary-green font-bold text-sm tracking-widest uppercase mb-1">Overview</p>
          <h1 className="text-4xl font-bold text-slate-900">System Dashboard</h1>
          <p className="text-slate-500 mt-2">Real-time marketplace health & verification metrics</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2 text-slate-500 font-medium">
          <Calendar size={18} />
          <span>{new Date().toLocaleDateString('en-LK', { dateStyle: 'long' })}</span>
        </div>
      </header>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <StatCard 
          title="Pending Queue" 
          value={stats?.pendingQueueCount || 0} 
          icon={Clock} 
          color="amber"
          desc="Oldest item: 14h ago"
        />
        <StatCard 
          title="Approved Today" 
          value={stats?.approvedToday || 0} 
          icon={CheckCircle} 
          color="emerald"
          desc="Verification SLA: 98%"
        />
        <StatCard 
          title="Rejected Today" 
          value={stats?.rejectedToday || 0} 
          icon={XCircle} 
          color="rose"
          desc="Avg. Reason: Missing BR"
        />
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Users size={24} className="text-primary-green" />
        User Demographics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <Users size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">Total Registered</p>
          <p className="text-4xl font-black text-slate-900 mt-1">{stats?.totalUsers}</p>
          <div className="mt-4 flex items-center gap-1 text-emerald-500 text-sm font-bold">
            <TrendingUp size={16} />
            <span>+12% this week</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <Truck size={32} className="text-primary-green" />
          </div>
          <p className="text-slate-500 font-medium">Total Suppliers</p>
          <p className="text-4xl font-black text-slate-900 mt-1">{stats?.totalSuppliers}</p>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
             <div className="bg-primary-green h-full" style={{ width: `${(stats?.totalSuppliers! / stats?.totalUsers!) * 100}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2 font-bold">PRODUCERS · {Math.round((stats?.totalSuppliers! / stats?.totalUsers!) * 100)}% of base</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <Store size={32} className="text-blue-600" />
          </div>
          <p className="text-slate-500 font-medium">Total Businesses</p>
          <p className="text-4xl font-black text-slate-900 mt-1">{stats?.totalBusinesses}</p>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
             <div className="bg-blue-600 h-full" style={{ width: `${(stats?.totalBusinesses! / stats?.totalUsers!) * 100}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2 font-bold">BUYERS · {Math.round((stats?.totalBusinesses! / stats?.totalUsers!) * 100)}% of base</p>
        </div>
      </div>
      
      {/* Visual Analytics Placeholder */}
      <div className="mt-12 bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between border-4 border-slate-800">
         <div className="max-w-md">
            <h3 className="text-2xl font-bold mb-2">Operational Analytics</h3>
            <p className="text-slate-400">Detailed supply chain dynamics and price index reporting will appear here in the next phase.</p>
         </div>
         <div className="mt-6 md:mt-0 flex gap-4">
            <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-4">
               <BarChart3 size={32} className="text-primary-green" />
               <div className="h-10 w-24 bg-white/20 rounded-md animate-pulse" />
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, desc }: any) {
  const colors: any = {
    amber: 'bg-amber-50 border-amber-200 text-amber-700 icon:bg-amber-100 icon:text-amber-600 shadow-amber-900/5',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 icon:bg-emerald-100 icon:text-emerald-600 shadow-emerald-900/5',
    rose: 'bg-rose-50 border-rose-200 text-rose-700 icon:bg-rose-100 icon:text-rose-600 shadow-rose-900/5',
  };

  const selected = colors[color];

  return (
    <div className={`p-6 rounded-[2rem] border-2 shadow-xl ${selected.split(' icon')[0]} relative overflow-hidden`}>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="font-bold text-sm uppercase tracking-wide opacity-80">{title}</p>
          <p className="text-4xl font-black mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-2xl ${selected.split('icon:')[1].split(' ')[0]} ${selected.split('icon:')[2].split(' ')[0]}`}>
          <Icon size={28} />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium opacity-60 relative z-10">{desc}</p>
      {/* Decorative SVG background elements */}
      <div className="absolute -bottom-6 -right-6 opacity-5">
         <Icon size={120} />
      </div>
    </div>
  );
}
