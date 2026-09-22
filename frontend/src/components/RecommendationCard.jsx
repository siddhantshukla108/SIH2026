import React from 'react';
import { Briefcase, BookOpen, ChevronRight } from 'lucide-react';

export default function RecommendationCard({ recommendation }) {
  const isCourse = recommendation.type === 'course';
  
  return (
    <div className={`p-5 rounded-2xl shadow-lg border mb-4 backdrop-blur-sm transition-all hover:-translate-y-1 ${
      isCourse 
        ? 'bg-white/80 dark:bg-slate-800/80 border-blue-100 dark:border-blue-900/50 shadow-blue-500/10 dark:shadow-blue-900/20' 
        : 'bg-white/80 dark:bg-slate-800/80 border-emerald-100 dark:border-emerald-900/50 shadow-emerald-500/10 dark:shadow-emerald-900/20'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl shrink-0 ${
          isCourse 
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
            : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
        }`}>
          {isCourse ? <BookOpen size={24} /> : <Briefcase size={24} />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
              isCourse 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
            }`}>
              {isCourse ? 'Training' : 'Job / Work'}
            </span>
            {recommendation.rank && (
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Match #{recommendation.rank}</span>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
            {recommendation.titleHi || recommendation.title || (isCourse ? 'Course Name' : 'Job Name')}
          </h3>
          
          <div className="space-y-2 mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Kyun sikhna chahiye?</span> <br/>
              {recommendation.reason}
            </p>
            
            {recommendation.skillGap && recommendation.skillGap !== 'none' && recommendation.skillGap !== 'Pata nahi' && (
              <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
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
