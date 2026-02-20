"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Heart, X, Music, 
  CloudRain, TreePine, Waves, Palette, Clock, RotateCcw 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility & Setup ---
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const triggerHaptic = () => {
  if (typeof window !== 'undefined' && window.navigator.vibrate) {
    window.navigator.vibrate(10);
  }
};

const MOODS = [
  { emoji: "🌋", label: "Erupting", theme: "#E07A5F", secondary: "#F5D5CB" },
  { emoji: "🌊", label: "Choppy", theme: "#81B29A", secondary: "#D8E2DC" },
  { emoji: "🌤️", label: "Cloudy", theme: "#3D405B", secondary: "#E7DFDD" },
  { emoji: "🍃", label: "Breezy", theme: "#6A994E", secondary: "#CFE1B9" },
  { emoji: "🌌", label: "Zen", theme: "#5F797B", secondary: "#DDE5E7" },
] as const;

// --- Sub-Components ---

const GlobalCalmnessMeter = ({ accentColor }: { accentColor: string }) => {
  const [onlineCount, setOnlineCount] = useState(124);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 mb-8 z-10">
      <div className="flex items-center gap-2 px-4 py-1.5 bg-white/50 backdrop-blur-md rounded-full border border-white shadow-sm">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3D405B]/60">
          {onlineCount} Souls Breathing Together
        </span>
      </div>
    </div>
  );
};

const DoodleZone = ({ onClose, accentColor }: { onClose: () => void, accentColor: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = accentColor;
  }, [accentColor]);

  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft <= 0) {
      setTimerActive(false);
      triggerHaptic();
      return;
    }
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (timeLeft <= 0) return;
    if (!timerActive && timeLeft === 60) setTimerActive(true);
    isDrawingRef.current = true;
    draw(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || timeLeft <= 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    canvasRef.current?.getContext('2d')?.beginPath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setTimeLeft(60);
    setTimerActive(false);
    triggerHaptic();
  };

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-0 z-50 bg-[#F9F5F0] flex flex-col p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-serif text-3xl text-[#3D405B]">Doodle Zone</h2>
          <div className="flex items-center gap-2 text-[#D9822B] font-bold"><Clock size={16} /> <span>{timeLeft}s</span></div>
        </div>
        <button onClick={onClose} className="p-3 bg-white rounded-full shadow-sm" aria-label="Close"><X /></button>
      </div>
      <div className="flex-grow bg-white rounded-[2.5rem] shadow-inner relative overflow-hidden touch-none border-2 border-[#E7DFDD]">
        <canvas 
            ref={canvasRef} 
            onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
            onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair" 
        />
        {timeLeft <= 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <p className="font-serif text-2xl text-[#3D405B]">Energy released. Let it be.</p>
          </motion.div>
        )}
      </div>
      <div className="flex gap-4 mt-6">
        <button onClick={clearCanvas} className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-[#3D405B] rounded-full font-bold shadow-sm border border-[#E7DFDD]"><RotateCcw size={18} /> Reset</button>
        <button onClick={onClose} className="flex-1 py-4 text-white rounded-full font-bold shadow-lg" style={{ backgroundColor: accentColor }}>Finish</button>
      </div>
    </motion.div>
  );
};

// --- Main Application ---

export default function ExhaleApp() {
  const [stage, setStage] = useState<'landing' | 'app'>('landing');
  const [selectedMoodLabel, setSelectedMoodLabel] = useState<string>("Cloudy");
  const [isBreathing, setIsBreathing] = useState(false);
  const [overlay, setOverlay] = useState<'none' | 'sounds' | 'kindness' | 'doodle'>('none');
  const [breathPhase, setBreathPhase] = useState<'Ready' | 'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Ready');

  const activeMood = useMemo(() => MOODS.find(m => m.label === selectedMoodLabel) || MOODS[2], [selectedMoodLabel]);

  useEffect(() => {
    if (!isBreathing) { setBreathPhase('Ready'); return; }
    const phases = [
      { name: 'Inhale', duration: 4000 }, { name: 'Hold', duration: 4000 },
      { name: 'Exhale', duration: 4000 }, { name: 'Rest', duration: 4000 },
    ] as const;
    let idx = 0;
    const run = () => {
      setBreathPhase(phases[idx].name);
      const t = setTimeout(() => { idx = (idx + 1) % phases.length; run(); }, phases[idx].duration);
      return t;
    };
    const timer = run();
    return () => clearTimeout(timer);
  }, [isBreathing]);

  if (stage === 'landing') {
    return (
      <main className="h-screen bg-[#F9F5F0] flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-8xl md:text-9xl font-serif text-[#3D405B] mb-2">EXHALE</h1>
        <button onClick={() => setStage('app')} className="px-12 py-5 bg-[#D9822B] text-white rounded-full text-xl font-bold shadow-2xl hover:scale-105 transition-transform">Begin Sanctuary</button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F5F0] flex flex-col items-center py-8 px-6 transition-all duration-1000 relative overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none opacity-20 transition-colors duration-1000" style={{ background: `radial-gradient(circle at center, ${activeMood.secondary} 0%, transparent 70%)` }} />

      <GlobalCalmnessMeter accentColor={activeMood.theme} />

      <nav className="w-full max-w-md mb-8 flex justify-between bg-white/40 p-3 rounded-full backdrop-blur-md shadow-inner border border-white/50 z-10">
        {MOODS.map((m) => (
          <button 
            key={m.label} 
            onClick={() => { triggerHaptic(); setSelectedMoodLabel(m.label); }} 
            aria-label={m.label}
            aria-pressed={selectedMoodLabel === m.label}
            className={cn("text-2xl w-12 h-12 flex items-center justify-center rounded-full transition-all", selectedMoodLabel === m.label ? "bg-white shadow-md scale-110" : "grayscale opacity-30")}
          >
            {m.emoji}
          </button>
        ))}
      </nav>

      

      <section className="flex-grow flex flex-col items-center justify-center w-full relative z-10">
        <div className="relative">
          <AnimatePresence>
            {isBreathing && (breathPhase === 'Inhale' || breathPhase === 'Hold') && (
              <motion.div initial={{ scale: 1, opacity: 0 }} animate={{ scale: 2.5, opacity: 0.15 }} exit={{ opacity: 0 }} transition={{ duration: 4 }} className="absolute inset-0 rounded-full blur-3xl" style={{ backgroundColor: activeMood.theme }} />
            )}
          </AnimatePresence>
          <motion.div 
            animate={{ 
                scale: (breathPhase === 'Inhale' || breathPhase === 'Hold') ? 1.4 : 1 
            }} 
            transition={{ duration: 4, ease: "easeInOut" }} 
            className="w-56 h-56 bg-white rounded-[40%_60%_70%_30%/40%_50%_60%_50%] shadow-2xl flex flex-col items-center justify-center border-8" 
            style={{ borderColor: activeMood.secondary }}
          >
            <span className="text-6xl mb-4" role="img" aria-label="Mascot">☁️</span>
            <span className="font-black text-[#3D405B] tracking-widest uppercase text-xs" aria-live="polite">{breathPhase}</span>
          </motion.div>
        </div>

        <div className="flex gap-4 mt-16">
          <button onClick={() => { triggerHaptic(); setIsBreathing(!isBreathing); }} className="px-12 py-4 rounded-full font-black text-white shadow-lg min-w-[140px]" style={{ backgroundColor: isBreathing ? "#3D405B" : activeMood.theme }}>{isBreathing ? 'STOP' : 'BREATHE'}</button>
          <button onClick={() => { triggerHaptic(); setOverlay('doodle'); }} className="p-4 bg-white rounded-full shadow-lg" style={{ color: activeMood.theme }} aria-label="Open Doodle Zone"><Palette /></button>
          <button onClick={() => { triggerHaptic(); setOverlay('sounds'); }} className="p-4 bg-white rounded-full shadow-lg" style={{ color: activeMood.theme }} aria-label="Open Sound Bath"><Music /></button>
        </div>
      </section>

      <footer className="mt-8 z-10">
        <button onClick={() => { triggerHaptic(); setOverlay('kindness'); }} className="font-serif text-[#3D405B] italic text-2xl flex items-center gap-2">
            I need a kind word <Heart size={18} fill={activeMood.theme} stroke="none" />
        </button>
      </footer>

      <AnimatePresence>
        {overlay === 'doodle' && <DoodleZone accentColor={activeMood.theme} onClose={() => setOverlay('none')} />}
        
        {overlay === 'kindness' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOverlay('none')} className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-[#3D405B]/40 backdrop-blur-md">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-white p-12 rounded-[3rem] text-center shadow-2xl max-w-sm">
              <p className="font-serif text-3xl italic text-[#3D405B]">"You are doing a lot with the energy you have. That is enough."</p>
              <div className="mt-8 w-12 h-1 mx-auto rounded-full" style={{ backgroundColor: activeMood.theme }} />
              <button className="mt-6 text-xs font-black uppercase tracking-widest text-[#3D405B]/40">Tap to close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Nunito:wght@400;900&display=swap');
        :root { --font-serif: 'Caveat'; --font-sans: 'Nunito'; }
        body { font-family: var(--font-sans); background-color: #F9F5F0; margin: 0; }
        .font-serif { font-family: var(--font-serif); }
      `}</style>
    </div>
  );
}
