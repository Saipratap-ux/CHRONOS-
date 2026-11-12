import React from 'react';
import { X, ShieldCheck, Sparkles, BookOpen, Shirt, ArrowRight } from 'lucide-react';
import { TemporalAnalysis, Language, HistoricalEra } from '../types';
import { HISTORICAL_ERAS } from '../data/historicalEras';
import { getTranslation } from '../utils/i18n';

interface Props {
  analysis: TemporalAnalysis;
  onClose: () => void;
  onSelectEra: (era: HistoricalEra) => void;
  lang: Language;
}

export const TemporalDossierModal: React.FC<Props> = ({
  analysis,
  onClose,
  onSelectEra,
  lang,
}) => {
  const matchedEra =
    HISTORICAL_ERAS.find((e) => e.id === analysis.bestEraId) ||
    HISTORICAL_ERAS.find((e) => e.id === 'renaissance') ||
    HISTORICAL_ERAS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Ornate Gold Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{getTranslation(lang, 'gemini_argon_badge')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-100">
              {getTranslation(lang, 'dossier_title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alter Ego Hero Card */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 p-5 mb-5 shadow-lg relative overflow-hidden">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400/90 font-bold mb-1">
            {getTranslation(lang, 'alter_ego')}
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-amber-200">
            {analysis.historicalAlterEgo}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safety: {analysis.timelineSafetyScore}%</span>
            </div>
            <div className="text-xs text-slate-300 font-mono">
              Era Affinity: <strong className="text-amber-300">{matchedEra.defaultName}</strong>
            </div>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <h4 className="font-bold text-slate-200 flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Face & Period Alignment
            </h4>
            <p className="text-slate-300 leading-relaxed">{analysis.eraVibeSummary}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <h4 className="font-bold text-slate-200 flex items-center gap-2 mb-1.5">
              <Shirt className="w-4 h-4 text-sky-400" />
              {getTranslation(lang, 'costume_details')}
            </h4>
            <p className="text-slate-300 leading-relaxed">{analysis.recommendedCostume}</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30">
            <h4 className="font-bold text-amber-300 flex items-center gap-2 mb-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              {getTranslation(lang, 'fun_fact')}
            </h4>
            <p className="text-amber-200/90 leading-relaxed">{analysis.historicalFact}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              onSelectEra(matchedEra);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
          >
            <span>Jump to {matchedEra.defaultName}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
