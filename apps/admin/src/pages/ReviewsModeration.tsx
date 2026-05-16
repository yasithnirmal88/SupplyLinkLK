import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  Flag, 
  UserMinus, 
  CheckCircle,
  MoreVertical,
  Search,
  AlertTriangle
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface ReportedReview {
  reportId: string;
  ratingId: string;
  reporterId: string;
  reason: string;
  description: string;
  flagged: boolean;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  ratingData?: any; // Populated rating details
}

export default function ReviewsModeration() {
  const [reports, setReports] = useState<ReportedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Endpoint: GET /api/v1/admin/reports/reviews?status=pending
      const data = await apiClient(`/admin/reports/reviews?status=${filter}`);
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reportId: string, action: string) => {
    if (!window.confirm(`Are you sure you want to ${action} this review?`)) return;
    
    try {
      await apiClient(`/admin/reports/reviews/${reportId}/${action}`, { method: 'POST' });
      fetchReports();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Review Moderation</h1>
          <p className="text-slate-500 font-medium">Manage flagged content and trust reports</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          {(['pending', 'resolved', 'dismissed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                filter === s ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-20 items-center justify-center border border-slate-100 shadow-sm flex flex-col">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
             <CheckCircle size={40} className="text-slate-300" />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest">All clear!</p>
          <p className="text-slate-400 text-sm mt-2">No {filter} reports to show.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {reports.map((report) => (
            <div key={report.reportId} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-rose-50 p-2 rounded-lg">
                    <Flag size={16} className="text-rose-500" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-slate-400 tracking-tighter">Report Reason</span>
                    <p className="text-rose-600 font-black uppercase text-sm tracking-tight">{report.reason}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-300 uppercase">Reporter: {report.reporterId.substring(0, 8)}...</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-4">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold text-slate-500">Flagged Review Content</span>
                     <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i < (report.ratingData?.rating || 0) ? 'bg-orange-400' : 'bg-slate-200'}`} />
                        ))}
                     </div>
                  </div>
                  <p className="text-slate-700 font-medium italic">"{report.ratingData?.reviewText || 'Review text unavailable'}"</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-slate-200" />
                     <span className="text-sm font-bold text-slate-600">User: {report.ratingData?.targetUserId || 'Unknown'}</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-[11px] text-slate-400 font-medium">{new Date(report.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="md:w-64 flex flex-col justify-between border-l border-slate-50 md:pl-6 pt-4 md:pt-0">
                <div className="space-y-3">
                  <button 
                    onClick={() => handleAction(report.reportId, 'remove')}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-rose-900/10 flex items-center justify-center gap-2 text-xs uppercase"
                  >
                    <Trash2 size={16} />
                    Remove Review
                  </button>
                  <button 
                    onClick={() => handleAction(report.reportId, 'dismiss')}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase"
                  >
                    <CheckCircle size={16} />
                    Dismiss Report
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                   <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                      <UserMinus size={18} />
                   </button>
                   <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                      <AlertTriangle size={18} />
                   </button>
                   <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                      <MoreVertical size={18} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
