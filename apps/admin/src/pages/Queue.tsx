import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Clock, 
  User, 
  ShieldCheck, 
  Building2, 
  ChevronRight,
  AlertTriangle,
  History
} from 'lucide-react';
import { formatDistanceToNow, differenceInHours } from 'date-fns';
import { apiClient } from '../lib/api';

interface QueueItem {
  id: string;
  uid: string;
  type: 'supplier_kyc' | 'business_kyc';
  displayName: string;
  district: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  profilePhotoUrl?: string;
}

export default function QueuePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'suppliers' | 'businesses' | 'rejected'>('all');
  const [data, setData] = useState<{ pending: QueueItem[], rejected: QueueItem[] }>({ pending: [], rejected: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient('/admin/queue')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getFilteredData = () => {
    let list = activeTab === 'rejected' ? data.rejected : data.pending;
    
    if (activeTab === 'suppliers') {
      list = list.filter(item => item.type === 'supplier_kyc');
    } else if (activeTab === 'businesses') {
      list = list.filter(item => item.type === 'business_kyc');
    }

    if (search) {
      list = list.filter(item => 
        item.displayName.toLowerCase().includes(search.toLowerCase()) || 
        item.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    return list;
  };

  const filteredItems = getFilteredData();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Verification Queue</h1>
        <p className="text-slate-500 mt-1">Reviewing active KYC submissions for marketplace access.</p>
      </header>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-center justify-between">
        {/* Tabs */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex gap-1 shadow-sm w-full lg:w-auto overflow-x-auto">
          <TabButton active={activeTab === 'all'} label="Pending All" onClick={() => setActiveTab('all')} count={data.pending.length} />
          <TabButton active={activeTab === 'suppliers'} label="Suppliers" onClick={() => setActiveTab('suppliers')} />
          <TabButton active={activeTab === 'businesses'} label="Businesses" onClick={() => setActiveTab('businesses')} />
          <TabButton active={activeTab === 'rejected'} label="Rejected" onClick={() => setActiveTab('rejected')} icon={History} />
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or UID..."
            className="w-full bg-white border border-slate-200 py-3.5 pl-12 pr-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-green/20 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={40} className="text-slate-300" />
           </div>
           <h3 className="text-2xl font-bold text-slate-800">Queue is Clear</h3>
           <p className="text-slate-500 mt-2 max-w-xs">No pending items found matching your filters. Great job!</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <th className="px-8 py-5">Applicant</th>
                <th className="px-8 py-5">Role / Type</th>
                <th className="px-8 py-5">Submitted</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((item) => (
                <QueueRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QueueRow({ item }: { item: QueueItem }) {
  const isSupplier = item.type === 'supplier_kyc';
  const hoursInQueue = differenceInHours(new Date(), new Date(item.submittedAt));
  const isHighPriority = hoursInQueue >= 20 && item.status === 'pending';
  
  return (
    <tr className={`group transition-all hover:bg-slate-50/80 ${isHighPriority ? 'bg-rose-50/30' : ''}`}>
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
            {item.profilePhotoUrl ? (
              <img src={item.profilePhotoUrl} className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900 group-hover:text-primary-green transition-colors">{item.displayName}</p>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
              {item.district}
            </p>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider ${
          isSupplier ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-blue-50 border-blue-100 text-blue-700'
        }`}>
          {isSupplier ? <ShieldCheck size={14} /> : <Building2 size={14} />}
          <span>{isSupplier ? 'Supplier' : 'Business'}</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Clock size={14} className={isHighPriority ? 'text-rose-500 animate-pulse' : 'text-slate-400'} />
              <span>{formatDistanceToNow(new Date(item.submittedAt))} ago</span>
           </div>
           {isHighPriority && (
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-tighter">
                <AlertTriangle size={12} />
                <span>SLA Warning: 20hr+</span>
             </div>
           )}
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        {item.status === 'pending' ? (
           <Link
             to={`/review/${item.id}`}
             className="inline-flex items-center gap-2 bg-slate-900 hover:bg-primary-green text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-900/10 group-hover:scale-105"
           >
             Review
             <ArrowRight size={16} />
           </Link>
        ) : (
           <div className={`inline-flex px-4 py-2 rounded-xl text-xs font-bold uppercase translate-x-2 ${
             item.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
           }`}>
             {item.status}
           </div>
        )}
      </td>
    </tr>
  );
}

function TabButton({ active, label, onClick, count, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm whitespace-nowrap ${
        active ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      {Icon && <Icon size={16} />}
      <span>{label}</span>
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-lg text-[10px] ${active ? 'bg-primary-green text-white' : 'bg-slate-100 text-slate-500'}`}>
          {count}
        </span>
      )}
    </button>
  );
}
