import React from 'react';
import { Briefcase, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function RecommendationCard({ recommendation }) {
  const isCourse = recommendation.type === 'course';
  
  return (
    <div className={`p-5 rounded-2xl shadow-lg border mb-4 bg-white/80 backdrop-blur-sm transition-all hover:-translate-y-1 ${
      isCourse ? 'border-blue-100 shadow-blue-500/10' : 'border-emerald-100 shadow-emerald-500/10'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl shrink-0 ${
          isCourse ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
        }`}>
          {isCourse ? <BookOpen size={24} /> : <Briefcase size={24} />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
              isCourse ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {isCourse ? 'Training' : 'Job / Work'}
            </span>
            {recommendation.rank && (
              <span className="text-xs font-medium text-slate-400">Match #{recommendation.rank}</span>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            {recommendation.titleHi || recommendation.title || (isCourse ? 'Course Name' : 'Job Name')}
          </h3>
          
          <div className="space-y-2 mb-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-700">Kyun sikhna chahiye?</span> <br/>
              {recommendation.reason}
            </p>
            
            {recommendation.skillGap && recommendation.skillGap !== 'none' && recommendation.skillGap !== 'Pata nahi' && (
              <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                <span className="font-semibold">Kya seekhna baaki hai:</span> {recommendation.skillGap}
              </p>
            )}
          </div>
          
          <button className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
            isCourse 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}>
            {recommendation.nextStep || 'Aur jaankari lein'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
