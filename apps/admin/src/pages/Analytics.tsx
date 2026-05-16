import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  BarChart3, 
  Bell, 
  AlertCircle, 
  Users, 
  CheckCircle2, 
  XCircle,
  ArrowUpRight,
  RefreshCcw
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface AnalyticsData {
  notifications: {
    total24h: number;
    pushSuccessRate: number;
    smsSuccessRate: number;
  };
  marketplace: {
    totalAds: number;
    totalDemands: number;
    topCategories: Array<{ name: string; count: number }>;
  };
  users: {
    totalRegistered: number;
    active24h: number;
  };
  timestamp: string;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    apiClient('/admin/analytics/summary')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) return (
    <div className="p-8 animate-pulse">
      <div className="h-10 w-48 bg-slate-200 rounded-lg mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl" />)}
      </div>
      <div className="h-64 bg-slate-200 rounded-3xl" />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Platform Analytics</h1>
          <p className="text-slate-500 mt-1">Real-time monitoring of notifications and marketplace activity</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-medium"
        >
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard 
          title="Daily Active Users" 
          value={data?.users.active24h || 0} 
          icon={Users} 
          trend="+5%" 
        />
        <MetricCard 
          title="Notifications (24h)" 
          value={data?.notifications.total24h || 0} 
          icon={Bell} 
          trend="Stable" 
        />
        <MetricCard 
          title="Ads Posted" 
          value={data?.marketplace.totalAds || 0} 
          icon={Activity} 
          trend="+12%" 
        />
        <MetricCard 
          title="Success Rate (Push)" 
          value={`${Math.round(data?.notifications.pushSuccessRate || 0)}%`} 
          icon={CheckCircle2} 
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notification Health */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-50 p-3 rounded-2xl">
              <Activity className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Notification Health</h3>
          </div>
          
          <div className="space-y-6">
            <HealthBar 
               label="Push Delivery (FCM)" 
               percentage={data?.notifications.pushSuccessRate || 0} 
               color="bg-primary-green" 
            />
            <HealthBar 
               label="SMS Delivery (Notify.lk)" 
               percentage={data?.notifications.smsSuccessRate || 0} 
               color="bg-blue-500" 
            />
          </div>

          <div className="mt-10 p-4 bg-slate-50 rounded-2xl flex items-start gap-4">
            <AlertCircle size={20} className="text-slate-400 mt-1" />
            <p className="text-sm text-slate-500 leading-relaxed">
              Delivery failures are usually caused by missing FCM tokens or network timeouts. 
              The backend automatically retries critical alerts twice before logging a failure.
            </p>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
           <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-50 p-3 rounded-2xl">
              <BarChart3 className="text-primary-green" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Trending Categories</h3>
          </div>

          <div className="space-y-4">
            {data?.marketplace.topCategories.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-4">
                <span className="w-8 text-sm font-bold text-slate-400">#0{idx + 1}</span>
                <div className="flex-1">
                   <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                      <span className="text-sm font-black text-primary-green">{cat.count} ads</span>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-green" 
                        style={{ width: `${(cat.count / (data.marketplace.topCategories[0].count || 1)) * 100}%` }} 
                      />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color = 'slate' }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
          <Icon size={24} />
        </div>
        {trend && (
           <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
              <ArrowUpRight size={14} />
              <span>{trend}</span>
           </div>
        )}
      </div>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function HealthBar({ label, percentage, color }: any) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-bold text-slate-600">{label}</span>
        <span className="text-sm font-black text-slate-900">{Math.round(percentage)}%</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}
