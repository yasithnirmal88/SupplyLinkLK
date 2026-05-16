import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  ShieldCheck,
  Zap,
  MessageSquare,
  Maximize2
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface ReviewItem {
  id: string;
  uid: string;
  type: 'supplier_kyc' | 'business_kyc';
  displayName: string;
  address: string;
  district: string;
  profilePhotoUrl?: string;
  nicFrontUrl: string;
  nicBackUrl: string;
  selfieUrl: string;
  businessRegUrl?: string;
  categories?: { name: string; selfieUrl: string }[];
  businessType?: string;
  contactPerson?: string;
  submittedAt: string;
}

export default function ReviewPage() {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<ReviewItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch individual queue item
    // For this prototype, we'll find it in the queue list or could have a specific endpoint
    // Assuming backend endpoint GET /api/v1/admin/queue/:id exists
    apiClient(`/admin/queue`) 
      .then(res => {
         const found = res.pending.find((q: any) => q.id === queueId);
         if (found) setItem(found);
         else navigate('/queue');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [queueId]);

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to APPROVE this user?')) return;
    setSubmitting(true);
    try {
      await apiClient(`/admin/queue/${queueId}/approve`, { method: 'PATCH' });
      navigate('/queue');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return alert('Please provide a rejection reason.');
    if (!window.confirm('Are you sure you want to REJECT this user?')) return;
    setSubmitting(true);
    try {
      await apiClient(`/admin/queue/${queueId}/reject`, { 
        method: 'PATCH',
        body: { reason: rejectionReason, internalNotes }
      });
      navigate('/queue');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading verification data...</div>;
  if (!item) return <div className="p-8">Record not found.</div>;

  const isSupplier = item.type === 'supplier_kyc';

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/queue')} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">Reviewing: {item.displayName}</h1>
            <p className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-500 uppercase tracking-tighter mt-1 inline-block">UID: {item.uid}</p>
          </div>
        </div>
        <div className="flex gap-4">
           {/* Visual status indicators */}
           <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${
             isSupplier ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
           }`}>
              {isSupplier ? 'Supplier Profile' : `${item.businessType} Profile`}
           </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Documents Grid */}
        <div className="flex-1 overflow-y-auto p-8 border-r border-slate-200 bg-white">
          <SectionTitle title="Verification Documents" icon={Zap} />
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <DocumentCard label="NIC Front" url={item.nicFrontUrl} onZoom={() => setZoomedImage(item.nicFrontUrl)} />
            <DocumentCard label="NIC Back" url={item.nicBackUrl} onZoom={() => setZoomedImage(item.nicBackUrl)} />
            <DocumentCard label="Identity Selfie" url={item.selfieUrl} onZoom={() => setZoomedImage(item.selfieUrl)} circular />
            
            {item.businessRegUrl && (
              <DocumentCard label="Business Registration" url={item.businessRegUrl} onZoom={() => setZoomedImage(item.businessRegUrl)} spanFull />
            )}

            {item.categories && item.categories.length > 0 && (
              <div className="xl:col-span-2 mt-8">
                 <SectionTitle title="Supply Verification Photos" icon={CheckCircle} />
                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {item.categories.map((cat, idx) => (
                      <DocumentCard key={idx} label={cat.name} url={cat.selfieUrl} onZoom={() => setZoomedImage(cat.selfieUrl)} />
                    ))}
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: User Details & Actions */}
        <div className="w-[450px] overflow-y-auto p-10 bg-slate-50 border-l border-slate-200">
           <SectionTitle title="Applicant Summary" icon={User} />
           
           <div className="space-y-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10">
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-sm">
                    {item.profilePhotoUrl ? <img src={item.profilePhotoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100" />}
                 </div>
                 <div>
                    <p className="text-2xl font-black text-slate-900">{item.displayName}</p>
                    <p className="text-primary-green font-bold text-sm">{isSupplier ? 'Producer' : item.businessType}</p>
                 </div>
              </div>

              <div className="space-y-5">
                 <InfoItem label="District" value={item.district} icon={MapPin} />
                 <InfoItem label="Full Address" value={item.address} />
                 {item.contactPerson && <InfoItem label="Contact Person" value={item.contactPerson} icon={User} />}
                 <InfoItem label="Phone Number" value="+94 77 123 4567" icon={Phone} /> {/* Placeholder phone as UID usually doesn't have it on first fetch */}
              </div>
           </div>

           <SectionTitle title="Decision Console" icon={ShieldCheck} />
           
           <div className="space-y-6">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Rejection Reason
                 </label>
                 <textarea
                   className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all font-medium placeholder:text-slate-300"
                   rows={4}
                   placeholder="Sent to the user upon rejection (e.g. 'NIC image too blurry')"
                   value={rejectionReason}
                   onChange={(e) => setRejectionReason(e.target.value)}
                 />
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-3">Internal Admin Notes</label>
                 <textarea
                   className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium placeholder:text-slate-400 opacity-80"
                   rows={3}
                   placeholder="Only visible to other admins..."
                   value={internalNotes}
                   onChange={(e) => setInternalNotes(e.target.value)}
                 />
              </div>

              <div className="flex gap-4 sticky bottom-0 bg-slate-50 py-4">
                 <button
                   disabled={submitting}
                   onClick={handleReject}
                   className="flex-1 bg-white border-2 border-rose-500 text-rose-500 hover:bg-rose-50 font-black py-4 rounded-2xl transition-all shadow-lg shadow-rose-900/5 disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                    <XCircle size={20} />
                    Reject
                 </button>
                 <button
                   disabled={submitting}
                   onClick={handleApprove}
                   className="flex-2 bg-primary-green hover:bg-emerald-600 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                    <CheckCircle size={20} />
                    Approve
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Image Zoom Overlay */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-10 items-center">
           <button onClick={() => setZoomedImage(null)} className="absolute top-8 right-8 text-white hover:text-rose-400 p-4">
              <XCircle size={40} />
           </button>
           <div className="flex-1 w-full flex items-center justify-center">
              <img src={zoomedImage} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
           </div>
           <p className="text-slate-500 font-mono text-sm mt-8 select-all select-none opacity-50">IMAGE CONTENT ANALYSIS · ISO {queueId}</p>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ title, icon: Icon }: any) {
  return (
    <div className="flex items-center gap-2 mb-6">
       <div className="p-1.5 bg-primary-green/10 rounded-lg">
          <Icon size={18} className="text-primary-green" />
       </div>
       <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</h2>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon }: any) {
  return (
    <div className="flex items-start gap-4">
      {Icon && <div className="mt-1"><Icon size={16} className="text-slate-400" /></div>}
      <div className="flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-slate-900 font-semibold leading-relaxed">{value || 'N/A'}</p>
      </div>
    </div>
  );
}

function DocumentCard({ url, label, onZoom, circular, spanFull }: any) {
  return (
    <div className={`p-4 bg-slate-50 border border-slate-100 rounded-3xl ${spanFull ? 'xl:col-span-2' : ''}`}>
       <div className="flex justify-between items-center mb-3 px-2">
          <p className="text-[11px] font-black text-slate-900 uppercase tracking-wide">{label}</p>
          <button onClick={onZoom} className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-primary-green">
             <Maximize2 size={16} />
          </button>
       </div>
       <div className={`relative w-full aspect-[1.6/1] bg-white rounded-2xl shadow-inner border border-slate-200 overflow-hidden group ${circular ? 'aspect-square max-w-[200px] mx-auto' : ''}`}>
          <img src={url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <PressableOverlay onClick={onZoom} />
       </div>
    </div>
  );
}

function PressableOverlay({ onClick }: any) {
   return (
      <div 
        onClick={onClick}
        className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100 cursor-zoom-in group"
      >
         <div className="bg-white p-3 rounded-full shadow-2xl scale-50 group-hover:scale-100 transition-all">
            <Maximize2 size={24} className="text-primary-green" />
         </div>
      </div>
   );
}
