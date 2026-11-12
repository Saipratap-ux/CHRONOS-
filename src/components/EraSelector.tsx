import React, { useState } from 'react';
import { Sparkles, Compass, Clock, Check } from 'lucide-react';
import { HistoricalEra, Language } from '../types';
import { HISTORICAL_ERAS } from '../data/historicalEras';
import { getTranslation } from '../utils/i18n';

interface Props {
  selectedEra: HistoricalEra;
  onSelectEra: (era: HistoricalEra) => void;
  lang: Language;
}

export const EraSelector: React.FC<Props> = ({ selectedEra, onSelectEra, lang }) => {
  const [filterCentury, setFilterCentury] = useState<string>('all');

  const filteredEras = HISTORICAL_ERAS.filter((era) => {
    if (filterCentury === 'ancient') return era.id === 'egypt';
    if (filterCentury === 'medieval_renaissance') return ['renaissance', 'japan', 'medieval'].includes(era.id);
    if (filterCentury === 'modern') return ['1920s', 'wildwest', 'victorian', 'paris1900', 'space'].includes(era.id);
    if (filterCentury === 'future') return era.id === 'cyber2099';
    return true;
  });

  return (
    <div className="w-full">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        {[
          { id: 'all', label: getTranslation(lang, 'filter_all') },
          { id: 'ancient', label: 'Ancient' },
          { id: 'medieval_renaissance', label: 'Medieval & Renaissance' },
          { id: 'modern', label: 'Vintage & Modern' },
          { id: 'future', label: 'Future Sci-Fi' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCentury(tab.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl border transition ${
              filterCentury === tab.id
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Eras Card Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-3">
        {filteredEras.map((era) => {
          const isSelected = selectedEra.id === era.id;
          return (
            <button
              key={era.id}
              onClick={() => onSelectEra(era)}
              className={`group relative text-left rounded-2xl p-3 border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-400 bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-900 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/50 scale-[1.02]'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              {/* Glowing accent backdrop */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 transition group-hover:opacity-40"
                style={{ backgroundColor: era.color.primary }}
              />

              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border"
                    style={{
                      borderColor: `${era.color.primary}60`,
                      backgroundColor: `${era.color.primary}20`,
                      color: era.color.accent,
                    }}
                  >
                    {era.year}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-300 transition line-clamp-1 font-serif">
                  {era.defaultName}
                </h4>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {era.tagline}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate flex items-center gap-1">
                  <Compass className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{era.location.split(',')[0]}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
