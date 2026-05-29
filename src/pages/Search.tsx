import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MissingPerson } from '../types';
import { CaseCard } from '../components/ui/CaseCard';
import { Search as SearchIcon, Filter, SlidersHorizontal, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cases, setCases] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('missing_persons')
          .select('*')
          .eq('status', 'ACTIVE')
          .order('createdAt', { ascending: false });

        if (error) throw error;
        let allCases = (data || []) as MissingPerson[];
        
        // Manual filtering for complex queries (Firestore has limits on complex queries without indexes)
        if (searchTerm) {
          const lowerSearch = searchTerm.toLowerCase();
          allCases = allCases.filter(c => 
            c.fullName.toLowerCase().includes(lowerSearch) ||
            c.nickname?.toLowerCase().includes(lowerSearch) ||
            c.locality?.toLowerCase().includes(lowerSearch) ||
            c.village?.toLowerCase().includes(lowerSearch) ||
            c.motherName?.toLowerCase().includes(lowerSearch) ||
            c.fatherName?.toLowerCase().includes(lowerSearch)
          );
        }

        if (activeFilter !== 'ALL') {
             // Add more specific filtering if needed
        }

        setCases(allCases);
      } catch (error) {
        console.error('Error searching cases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [searchTerm, activeFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSearchParams({ q: e.target.value });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
        <div className="flex-1 max-w-2xl relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name, father's name, village, landmarks..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['ALL', 'CHILDREN', 'ELDERLY', 'MENTAL HEALTH'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          RESULTS ({cases.length})
        </h2>
        <div className="flex items-center text-[11px] text-slate-400 font-bold uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors">
          <MapPin className="w-4 h-4 mr-2" />
          Near New Delhi, IN
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Searching memories...</p>
        </div>
      ) : cases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cases.map((person) => (
            <CaseCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-6">
            <SearchIcon className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2 uppercase italic tracking-tighter">No matches found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
            Try searching with broader terms or just the village name. You can also use our AI Chatbot for smarter search.
          </p>
          <button 
              onClick={() => setSearchTerm('')} 
              className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-700"
          >
              Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
