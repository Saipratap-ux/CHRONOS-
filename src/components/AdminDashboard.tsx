import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Settings,
  Sparkles,
  Activity,
  Layers,
  Database,
  ExternalLink,
  Github,
  Trash2,
  FileCode2,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HistoricalEra, PhotoCapture, Language } from '../types';
import { HISTORICAL_ERAS } from '../data/historicalEras';
import { AutomatedTestRunner } from './AutomatedTestRunner';
import { exportProjectZip } from '../utils/zipExporter';

interface Props {
  captures: PhotoCapture[];
  onDeleteCapture: (id: string) => void;
  lang: Language;
}

export const AdminDashboard: React.FC<Props> = ({ captures, onDeleteCapture, lang }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'tests' | 'deploy' | 'eras'>('stats');
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setServerHealth(data))
      .catch(() => setServerHealth({ status: 'static_mode', hasApiKey: false }));
  }, []);

  // Compute Era Popularity Stats
  const eraStats = captures.reduce<Record<string, number>>((acc, cap) => {
    acc[cap.eraId] = (acc[cap.eraId] || 0) + 1;
    return acc;
  }, {});

  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      const zipBlob = await exportProjectZip();
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'chronos-time-travel-photobooth.zip';
      link.click();
      URL.revokeObjectURL(url);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 4000);
    } catch (err) {
      console.error('ZIP export failed:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Admin Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold mb-1">
            <Activity className="w-4 h-4" />
            <span>CHRONOS SYSTEM ADMIN & LAB</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-100">
            Temporal Operations Dashboard
          </h2>
        </div>

        {/* Global Export Project ZIP Button */}
        <button
          onClick={handleExportZip}
          disabled={isExportingZip}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition"
        >
          {zipSuccess ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Downloaded ZIP!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>{isExportingZip ? 'Packaging ZIP...' : 'Export Complete Project ZIP'}</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'stats', label: 'Metrics & Vault', icon: BarChart3 },
          { id: 'tests', label: 'Automated Tests', icon: Activity },
          { id: 'deploy', label: 'GitHub Pages Deployment', icon: Github },
          { id: 'eras', label: 'Era Schema Config', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Stats & Metrics */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">Total Captures</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">{captures.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Stored in Local Vault</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">Server Health</div>
              <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{serverHealth?.status === 'healthy' ? 'Express + Gemini' : 'Static PWA Mode'}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Port 3000 / Client Fallback</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">AI Transform Model</div>
              <div className="text-xs font-bold text-sky-400 mt-1">gemini-nano-banana-2.1</div>
              <div className="text-[10px] text-slate-500 mt-0.5">1K, 2K, 4K High-Res</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">AI Analysis Model</div>
              <div className="text-xs font-bold text-purple-400 mt-1">gemini-4-argon</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Face & Era Understanding</div>
            </div>
          </div>

          {/* Era Popularity Bar Chart */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold font-serif text-slate-200 mb-3">
              Destination Popularity Distribution
            </h3>
            <div className="space-y-2">
              {HISTORICAL_ERAS.map((era) => {
                const count = eraStats[era.id] || 0;
                const pct = captures.length > 0 ? Math.round((count / captures.length) * 100) : 0;
                return (
                  <div key={era.id} className="text-xs">
                    <div className="flex justify-between mb-1 text-[11px]">
                      <span className="font-medium text-slate-300">{era.defaultName} ({era.year})</span>
                      <span className="font-mono text-amber-400">{count} jumps ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: era.color.primary,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Vault Captures Gallery */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-serif text-slate-200">
                Captured Time Vault ({captures.length})
              </h3>
              {captures.length > 0 && (
                <span className="text-[11px] font-mono text-slate-400">
                  Click to inspect or delete
                </span>
              )}
            </div>

            {captures.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No captures in the vault yet. Jump to the Photo Booth tab to take your first portrait!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {captures.map((cap) => {
                  const era = HISTORICAL_ERAS.find((e) => e.id === cap.eraId);
                  const preview = cap.transformedImage || cap.originalImage;
                  return (
                    <div
                      key={cap.id}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950"
                    >
                      <img src={preview} alt="vault" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-between">
                        <button
                          onClick={() => onDeleteCapture(cap.id)}
                          className="self-end p-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="text-[10px] text-amber-300 font-mono font-bold truncate">
                          {era?.defaultName || 'Historical Era'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Automated Test Runner */}
      {activeTab === 'tests' && <AutomatedTestRunner />}

      {/* Tab: GitHub Pages Deployment */}
      {activeTab === 'deploy' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 text-slate-100 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold mb-2">
                <Github className="w-3.5 h-3.5" />
                <span>Zero-Config Deployment Ready</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-slate-100">
                GitHub Pages Deployment Package
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Everything you need to host Chronos for free on your GitHub account with offline PWA support.
              </p>
            </div>

            <button
              onClick={handleExportZip}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs mb-3">
                1
              </div>
              <h4 className="text-xs font-bold text-slate-200 mb-1">Push to GitHub</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Extract the exported ZIP archive and push the files to your GitHub repository (e.g. <code>github.com/your-username/time-travel-booth</code>).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs mb-3">
                2
              </div>
              <h4 className="text-xs font-bold text-slate-200 mb-1">Enable GitHub Actions</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                In GitHub: Go to <strong>Settings</strong> &gt; <strong>Pages</strong>. Under <strong>Build and deployment &gt; Source</strong>, choose <strong>GitHub Actions</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs mb-3">
                3
              </div>
              <h4 className="text-xs font-bold text-slate-200 mb-1">Live Everywhere & PWA</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The included <code>.github/workflows/deploy.yml</code> automatically builds and deploys. The relative <code>base: './'</code> ensures zero 404 path issues!
              </p>
            </div>
          </div>

          {/* Workflow Code Snippet */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2 text-xs font-mono text-slate-400">
              <span>Included Workflow: .github/workflows/deploy.yml</span>
              <span className="text-emerald-400 font-bold">Ready</span>
            </div>
            <pre className="text-[10px] font-mono text-amber-200/90 overflow-x-auto p-3 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed">
{`name: Deploy to GitHub Pages
on:
  push:
    branches: [main, master]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: './dist' }
      - uses: actions/deploy-pages@v4`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab: Eras Schema Config */}
      {activeTab === 'eras' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold font-serif text-slate-200">
            Configured Historical Eras Registry (10 Eras)
          </h3>
          <div className="space-y-3">
            {HISTORICAL_ERAS.map((era) => (
              <div
                key={era.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-200 font-serif">{era.defaultName}</span>
                    <span className="font-mono text-amber-400 text-[11px] font-bold">({era.year})</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{era.filter}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] max-w-xl">{era.promptTemplate}</p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-center">
                  <span className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: era.color.primary }} />
                  <span className="text-[10px] font-mono text-slate-400">{era.location.split(',')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
