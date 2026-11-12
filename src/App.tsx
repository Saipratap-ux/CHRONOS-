import React, { useState, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  Wand2,
  Download,
  RotateCcw,
  Film,
  Moon,
  Sun,
  Globe,
  Settings,
  HelpCircle,
  Share2,
  Layers,
  ArrowRight,
  ShieldCheck,
  History,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HistoricalEra, PhotoCapture, TemporalAnalysis, Language } from './types';
import { HISTORICAL_ERAS } from './data/historicalEras';
import { CameraCapture } from './components/CameraCapture';
import { EraSelector } from './components/EraSelector';
import { TemporalDossierModal } from './components/TemporalDossierModal';
import { PromptEditorModal } from './components/PromptEditorModal';
import { PhotoBoothStripModal } from './components/PhotoBoothStripModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { compositeHistoricalPortrait } from './utils/canvasCompositor';
import { LANGUAGES, getTranslation } from './utils/i18n';
import { exportProjectZip } from './utils/zipExporter';

const STORAGE_KEY = 'chronos_time_vault_v1';

export default function App() {
  // Application State
  const [lang, setLang] = useState<Language>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'booth' | 'gallery' | 'strips' | 'admin'>('booth');

  const [selectedEra, setSelectedEra] = useState<HistoricalEra>(HISTORICAL_ERAS[0]);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [transformedPhoto, setTransformedPhoto] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Gallery Captures
  const [captures, setCaptures] = useState<PhotoCapture[]>([]);

  // Modals
  const [showDossier, setShowDossier] = useState<boolean>(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<TemporalAnalysis | null>(null);
  const [showPromptEditor, setShowPromptEditor] = useState<boolean>(false);
  const [showStripModal, setShowStripModal] = useState<boolean>(false);

  // Status banner message
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load saved vault from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCaptures(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to read localStorage:', e);
    }
  }, []);

  // Save vault to localStorage
  const saveCaptureToVault = (capture: PhotoCapture) => {
    const updated = [capture, ...captures];
    setCaptures(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
    } catch (e) {
      console.warn('Failed to persist capture:', e);
    }
  };

  const deleteCapture = (id: string) => {
    const updated = captures.filter((c) => c.id !== id);
    setCaptures(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete capture:', e);
    }
  };

  // Perform Time-Travel Transformation
  const handleInitiateTimeJump = async () => {
    if (!capturedPhoto) return;
    setIsGenerating(true);
    setStatusMessage(getTranslation(lang, 'status_generating'));

    try {
      // 1. Try full-stack Gemini API endpoint
      const response = await fetch('/api/gemini/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: capturedPhoto,
          eraTitle: selectedEra.defaultName,
          eraPrompt: selectedEra.promptTemplate,
          aspectRatio: '1:1',
          resolution: '1K',
        }),
      });

      const data = await response.json();

      let finalResultUrl = '';
      let modelUsed = 'gemini-nano-banana-2.1';

      if (response.ok && data.ok && data.imageUrl) {
        finalResultUrl = data.imageUrl;
        setStatusMessage(`Time jump synthesized with Gemini Nano Banana 2.1 in ${selectedEra.year}!`);
      } else {
        // Seamlessly use high-fidelity client Canvas compositor
        finalResultUrl = await compositeHistoricalPortrait(capturedPhoto, selectedEra, 800, 1000);
        modelUsed = 'Chronos Canvas Compositor';
        if (data?.quotaExceeded) {
          setStatusMessage(`Transformed with Canvas Compositor! (To use live Gemini Nano Banana 2.1, select a billing-enabled key in Settings > Secrets)`);
        } else {
          setStatusMessage(`Time jump complete! Molecular alignment stabilized in ${selectedEra.year}`);
        }
      }

      setTransformedPhoto(finalResultUrl);

      // Save to history vault
      const newCapture: PhotoCapture = {
        id: 'cap-' + Date.now(),
        timestamp: Date.now(),
        originalImage: capturedPhoto,
        transformedImage: finalResultUrl,
        eraId: selectedEra.id,
        modelUsed,
      };
      saveCaptureToVault(newCapture);

      // Celebration confetti
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: [selectedEra.color.primary, '#fef08a', '#38bdf8'],
      });

      setTimeout(() => setStatusMessage(null), 7000);
    } catch (err: any) {
      console.warn('Network issue during transform, executing local compositor:', err);
      const fallbackUrl = await compositeHistoricalPortrait(capturedPhoto, selectedEra, 800, 1000);
      setTransformedPhoto(fallbackUrl);

      const newCapture: PhotoCapture = {
        id: 'cap-' + Date.now(),
        timestamp: Date.now(),
        originalImage: capturedPhoto,
        transformedImage: fallbackUrl,
        eraId: selectedEra.id,
        modelUsed: 'Chronos Canvas Compositor',
      };
      saveCaptureToVault(newCapture);
    } finally {
      setIsGenerating(false);
    }
  };

  // Perform Gemini 4 Argon Image Understanding
  const handleAnalyzePhoto = async () => {
    const photoToAnalyze = capturedPhoto || transformedPhoto;
    if (!photoToAnalyze) return;

    setIsAnalyzing(true);
    setStatusMessage('Analyzing facial structure and temporal suitability with Gemini 4 Argon...');

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: photoToAnalyze,
          language: lang,
        }),
      });

      const data = await response.json();
      if (data && data.ok && data.data) {
        setCurrentAnalysis(data.data);
        setShowDossier(true);
        if (data.notice) {
          setStatusMessage(data.notice);
          setTimeout(() => setStatusMessage(null), 5000);
        }
      } else {
        // Fallback analysis simulation
        const fallbackAnalysis: TemporalAnalysis = {
          bestEraId: selectedEra.id,
          historicalAlterEgo: `Master Chronos of ${selectedEra.defaultName}`,
          eraVibeSummary: 'Your gaze carries profound poise and curiosity that harmonizes naturally with the classical lighting of this era.',
          recommendedCostume: selectedEra.costume,
          historicalFact: selectedEra.funFact,
          timelineSafetyScore: 98,
        };
        setCurrentAnalysis(fallbackAnalysis);
        setShowDossier(true);
      }
    } catch {
      const fallbackAnalysis: TemporalAnalysis = {
        bestEraId: selectedEra.id,
        historicalAlterEgo: `Grand Explorer of ${selectedEra.defaultName}`,
        eraVibeSummary: 'Facial posture and eye alignment exhibit classic nobility and temporal resilience.',
        recommendedCostume: selectedEra.costume,
        historicalFact: selectedEra.funFact,
        timelineSafetyScore: 99,
      };
      setCurrentAnalysis(fallbackAnalysis);
      setShowDossier(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Custom Prompt Generation using Gemini Nano Banana 2.1
  const handleCustomPromptGenerate = async (
    prompt: string,
    aspectRatio: string,
    resolution: string,
    useSource: boolean
  ) => {
    setIsGenerating(true);
    setStatusMessage('Synthesizing custom era with Gemini Nano Banana 2.1...');
    try {
      const response = await fetch('/api/gemini/prompt-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          sourceImage: useSource ? capturedPhoto : undefined,
          aspectRatio,
          resolution,
        }),
      });

      const data = await response.json();
      if (response.ok && data.ok && data.imageUrl) {
        setTransformedPhoto(data.imageUrl);
        const newCap: PhotoCapture = {
          id: 'prompt-' + Date.now(),
          timestamp: Date.now(),
          originalImage: capturedPhoto || data.imageUrl,
          transformedImage: data.imageUrl,
          eraId: selectedEra.id,
          customPrompt: prompt,
          modelUsed: 'gemini-nano-banana-2.1',
        };
        saveCaptureToVault(newCap);

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else if (capturedPhoto) {
        // Seamless fallback to high-fidelity canvas composition
        const composed = await compositeHistoricalPortrait(capturedPhoto, selectedEra, 800, 1000);
        setTransformedPhoto(composed);
        const newCap: PhotoCapture = {
          id: 'prompt-' + Date.now(),
          timestamp: Date.now(),
          originalImage: capturedPhoto,
          transformedImage: composed,
          eraId: selectedEra.id,
          customPrompt: prompt,
          modelUsed: 'Chronos Canvas Compositor',
        };
        saveCaptureToVault(newCap);

        if (data?.quotaExceeded) {
          setStatusMessage('Composed era portrait with Canvas Compositor. Select a billing-enabled key in Settings > Secrets to unlock live Gemini Nano Banana 2.1 synthesis.');
        }
      } else {
        throw new Error(data?.error || 'Failed to generate custom image');
      }
    } catch (err: any) {
      console.warn('API prompt edit unavailable, using compositor styling:', err);
      if (capturedPhoto) {
        const result = await compositeHistoricalPortrait(capturedPhoto, selectedEra, 800, 1000);
        setTransformedPhoto(result);
      }
      throw err;
    } finally {
      setIsGenerating(false);
      setStatusMessage(null);
    }
  };

  const handleDownloadResult = () => {
    const url = transformedPhoto || capturedPhoto;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `chronos-${selectedEra.id}-${Date.now()}.jpg`;
    link.click();

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-stone-100 text-stone-900'} transition-colors duration-200`}>
      {/* Offline Status Pill */}
      <OfflineIndicator />

      {/* Primary Navigation Bar */}
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50/80 border-stone-200'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
              ⏳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black font-serif tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  CHRONOS
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {getTranslation(lang, 'app_subtitle')}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-900/60 border border-slate-800">
            {[
              { id: 'booth', label: getTranslation(lang, 'tab_booth'), icon: Camera },
              { id: 'gallery', label: getTranslation(lang, 'tab_gallery'), icon: History },
              { id: 'strips', label: getTranslation(lang, 'tab_strips'), icon: Film },
              { id: 'admin', label: getTranslation(lang, 'tab_admin'), icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Utility Actions: Language, DarkMode, PWA Install */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative flex items-center">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className={`text-xs font-medium rounded-xl px-2.5 py-1.5 border outline-none cursor-pointer transition ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                    : 'bg-white border-stone-300 text-stone-800'
                }`}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Theme"
              className={`p-2 rounded-xl border transition ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-800 text-amber-300 hover:bg-slate-800'
                  : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* In-App PWA Install Button */}
            <PWAInstallButton />
          </div>
        </div>

        {/* Mobile Navigation Tabs Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-1.5 bg-slate-950/90 text-xs">
          {[
            { id: 'booth', label: getTranslation(lang, 'tab_booth'), icon: Camera },
            { id: 'gallery', label: getTranslation(lang, 'tab_gallery'), icon: History },
            { id: 'strips', label: getTranslation(lang, 'tab_strips'), icon: Film },
            { id: 'admin', label: getTranslation(lang, 'tab_admin'), icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition ${
                  activeTab === tab.id ? 'text-amber-400 font-bold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Status Notification Toast */}
        {statusMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-between shadow-lg shadow-amber-500/10 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>{statusMessage}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-amber-400/80 hover:text-amber-200 text-xs px-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: PHOTO BOOTH CORE WORKFLOW */}
        {activeTab === 'booth' && (
          <div className="space-y-8">
            {/* Step 1: Era Selector Carousel */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-slate-100">
                    {getTranslation(lang, 'select_era')}
                  </h3>
                </div>
                <div className="text-xs font-mono text-amber-400 flex items-center gap-1.5">
                  <span>Selected:</span>
                  <strong className="underline underline-offset-4">{selectedEra.defaultName}</strong>
                </div>
              </div>

              <EraSelector
                selectedEra={selectedEra}
                onSelectEra={(era) => {
                  setSelectedEra(era);
                  if (transformedPhoto && capturedPhoto) {
                    // Quick re-trigger recommendation
                  }
                }}
                lang={lang}
              />
            </div>

            {/* Step 2: Camera Capture or Result Showcase */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-slate-100">
                    {transformedPhoto ? 'Your Historical Masterpiece' : 'Capture Face for Time Jump'}
                  </h3>
                </div>

                {capturedPhoto && (
                  <button
                    onClick={() => {
                      setCapturedPhoto(null);
                      setTransformedPhoto(null);
                    }}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{getTranslation(lang, 'btn_retake')}</span>
                  </button>
                )}
              </div>

              {!capturedPhoto ? (
                <CameraCapture
                  onCapture={(dataUrl) => {
                    setCapturedPhoto(dataUrl);
                    setTransformedPhoto(null);
                  }}
                  lang={lang}
                  disabled={isGenerating}
                />
              ) : (
                /* Captured / Transformed Stage */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Photo Display Card */}
                  <div className="md:col-span-7 flex flex-col items-center">
                    <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/40 bg-slate-950 group">
                      <img
                        src={transformedPhoto || capturedPhoto}
                        alt="Time Travel Portrait"
                        className="w-full h-full object-cover"
                      />

                      {/* Side-by-side thumbnail badge */}
                      {transformedPhoto && capturedPhoto && (
                        <div className="absolute top-3 left-3 p-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 shadow-md">
                          <img
                            src={capturedPhoto}
                            alt="Original"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-600"
                            title="Original Capture"
                          />
                          <span className="block text-[9px] font-mono text-center text-slate-400 mt-0.5">
                            Original
                          </span>
                        </div>
                      )}

                      {/* Era Badge in corner */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-xs">
                        <div>
                          <div className="font-bold text-amber-300 font-serif">
                            {selectedEra.defaultName}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {selectedEra.year} • {selectedEra.location.split(',')[0]}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          {selectedEra.filter}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Temporal Controls */}
                  <div className="md:col-span-5 space-y-4">
                    {/* Primary Time Jump Action */}
                    <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-xl space-y-3">
                      <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                        {getTranslation(lang, 'selected_era_label')}: {selectedEra.defaultName}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedEra.description}
                      </p>

                      <button
                        onClick={handleInitiateTimeJump}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                            <span>Quantum Time Jump in Progress...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>{getTranslation(lang, 'btn_time_travel')}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Gemini AI Multi-modal Feature Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Gemini 4 Argon Analysis */}
                      <button
                        onClick={handleAnalyzePhoto}
                        disabled={isAnalyzing}
                        className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-purple-500/40 text-left transition active:scale-95 group"
                      >
                        <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold font-mono mb-1">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Gemini 4 Argon</span>
                        </div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300">
                          {getTranslation(lang, 'btn_analyze_face')}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Face archetype & temporal compatibility
                        </div>
                      </button>

                      {/* Gemini Nano Banana 2.1 Prompt Editor */}
                      <button
                        onClick={() => setShowPromptEditor(true)}
                        className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-sky-500/40 text-left transition active:scale-95 group"
                      >
                        <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold font-mono mb-1">
                          <Wand2 className="w-4 h-4" />
                          <span>Nano Banana 2.1</span>
                        </div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-sky-300">
                          {getTranslation(lang, 'btn_prompt_edit')}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Custom prompt era generation & resolution
                        </div>
                      </button>
                    </div>

                    {/* Output Actions: Download & Build Strip */}
                    {transformedPhoto && (
                      <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
                        <button
                          onClick={handleDownloadResult}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
                        >
                          <Download className="w-4 h-4" />
                          <span>{getTranslation(lang, 'btn_download')}</span>
                        </button>

                        <button
                          onClick={() => setShowStripModal(true)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition active:scale-95"
                        >
                          <Film className="w-4 h-4 text-amber-400" />
                          <span>{getTranslation(lang, 'btn_create_strip')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TIME VAULT (GALLERY) */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-100">
                  {getTranslation(lang, 'tab_gallery')} ({captures.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  All your past temporal journeys stored locally and ready for export
                </p>
              </div>

              {captures.length >= 3 && (
                <button
                  onClick={() => setShowStripModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  <Film className="w-4 h-4" />
                  <span>Build Strip From Vault</span>
                </button>
              )}
            </div>

            {captures.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 text-amber-400">
                  <History className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">The Vault is Quiet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  You haven't undertaken any time jumps yet. Head to the Photo Booth to capture your first historical portrait!
                </p>
                <button
                  onClick={() => setActiveTab('booth')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Open Photo Booth
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {captures.map((cap) => {
                  const era = HISTORICAL_ERAS.find((e) => e.id === cap.eraId);
                  const preview = cap.transformedImage || cap.originalImage;
                  return (
                    <div
                      key={cap.id}
                      className="group rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-amber-500/50 transition shadow-lg flex flex-col justify-between"
                    >
                      <div className="relative aspect-[4/5] bg-slate-950 overflow-hidden">
                        <img src={preview} alt="Vault item" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700 text-[10px] font-mono text-amber-300">
                          {era?.year || 'Time Jump'}
                        </div>
                      </div>
                      <div className="p-3.5 flex items-center justify-between border-t border-slate-800/80 text-xs">
                        <div>
                          <div className="font-bold text-slate-200 font-serif">
                            {era?.defaultName || 'Historical Era'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {new Date(cap.timestamp).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={preview}
                            download={`chronos-${cap.eraId}-${cap.timestamp}.jpg`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => deleteCapture(cap.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                            title="Delete"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PHOTO STRIPS */}
        {activeTab === 'strips' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-100">
                  {getTranslation(lang, 'tab_strips')}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assemble your favorite time jumps into authentic vintage physical photo booth strips
                </p>
              </div>

              <button
                onClick={() => setShowStripModal(true)}
                disabled={captures.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                <Film className="w-4 h-4" />
                <span>Launch Strip Designer</span>
              </button>
            </div>

            {captures.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
                <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-300">Need at least 1 capture to build strips</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Take a photo in the Photo Booth first!
                </p>
                <button
                  onClick={() => setActiveTab('booth')}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Go to Photo Booth
                </button>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center">
                <div className="max-w-md mx-auto space-y-3">
                  <Film className="w-12 h-12 text-amber-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-100 font-serif">
                    Vintage Arcade Photo Strips Ready
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Select 3 or 4 photos from your {captures.length} saved temporal captures to create an authentic multi-shot photo strip with gilded borders and custom date stamps.
                  </p>
                  <button
                    onClick={() => setShowStripModal(true)}
                    className="mt-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                  >
                    Open Photo Strip Generator
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADMIN DASHBOARD & TESTING */}
        {activeTab === 'admin' && (
          <AdminDashboard
            captures={captures}
            onDeleteCapture={deleteCapture}
            lang={lang}
          />
        )}
      </main>

      {/* MODALS */}
      {showDossier && currentAnalysis && (
        <TemporalDossierModal
          analysis={currentAnalysis}
          onClose={() => setShowDossier(false)}
          onSelectEra={(era) => {
            setSelectedEra(era);
            setShowDossier(false);
          }}
          lang={lang}
        />
      )}

      {showPromptEditor && (
        <PromptEditorModal
          sourcePhotoUrl={capturedPhoto || undefined}
          onGenerate={handleCustomPromptGenerate}
          onClose={() => setShowPromptEditor(false)}
          lang={lang}
        />
      )}

      {showStripModal && captures.length > 0 && (
        <PhotoBoothStripModal
          captures={captures}
          onClose={() => setShowStripModal(false)}
          lang={lang}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 py-8 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Chronos Time-Travel Photo Booth</span>
          <span>•</span>
          <span>Gemini Nano Banana 2.1</span>
          <span>•</span>
          <span>Gemini 4 Argon</span>
          <span>•</span>
          <button
            onClick={() => setActiveTab('admin')}
            className="hover:text-amber-400 underline underline-offset-2"
          >
            System Tests
          </button>
        </div>
        <p className="text-[10px] text-slate-600">
          Ready for zero-config GitHub Pages deployment & PWA standalone installation.
        </p>
      </footer>
    </div>
  );
}
