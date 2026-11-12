import React, { useState } from 'react';
import { X, Wand2, Sparkles, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/i18n';

interface Props {
  sourcePhotoUrl?: string;
  onGenerate: (prompt: string, aspectRatio: string, resolution: string, useSource: boolean) => Promise<void>;
  onClose: () => void;
  lang: Language;
}

const PROMPT_SUGGESTIONS = [
  'Viking warrior on a dragon longboat under blazing emerald Northern Lights',
  'Roman Emperor with gold laurel wreath overlooking the Colosseum in 80 CE',
  'Venetian Carnevale noble in 1600 wearing an ornate feathered masquerade mask',
  '1920s Harlem jazz virtuoso playing saxophone in a velvet speakeasy club',
  'Cyberpunk chronos detective in rainy Neo-Shinjuku with glowing neural visor',
  'Impressionist oil painting in Monet water lily garden in Giverny, 1899',
];

export const PromptEditorModal: React.FC<Props> = ({
  sourcePhotoUrl,
  onGenerate,
  onClose,
  lang,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [resolution, setResolution] = useState('1K');
  const [useSource, setUseSource] = useState(Boolean(sourcePhotoUrl));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await onGenerate(prompt.trim(), aspectRatio, resolution, useSource);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Generation failed. Check server status or API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-amber-500/40 p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{getTranslation(lang, 'gemini_nano_badge')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-100 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-amber-400" />
              {getTranslation(lang, 'btn_prompt_edit')}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Describe your custom time-travel scene or portrait transformation:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={getTranslation(lang, 'prompt_placeholder')}
              rows={3}
              required
              className="w-full rounded-2xl bg-slate-950 border border-slate-700 focus:border-amber-400 p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition resize-none"
            />
          </div>

          {/* Quick preset suggestions */}
          <div>
            <span className="block text-[11px] font-mono text-slate-400 mb-2">
              Quick Temporal Ideas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_SUGGESTIONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(preset)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-amber-950/40 border border-slate-700/80 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-amber-300 transition text-left"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Source photo toggle */}
          {sourcePhotoUrl && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-3">
                <img
                  src={sourcePhotoUrl}
                  alt="Source"
                  className="w-10 h-10 rounded-lg object-cover border border-amber-500/40"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Use Captured Photo as Face Reference
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Inserts your face features into the generated historical scene
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={useSource}
                onChange={(e) => setUseSource(e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          )}

          {/* Configuration Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                {getTranslation(lang, 'aspect_ratio')}
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 p-2.5 outline-none focus:border-amber-400"
              >
                <option value="1:1">1:1 Square</option>
                <option value="3:4">3:4 Portrait</option>
                <option value="4:3">4:3 Landscape</option>
                <option value="16:9">16:9 Widescreen</option>
                <option value="9:16">9:16 Story</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                {getTranslation(lang, 'resolution')} (Nano Banana 2.1)
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 p-2.5 outline-none focus:border-amber-400"
              >
                <option value="1K">1K Standard (Fast)</option>
                <option value="2K">2K High Definition</option>
                <option value="4K">4K Ultra Resolution</option>
              </select>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-mono">
            * Gemini Nano Banana 2.1 uses your billing-enabled key from Settings &gt; Secrets. If using a free key, high-fidelity canvas composition is applied.
          </p>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Synthesizing Era with Gemini Nano Banana...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{getTranslation(lang, 'generate_ai')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
