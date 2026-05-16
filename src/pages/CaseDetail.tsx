import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MissingPerson, FoundReport } from '../types';
import { MapPin, Calendar, Clock, Phone, MessageSquare, Share2, AlertTriangle, CheckCircle, ChevronLeft, Loader2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

export function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<MissingPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFoundForm, setShowFoundForm] = useState(false);
  const [foundSubmitting, setFoundSubmitting] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'missing_persons', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPerson({ id: docSnap.id, ...docSnap.data() } as MissingPerson);
        }
      } catch (error) {
        console.error('Error fetching case:', error);
        toast.error('Failed to load case details');
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  const handleFoundSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setFoundSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      missingPersonId: id,
      helperName: formData.get('helperName'),
      helperPhone: formData.get('helperPhone'),
      currentLocation: formData.get('currentLocation'),
      notes: formData.get('notes'),
      status: 'PENDING',
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'found_reports'), data);
      toast.success('Information submitted! Thank you for your help.');
      setShowFoundForm(false);
    } catch (error) {
      toast.error('Failed to submit information');
    } finally {
      setFoundSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center text-gray-500 font-medium">
        Case not found or has been removed.
      </div>
    );
  }

  const sections = [
    {
      title: "Physical Description",
      items: [
        { label: "Age", value: `${person.age} years` },
        { label: "Gender", value: person.gender },
        { label: "Height", value: person.height },
        { label: "Clothing", value: person.clothingDescription },
        { label: "Language", value: person.languageSpoken },
      ]
    },
    {
      title: "Memory Fragments",
      items: [
        { label: "Mother", value: person.motherName },
        { label: "Father", value: person.fatherName },
        { label: "Siblings", value: person.siblingNames },
        { label: "School", value: person.school },
        { label: "Village", value: person.village },
        { label: "Nearby Landmark", value: person.nearbyLandmark },
      ]
    },
    {
      title: "Last Seen Details",
      items: [
        { label: "Location", value: person.lastSeenLocation },
        { label: "Date", value: formatDate(person.missingDate || person.createdAt) },
        { label: "Condition", value: person.mentalCondition || person.medicalCondition },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/search" className="inline-flex items-center text-slate-400 hover:text-slate-800 font-bold mb-8 transition-colors group text-[11px] uppercase tracking-widest">
        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Search
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Images and Key Info */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-slate-200"
          >
            <img 
              src={person.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.fullName}`}
              alt={person.fullName}
              className="w-full h-full object-cover"
            />
            {person.rewardAvailable && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-orange-500 text-white font-bold text-[10px] uppercase tracking-widest rounded shadow-lg">
                 ₹{person.rewardAmount?.toLocaleString()} REWARD
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent">
              <h1 className="text-3xl font-black text-white mb-1 tracking-tight">{person.fullName}</h1>
              <div className="flex items-center text-blue-300 text-sm font-medium">
                 <MapPin className="w-4 h-4 mr-1.5" />
                 {person.locality || person.village}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest">
               <Share2 className="w-4 h-4" />
               Share
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:text-red-600 transition-all text-xs uppercase tracking-widest">
               <AlertTriangle className="w-4 h-4" />
               Report
            </button>
          </div>

          <div className="p-6 bg-slate-900 rounded-2xl shadow-xl text-white space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
               <Phone className="w-4 h-4" />
               Contact Family
            </h3>
            <div className="space-y-3">
              <a href={`tel:${person.primaryPhone}`} className="block w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-center font-bold text-sm border border-white/10 transition-all">
                 Call: {person.primaryPhone}
              </a>
              <a href={`https://wa.me/${person.whatsappNumber}`} target="_blank" rel="noreferrer" className="block w-full py-3 bg-blue-600 text-white rounded-xl text-center font-bold text-sm transition-all shadow-lg active:scale-95">
                 WhatsApp Message
              </a>
            </div>
          </div>
        </div>

        {/* Right: Detailed Info */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded border border-blue-100">
               {person.status}
            </div>
            <div className="flex items-center text-[10px] uppercase font-black text-slate-400 tracking-widest">
               <Clock className="w-3.5 h-3.5 mr-1.5" />
               Published {formatDate(person.createdAt)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, si) => (
               <div key={si} className="space-y-4">
                   <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      {section.title}
                   </h2>
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 gap-4">
                      {section.items.map((item, ii) => (
                          <div key={ii} className="flex justify-between border-b border-slate-200/50 pb-2 last:border-0 last:pb-0">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                              <span className="text-sm font-bold text-slate-800">{item.value || '-'}</span>
                          </div>
                      ))}
                   </div>
               </div>
            ))}
          </div>

          <section className="bg-orange-50 rounded-2xl p-8 border border-orange-100 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Think you found them?</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                  Report sightings immediately. Data is privately routed to families.
                </p>
              </div>
              <button 
                onClick={() => setShowFoundForm(true)}
                className="px-8 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg active:scale-95"
              >
                I Found Someone
              </button>
            </div>
            <Heart className="absolute -bottom-8 -right-8 w-40 h-40 text-orange-200/20 transform rotate-12" />
          </section>
        </div>
      </div>

      {/* Found Form Modal */}
      <AnimatePresence>
        {showFoundForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFoundForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-12">
                 <h2 className="text-3xl font-bold text-gray-900 mb-2">Help Reconnect</h2>
                 <p className="text-gray-500 mb-10">Please share as much detail as possible about where and when you saw them.</p>
                 
                 <form onSubmit={handleFoundSubmit} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Your Name *</label>
                        <input name="helperName" required className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Your Phone *</label>
                        <input name="helperPhone" required className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Current Location of Person *</label>
                      <input name="currentLocation" required className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Notes / Observations</label>
                      <textarea name="notes" rows={3} className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100" placeholder="Condition, clothing, behavior..."></textarea>
                   </div>

                   <div className="flex items-center space-x-4 pt-6">
                     <button 
                        type="button" 
                        onClick={() => setShowFoundForm(false)}
                        className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-200"
                     >
                        Cancel
                     </button>
                     <button 
                        type="submit" 
                        disabled={foundSubmitting}
                        className="flex-3 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center justify-center"
                     >
                        {foundSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Findings"}
                     </button>
                   </div>
                 </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
