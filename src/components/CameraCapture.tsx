import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, User, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/i18n';

interface Props {
  onCapture: (imageDataUrl: string) => void;
  lang: Language;
  disabled?: boolean;
}

// Built-in high-quality sample faces for instant one-click testing
const SAMPLE_PORTRAITS = [
  {
    id: 'sample-1',
    name: 'Astrid (Studio)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sample-2',
    name: 'Marcus (Classic)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sample-3',
    name: 'Elena (Natural)',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  },
];

export const CameraCapture: React.FC<Props> = ({ onCapture, lang, disabled = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Play synthetic camera shutter sound using Web Audio API
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Play countdown beep
  const playCountdownBeep = useCallback((isFinal: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFinal ? 880 : 440, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio fallback
    }
  }, []);

  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(err.message || 'Unable to access webcam. You can upload any photo instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const toggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Trigger shutter capture
  const handleSnap = () => {
    if (!videoRef.current || countdown !== null) return;

    let count = 3;
    setCountdown(count);
    playCountdownBeep(false);

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playCountdownBeep(false);
      } else {
        clearInterval(interval);
        setCountdown(null);
        playCountdownBeep(true);
        executeCapture();
      }
    }, 900);
  };

  const executeCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Flash animation and shutter sound
    playShutterSound();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 220);

    onCapture(dataUrl);
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onCapture(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Sample portrait loader
  const handleSelectSample = async (sampleUrl: string) => {
    try {
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          onCapture(reader.result as string);
        }
      };
      reader.readAsDataURL(blob);
    } catch {
      onCapture(sampleUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl bg-slate-900/90 border border-amber-500/30 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Viewfinder Area */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center">
        {/* Flash overlay */}
        {isFlashing && (
          <div className="absolute inset-0 z-40 bg-white transition-opacity duration-200 pointer-events-none" />
        )}

        {isCameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Oval Face Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[68%] h-[74%] rounded-[50%] border-2 border-dashed border-amber-400/70 shadow-[0_0_20px_rgba(234,179,8,0.3)] flex flex-col items-center justify-between py-6">
                <span className="text-[11px] font-mono tracking-widest text-amber-300/90 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {getTranslation(lang, 'camera_prompt')}
                </span>
                <span className="text-[10px] font-mono text-slate-400/80">ALIGN CHIN & EYES</span>
              </div>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                <div className="w-24 h-24 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-5xl font-black shadow-2xl animate-ping duration-700">
                  {countdown}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-inner">
              <Camera className="w-9 h-9" />
            </div>
            <p className="text-sm font-medium text-slate-300 max-w-xs mb-2">
              Ready to travel through time? Turn on camera or upload your photo.
            </p>
            {cameraError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/50 border border-amber-500/30 px-3 py-1.5 rounded-xl max-w-sm">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {isCameraActive ? (
          <>
            <button
              onClick={handleSnap}
              disabled={disabled || countdown !== null}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-red-600 animate-pulse" />
              <span>{getTranslation(lang, 'btn_take_photo')}</span>
            </button>

            <button
              onClick={toggleCamera}
              title={getTranslation(lang, 'btn_flip_camera')}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-500/40 transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={stopCamera}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              Stop
            </button>
          </>
        ) : (
          <button
            onClick={() => startCamera()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>{getTranslation(lang, 'btn_start_camera')}</span>
          </button>
        )}

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 hover:border-amber-500/50 transition active:scale-95"
        >
          <Upload className="w-4 h-4 text-amber-400" />
          <span>{getTranslation(lang, 'btn_upload_photo')}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Instant Sample Faces Row */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <p className="text-[11px] font-mono text-slate-400 mb-2.5 flex items-center gap-1.5 justify-center sm:justify-start">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{getTranslation(lang, 'sample_photos')}</span>
        </p>
        <div className="flex items-center justify-center sm:justify-start gap-2.5">
          {SAMPLE_PORTRAITS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample.url)}
              className="group flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/60 transition active:scale-95 text-left"
            >
              <img
                src={sample.url}
                alt={sample.name}
                className="w-6 h-6 rounded-full object-cover border border-amber-400/50"
              />
              <span className="text-[11px] font-medium text-slate-300 group-hover:text-amber-300 transition">
                {sample.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
