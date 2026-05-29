import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MissingPerson, UserProfile } from '../types';
import { useAuth } from '../components/auth/AuthProvider';
import { ShieldAlert, Users, Database, ShieldCheck, Trash2, ExternalLink, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

export function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [allCases, setAllCases] = useState<MissingPerson[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;
      try {
        const { data: casesData, error: casesError } = await supabase
          .from('missing_persons')
          .select('*')
          .order('createdAt', { ascending: false });

        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('createdAt', { ascending: false });

        if (casesError) throw casesError;
        if (usersError) throw usersError;
        
        setAllCases((casesData || []) as MissingPerson[]);
        setUsers((usersData || []) as UserProfile[]);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const removeCase = async (id: string) => {
    if (!window.confirm('Admin Action: Permanently delete this case?')) return;
    try {
      const { error } = await supabase
        .from('missing_persons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAllCases(prev => prev.filter(c => c.id !== id));
      toast.success('Case removed by admin');
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  if (authLoading) return null;
  if (!isAdmin) {
     return <div className="p-32 text-center text-red-500 font-bold text-2xl uppercase tracking-tighter">Access Denied</div>;
  }

  const filteredCases = allCases.filter(c => c.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <ShieldAlert className="w-6 h-6" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Admin Control</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">System moderation & audit</p>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center shadow-sm">
              <Users className="w-4 h-4 text-slate-400 mr-2" />
              <span className="font-bold text-slate-800 text-sm">{users.length}</span>
              <span className="text-slate-400 text-[9px] ml-1.5 font-black uppercase tracking-widest leading-none mt-0.5">Users</span>
           </div>
           <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center shadow-sm">
              <Database className="w-4 h-4 text-slate-400 mr-2" />
              <span className="font-bold text-slate-800 text-sm">{allCases.length}</span>
              <span className="text-slate-400 text-[9px] ml-1.5 font-black uppercase tracking-widest leading-none mt-0.5">Cases</span>
           </div>
        </div>
      </div>

      <div className="mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Global search by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
          />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporter</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Published</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                   <td colSpan={6} className="py-20 text-center">
                      <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto" />
                   </td>
                </tr>
              ) : filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6 text-xs font-mono text-gray-400">#{c.id.substring(0, 8)}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100">
                         <img src={c.photoUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-gray-900 underline group-hover:text-blue-600 transition-colors underline-offset-4 decoration-gray-200">{c.fullName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500 font-medium">{c.reporterId.substring(0, 8)}...</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      c.status === 'ACTIVE' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-400 font-medium">{formatDate(c.createdAt)}</td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <a href={`/case/${c.id}`} target="_blank" className="p-2 text-gray-300 hover:text-blue-600">
                       <ExternalLink className="w-5 h-5 inline" />
                    </a>
                    <button 
                       onClick={() => removeCase(c.id)}
                       className="p-2 text-gray-300 hover:text-red-500"
                    >
                       <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filteredCases.length === 0 && (
          <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">No matching cases found in database</div>
        )}
      </div>
    </div>
  );
}
