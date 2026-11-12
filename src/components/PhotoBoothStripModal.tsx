import React, { useState, useEffect } from 'react';
import { X, Download, Printer, Sparkles, Check, Film } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PhotoCapture, PhotoboothStripConfig, Language } from '../types';
import { generatePhotoBoothStrip } from '../utils/canvasCompositor';
import { getTranslation } from '../utils/i18n';

interface Props {
  captures: PhotoCapture[];
  onClose: () => void;
  lang: Language;
}

export const PhotoBoothStripModal: React.FC<Props> = ({ captures, onClose, lang }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [theme, setTheme] = useState<PhotoboothStripConfig['theme']>('art-deco-gold');
  const [layout, setLayout] = useState<PhotoboothStripConfig['layout']>('3-vertical');
  const [title, setTitle] = useState('CHRONOS TIME-TRAVEL ARCHIVE');
  const [generatedStripUrl, setGeneratedStripUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Initialize with latest photos
  useEffect(() => {
    const defaultCount = layout === '4-vertical' ? 4 : 3;
    const initialIds = captures.slice(0, defaultCount).map((c) => c.id);
    setSelectedIds(initialIds);
  }, [captures, layout]);

  // Generate strip whenever selection or style changes
  useEffect(() => {
    if (selectedIds.length === 0) return;

    let isMounted = true;
    const render = async () => {
      setIsRendering(true);
      try {
        const photoUrls = selectedIds
          .map((id) => captures.find((c) => c.id === id))
          .filter(Boolean)
          .map((c) => c!.transformedImage || c!.originalImage);

        if (photoUrls.length === 0) return;

        const config: PhotoboothStripConfig = {
          id: 'strip-' + Date.now(),
          layout,
          theme,
          title,
          dateStamp: new Date().toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          photoIds: selectedIds,
        };

        const resultUrl = await generatePhotoBoothStrip(photoUrls, config);
        if (isMounted) {
          setGeneratedStripUrl(resultUrl);
        }
      } catch (err) {
        console.error('Failed to generate strip:', err);
      } finally {
        if (isMounted) setIsRendering(false);
      }
    };

    render();
    return () => {
      isMounted = false;
    };
  }, [selectedIds, theme, layout, title, captures]);

  const togglePhotoSelect = (id: string) => {
    const max = layout === '4-vertical' ? 4 : 3;
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < max) {
        setSelectedIds([...selectedIds, id]);
      } else {
        // Replace oldest
        setSelectedIds([...selectedIds.slice(1), id]);
      }
    }
  };

  const handleDownload = () => {
    if (!generatedStripUrl) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#eab308', '#f59e0b', '#38bdf8', '#f43f5e'],
    });

    const link = document.createElement('a');
    link.href = generatedStripUrl;
    link.download = `chronos-photostrip-${Date.now()}.jpg`;
    link.click();
  };

  const handlePrint = () => {
    if (!generatedStripUrl) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print Chronos Photo Strip</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;">
            <img src="${generatedStripUrl}" style="max-height:98vh;object-fit:contain;" onload="window.print();window.close();"/>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-amber-500/40 p-5 sm:p-7 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-100 flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" />
              {getTranslation(lang, 'btn_create_strip')}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Classic vintage arcade photo booth souvenir with authentic date stamps
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="md:col-span-5 space-y-4">
            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Photo Strip Aesthetic:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'art-deco-gold', label: 'Art Deco Gold' },
                  { id: 'vintage-cream', label: 'Vintage Cream' },
                  { id: 'noir-black', label: 'Velvet Noir' },
                  { id: 'cyber-slate', label: 'Cyber Slate' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      theme === th.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout selector */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Strip Frame Count:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLayout('3-vertical')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                    layout === '3-vertical'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  3-Shot Strip
                </button>
                <button
                  onClick={() => setLayout('4-vertical')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                    layout === '4-vertical'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  4-Shot Strip
                </button>
              </div>
            </div>

            {/* Custom caption */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Custom Stamp Caption:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={36}
                placeholder={getTranslation(lang, 'strip_title_placeholder')}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-100 outline-none focus:border-amber-400"
              />
            </div>

            {/* Available Photos Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-slate-400">
                  Select Photos ({selectedIds.length}/{layout === '4-vertical' ? 4 : 3}):
                </label>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                {captures.map((cap) => {
                  const isSelected = selectedIds.includes(cap.id);
                  const preview = cap.transformedImage || cap.originalImage;
                  return (
                    <button
                      key={cap.id}
                      onClick={() => togglePhotoSelect(cap.id)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-95'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={preview} alt="cap" className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDownload}
                disabled={!generatedStripUrl || isRendering}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{getTranslation(lang, 'btn_download')}</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={!generatedStripUrl || isRendering}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition active:scale-95"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Strip Preview Column */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-slate-950 rounded-2xl p-4 border border-slate-800 min-h-[420px]">
            {isRendering ? (
              <div className="flex flex-col items-center gap-3 text-amber-400">
                <Sparkles className="w-8 h-8 animate-spin" />
                <span className="text-xs font-mono">Developing photo strip emulsion...</span>
              </div>
            ) : generatedStripUrl ? (
              <div className="max-h-[580px] overflow-y-auto rounded-lg shadow-2xl p-2 bg-slate-900 border border-slate-800">
                <img
                  src={generatedStripUrl}
                  alt="Photo Strip Preview"
                  className="max-h-[540px] w-auto object-contain rounded"
                />
              </div>
            ) : (
              <div className="text-xs text-slate-500">Select photos to generate strip</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
