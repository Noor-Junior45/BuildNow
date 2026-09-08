import React from 'react';
import { ChevronRight, Phone } from 'lucide-react';
import { Technician } from '../../types/technician';
import { hapticSelection } from '../../utils/haptics';

interface TechnicianCardProps {
  technician: Technician;
  onSelect: (technician: Technician) => void;
}

export const TechnicianCard: React.FC<TechnicianCardProps> = ({
  technician,
  onSelect
}) => {
  const displayName = (technician.name || '').trim() || 'Technician Specialist';
  const cleanId = technician.id ? technician.id.trim() : 'tech-item';

  const shortAiDescription =
    technician.aiDescription ||
    `${technician.experienceYears}+ years experienced ${technician.title.toLowerCase()} specialized in ${
      technician.subSectors?.[0] || technician.primarySector
    } with verified field expertise across Kolkata.`;

  return (
    <div
      id={`technician-card-${cleanId}`}
      onClick={() => {
        hapticSelection();
        onSelect(technician);
      }}
      className="group relative bg-white hover:bg-slate-50/80 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between select-none"
    >
      <div>
        {/* Top Row: Left Photo + Right (Name, Rating, Experience, Jobs Done) */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          {/* Left Side: Photo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
            <img
              src={technician.photo}
              alt={displayName}
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Beside Photo: Name and [Rating, Experience, Job Done] */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {displayName}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1 flex-wrap">
              <span className="text-amber-500 font-bold">★ {technician.rating.toFixed(1)}</span>
              <span className="text-slate-300">·</span>
              <span>{technician.experienceYears}+ Yrs Exp</span>
              <span className="text-slate-300">·</span>
              <span>{technician.completedJobs}+ Jobs Done</span>
            </div>
          </div>
        </div>

        {/* Below of it: Tag / Profession & Short Gemini Synthesized Description [Pure borderless text] */}
        <div className="mt-3 space-y-1">
          <p className="text-xs font-semibold text-slate-800 tracking-tight">
            {technician.title}
            {technician.primarySector ? ` • ${technician.primarySector}` : ''}
          </p>

          <p className="text-xs text-slate-500 leading-relaxed font-normal line-clamp-2">
            {shortAiDescription}
          </p>
        </div>
      </div>

      {/* Card Footer: Starting Price + Explicit View Profile CTA Button */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-xs">
          <span className="font-bold text-slate-900 text-sm">₹{technician.startingRate}</span>
          <span className="text-[11px] text-slate-500 ml-1">/{technician.rateUnit || 'visit'}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            hapticSelection();
            onSelect(technician);
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
