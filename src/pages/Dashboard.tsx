import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { MissingPerson, FoundReport } from '../types';
import { useAuth } from '../components/auth/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckCircle2, Eye, Edit3, Trash2, Phone, MapPin, Loader2, PlusCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [myCases, setMyCases] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'RESOLVED' | 'LEADS'>('ACTIVE');
  const [helperReports, setHelperReports] = useState<FoundReport[]>([]);

  useEffect(() => {
    const fetchHelperReports = async () => {
      if (!user || myCases.length === 0) return;
      try {
        const personIds = myCases.map(c => c.id);
        // Firestore 'in' query has 10 item limit, but for simplicity:
        const q = query(collection(db, 'found_reports'), where('missingPersonId', 'in', personIds.slice(0, 10)));
        const snapshot = await getDocs(q);
        setHelperReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoundReport)));
      } catch (error) {
        console.error('Error fetching helper reports:', error);
      }
    };
    fetchHelperReports();
  }, [user, myCases]);

  const updateReportStatus = async (reportId: string, status: string) => {
      try {
          await updateDoc(doc(db, 'found_reports', reportId), { status });
          setHelperReports(prev => prev.map(r => r.id === reportId ? { ...r, status: status as any } : r));
          toast.success(`Report ${status.toLowerCase()}`);
      } catch (error) {
          toast.error('Failed to update report');
      }
  };
  useEffect(() => {
    const fetchMyCases = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'missing_persons'), where('reporterId', '==', user.uid));
        const snapshot = await getDocs(q);
        const cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MissingPerson));
        setMyCases(cases);
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCases();
  }, [user]);

  const toggleStatus = async (caseId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'FOUND' : 'ACTIVE';
    try {
      await updateDoc(doc(db, 'missing_persons', caseId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setMyCases(prev => prev.map(c => c.id === caseId ? { ...c, status: newStatus as any } : c));
      toast.success(`Case marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteCase = async (caseId: string) => {
    if (!window.confirm('Are you sure you want to delete this report? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'missing_persons', caseId));
      setMyCases(prev => prev.filter(c => c.id !== caseId));
      toast.success('Report deleted');
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  if (!user) {
    navigate('/');
    return null;
  }

  const filteredCases = myCases.filter(c => activeTab === 'ACTIVE' ? c.status === 'ACTIVE' : c.status !== 'ACTIVE');
  const stats = {
    total: myCases.length,
    active: myCases.filter(c => c.status === 'ACTIVE').length,
    found: myCases.filter(c => c.status === 'FOUND').length,
    possible: 0 // In real app, count PENDING found_reports
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800 border border-slate-200">
              <LayoutDashboard className="w-6 h-6" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Reporter Dashboard</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Manage your search reports</p>
           </div>
        </div>
        <Link to="/report" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center shadow-lg hover:bg-blue-700 transition-all text-sm">
           <PlusCircle className="w-4 h-4 mr-2" />
           NEW REPORT
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
         {[
           { label: 'Total Reports', val: stats.total, icon: FileText, color: 'blue' },
           { label: 'Active Case', val: stats.active, icon: AlertCircle, color: 'orange' },
           { label: 'Found & Resolved', val: stats.found, icon: CheckCircle2, color: 'green' },
           { label: 'Lead Sighting', val: stats.possible, icon: MessageSquare, color: 'purple' },
         ].map((s, i) => (
           <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
              <div className="flex items-center justify-between group">
                <div className="text-2xl font-black text-slate-800">{s.val}</div>
                <s.icon className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
           </div>
         ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 mb-8">
        {(['ACTIVE', 'RESOLVED', 'LEADS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[11px] font-bold tracking-widest uppercase transition-all relative ${
              activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'LEADS' ? 'COMMUNITY LEADS' : `${tab} REPORTS`}
            {activeTab === tab && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
            {tab === 'LEADS' && helperReports.filter(r => r.status === 'PENDING').length > 0 && (
                <span className="absolute -top-1 -right-4 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center border-2 border-white">
                    {helperReports.filter(r => r.status === 'PENDING').length}
                </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : activeTab === 'LEADS' ? (
          <div className="space-y-6">
              {helperReports.length > 0 ? helperReports.map(report => (
                  <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-blue-50/50 border border-blue-100 rounded-3xl">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${report.status === 'PENDING' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
                                    {report.status}
                                </span>
                                <span className="text-gray-400 text-xs font-bold uppercase">{formatDate(report.createdAt)}</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900">Lead from {report.helperName}</h4>
                            <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600">
                                <div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-blue-600" /> {report.helperPhone}</div>
                                <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-blue-600" /> {report.currentLocation}</div>
                            </div>
                            <p className="bg-white p-4 rounded-2xl border border-blue-100 text-gray-700 leading-relaxed italic">
                                "{report.notes}"
                            </p>
                        </div>
                        <div className="flex flex-row md:flex-col gap-2">
                             {report.status === 'PENDING' && (
                                 <>
                                    <button onClick={() => updateReportStatus(report.id, 'VERIFIED')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100">Verify Lead</button>
                                    <button onClick={() => updateReportStatus(report.id, 'REJECTED')} className="px-6 py-3 bg-white text-gray-400 border border-gray-200 rounded-xl font-bold text-sm hover:text-red-500 hover:border-red-100 transition-colors">Dismiss</button>
                                 </>
                             )}
                        </div>
                      </div>
                  </motion.div>
              )) : (
                  <div className="text-center py-20 text-gray-400 font-medium">No community leads reported for your cases yet.</div>
              )}
          </div>
      ) : filteredCases.length > 0 ? (
        <div className="space-y-6">
          {filteredCases.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                   <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={c.photoUrl} alt="" className="w-full h-full object-cover" />
                   </div>
                   <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{c.fullName}</h3>
                        <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          c.status === 'ACTIVE' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400 font-medium">
                        <MapPin className="w-4 h-4 mr-1" />
                        {c.locality || c.village}
                        <span className="mx-2">•</span>
                        Reported {formatDate(c.createdAt)}
                      </div>
                   </div>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                   <Link 
                      to={`/case/${c.id}`} 
                      className="flex-1 md:flex-none p-3 bg-gray-50 text-gray-600 hover:text-blue-600 rounded-xl transition-colors flex items-center justify-center"
                      title="View Public Profile"
                   >
                     <Eye className="w-5 h-5 mr-2 md:mr-0" />
                     <span className="md:hidden">View</span>
                   </Link>
                   <button 
                      onClick={() => toggleStatus(c.id, c.status)}
                      className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                        c.status === 'ACTIVE' 
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100' 
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                   >
                     {c.status === 'ACTIVE' ? 'Mark Found' : 'Re-activate'}
                   </button>
                   <div className="flex md:block">
                      <button 
                        onClick={() => deleteCase(c.id)}
                        className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
           <FileText className="w-12 h-12 text-gray-300 mx-auto mb-6" />
           <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab.toLowerCase()} reports</h3>
           <p className="text-gray-500 mb-8 max-w-xs mx-auto">
             {activeTab === 'ACTIVE' 
               ? "You haven't filed any reports yet, or all your cases were resolved."
               : "You don't have any resolved cases yet."}
           </p>
           {activeTab === 'ACTIVE' && (
             <Link to="/report" className="inline-flex px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">
                File a Report
             </Link>
           )}
        </div>
      )}
    </div>
  );
}
