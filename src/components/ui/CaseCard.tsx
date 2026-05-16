import React from 'react';
import { Link } from 'react-router-dom';
import { MissingPerson } from '../../types';
import { MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../../lib/utils';

interface CaseCardProps {
  person: MissingPerson;
}

export const CaseCard: React.FC<CaseCardProps> = ({ person }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-slate-50 border border-slate-100 rounded-xl p-3 flex gap-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer"
    >
      <Link to={`/case/${person.id}`} className="flex gap-4 w-full">
        <div className="w-24 h-24 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 relative">
          <img
            src={person.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.fullName}`}
            alt={person.fullName}
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
          />
          {person.rewardAvailable && (
            <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-orange-500 text-white text-[8px] font-bold rounded uppercase">
              ₹{(person.rewardAmount || 0) / 1000}k
            </div>
          )}
        </div>
        
        <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
          <div>
            <h3 className="font-bold text-slate-800 leading-tight truncate">
              {person.fullName}, {person.age}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Missing: <span className="text-slate-700 font-medium">{formatDate(person.missingDate || person.createdAt)}</span>
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              From: <span className="text-slate-700 font-medium">{person.locality || person.village}</span>
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
              person.status === 'ACTIVE' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
            }`}>
              {person.status}
            </span>
            <span className="text-[10px] text-blue-600 font-bold underline decoration-blue-200 underline-offset-2">View Details</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
