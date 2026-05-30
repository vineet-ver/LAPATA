import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MissingPerson } from '../types';
import { CaseCard } from '../components/ui/CaseCard';
import { Search, Heart, Shield, Users, ArrowRight, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export function Home() {
  const [recentCases, setRecentCases] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data, error } = await supabase
          .from('missing_persons')
          .select('*')
          .eq('status', 'ACTIVE')
          .order('createdAt', { ascending: false })
          .limit(3);

        if (error) throw error;
        setRecentCases((data || []) as MissingPerson[]);
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 flex flex-col gap-6">
      {/* Top Section: Search & Welcome */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-slate-200">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Memory Fragment Search</h1>
              <p className="text-slate-500 mb-8">Search by mother name, village, school, or landmark to help find missing persons.</p>
              
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., 'Boy found near railway station, says mother name Sunita'..." 
                  className="w-full pl-12 pr-32 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 placeholder:text-slate-400 text-lg shadow-inner"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-2 bottom-2 px-8 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
                >
                  Search
                </button>
              </form>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">Suggested:</span>
                <button onClick={() => setSearchQuery('Near railway station')} className="text-[11px] bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 font-medium hover:bg-slate-200">"Near railway station"</button>
                <button onClick={() => setSearchQuery('Lives in Rohini')} className="text-[11px] bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 font-medium hover:bg-slate-200">"Lives in Rohini"</button>
                <button onClick={() => setSearchQuery('Father Amit')} className="text-[11px] bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 font-medium hover:bg-slate-200">"Father Amit"</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Cases Feed */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                <h2 className="text-lg font-extrabold text-slate-800 tracking-tight uppercase">Urgent Active Cases</h2>
              </div>
              <Link to="/search" className="text-xs font-bold text-blue-600 hover:underline">View All Dashboard</Link>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 4, 5].map(i => (
                    <div key={i} className="bg-slate-100 rounded-2xl aspect-[16/9] animate-pulse"></div>
                  ))}
                </div>
              ) : recentCases.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentCases.map(person => (
                    <CaseCard key={person.id} person={person} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">No active cases found currently</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Assistant & Action Banners */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* AI Quick Help */}
          <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden group shadow-xl">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Reconnect Assistant</span>
                </div>
                <h2 className="text-2xl font-bold mb-4 leading-tight">Can't remember the name?</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Our AI helper can match search results based on memory fragments like schools, siblings, or nearby temples.
                </p>
                <Link to="/ai-help" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm transition-transform hover:scale-105">
                  Try Smart Search
                  <ArrowRight className="w-4 h-4" />
                </Link>
             </div>
             <Brain className="absolute -bottom-8 -right-8 w-40 h-40 text-white/5 transform group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* I Found Someone Action */}
          <div className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-lg shadow-blue-200 min-h-[220px]">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full opacity-50"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-2">I Found Someone</h2>
              <p className="text-blue-100 text-sm leading-relaxed max-w-[240px]">
                Report sightings instantly to connect with families securely.
              </p>
            </div>
            <Link 
              to="/ai-help?mode=found" 
              className="relative z-10 w-full py-4 bg-white text-blue-600 font-black rounded-xl shadow-lg hover:bg-slate-50 transition-colors uppercase tracking-widest text-xs text-center"
            >
              Upload Photo & Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
