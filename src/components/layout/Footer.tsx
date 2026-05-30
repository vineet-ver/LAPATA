import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 md:py-0">
      <div className="max-w-7xl mx-auto md:h-16 px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Found:</span>
            <span className="text-[13px] font-bold text-green-600">1,280+ People</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Communities:</span>
            <span className="text-[13px] font-bold text-blue-600">45 Cities</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accuracy:</span>
            <span className="text-[13px] font-bold text-slate-800">92% Match Rate</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-medium text-center md:text-right">
          &copy; 2026 LAPATA - Social Impact Technology Infrastructure
        </div>
      </div>
    </footer>
  );
}
