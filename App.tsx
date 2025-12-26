
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import WaterBottle from './components/WaterBottle';
import { SipRecord, AppState } from './types';
import { getHydrationTip } from './services/geminiService';

const STORAGE_KEY = 'hydrolove_v5_final_refined';

const INITIAL_STATE: AppState = {
  currentAmount: 0.0,
  goal: 2.0,
  streak: 1,
  mood: "Glowy!",
  history: [],
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const todayStr = new Date().toDateString();
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const lastUpdateStr = new Date(parsed.lastUpdate || 0).toDateString();
        
        if (lastUpdateStr !== todayStr) {
          const lastUpdateTime = parsed.lastUpdate || 0;
          const diffDays = Math.floor((Date.now() - lastUpdateTime) / (1000 * 60 * 60 * 24));
          const newStreak = diffDays <= 1 ? parsed.streak : 1;
          
          return { 
            ...parsed, 
            currentAmount: 0, 
            history: [], 
            streak: newStreak,
            lastUpdate: Date.now() 
          };
        }
        return parsed;
      } catch (e) {
        return { ...INITIAL_STATE, lastUpdate: Date.now() };
      }
    }
    return { ...INITIAL_STATE, lastUpdate: Date.now() };
  });

  const [tip, setTip] = useState<string>("Hydroy is waking up...");
  const [isLogging, setIsLogging] = useState(false);
  const [isSplashing, setIsSplashing] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastUpdate: Date.now() }));
  }, [state]);

  const fetchTip = useCallback(async () => {
    const newTip = await getHydrationTip(state.currentAmount, state.goal);
    setTip(newTip);
  }, [state.currentAmount, state.goal]);

  useEffect(() => {
    fetchTip();
    const interval = setInterval(fetchTip, 300000); 
    return () => clearInterval(interval);
  }, [fetchTip]);

  const addWater = (amountMl: number, label: string, icon: string, category: string) => {
    if (isLogging) return;
    setIsLogging(true);
    setIsSplashing(true);

    const newSip: SipRecord = {
      id: Date.now().toString(),
      amount: amountMl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      label,
      icon,
      category,
    };

    setState(prev => ({
      ...prev,
      currentAmount: Math.round((prev.currentAmount + amountMl / 1000) * 100) / 100,
      history: [newSip, ...prev.history].slice(0, 20)
    }));

    setTimeout(() => {
      setIsLogging(false);
      setIsSplashing(false);
    }, 600);
  };

  return (
    <div className="min-h-[100dvh] lg:h-screen lg:overflow-hidden font-display p-4 md:p-6 lg:p-10 flex flex-col items-center relative bg-gradient-to-br from-[#ffe5ec] to-[#fff0f3] overflow-y-auto lg:overflow-y-hidden custom-scrollbar">
      <Header />
      
      {/* Background Ambience */}
      <div className="fixed top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[140px] pointer-events-none animate-float"></div>
      <div className="fixed bottom-[-5%] left-[-10%] w-[50vw] h-[50vw] bg-water/10 rounded-full blur-[140px] pointer-events-none animate-float-delayed"></div>

      <div className="w-full max-w-[1400px] h-full relative z-10 flex flex-col pt-12 lg:pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 items-start lg:items-center flex-1 h-full py-6">
          
          {/* Left Column: Advice & Stats (Visible on all devices) */}
          <div className="space-y-6 order-2 lg:order-1 flex flex-col justify-center animate-[pop-out_0.6s_ease-out]">
             {/* Advice Bubble */}
             <div className="glass-effect p-6 rounded-[2.5rem] shadow-cute border-2 border-white/50 bg-white/30 backdrop-blur-md">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl animate-heartbeat">auto_awesome</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">Hydroy's Advice</span>
                </div>
                <p className="text-lg lg:text-xl font-bold text-text-main italic leading-snug">
                  "{tip}"
                </p>
             </div>

             {/* Stats Cards */}
             <div className="grid grid-cols-2 gap-4 lg:gap-6">
                <div className="bg-white/90 p-5 rounded-[2rem] shadow-cute border border-white/50 flex flex-col items-center transition-transform hover:scale-105">
                  <span className="material-symbols-outlined text-orange-400 text-2xl mb-1">local_fire_department</span>
                  <span className="text-2xl lg:text-3xl font-black text-text-main leading-none">{state.streak}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/40 mt-1">Streak</span>
                </div>
                <div className="bg-white/90 p-5 rounded-[2rem] shadow-cute border border-white/50 flex flex-col items-center transition-transform hover:scale-105">
                  <span className="material-symbols-outlined text-green-500 text-2xl mb-1">stars</span>
                  <span className="text-lg lg:text-xl font-black text-text-main text-center leading-none truncate w-full">{state.mood}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/40 mt-1">Vibe</span>
                </div>
             </div>
          </div>

          {/* Center Column: The Bottle (HERO) */}
          <div className="flex flex-col items-center justify-center gap-6 lg:gap-10 order-1 lg:order-2">
             {/* Goal Pill */}
             <div 
              onClick={() => setShowGoalModal(true)}
              className="bg-white/95 px-8 py-2.5 rounded-full shadow-cute border-2 border-white cursor-pointer hover:scale-110 active:scale-95 transition-all group flex items-center gap-3 z-20"
             >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-base group-hover:rotate-90 transition-transform">tune</span>
                </div>
                <span className="font-black text-text-main uppercase text-[11px] tracking-[0.2em]">Goal: {state.goal}L</span>
             </div>

             {/* Bottle Container */}
             <div className="relative w-full flex items-center justify-center min-h-[380px] md:min-h-[480px]">
                <div className="transform scale-[1.05] xs:scale-[1.15] md:scale-[1.25] lg:scale-100 transition-all duration-700">
                  <WaterBottle 
                    current={state.currentAmount} 
                    goal={state.goal} 
                    isSplashing={isSplashing} 
                    onQuickAdd={() => addWater(250, 'Sip', 'water_full', 'Auto')}
                  />
                </div>
             </div>
             
             {/* Quick Actions (Bigger gap and reachability) */}
             <div className="w-full flex justify-center gap-6 md:gap-8 px-4 pb-4">
                {[
                  { ml: 250, label: 'Cup', icon: 'local_cafe' },
                  { ml: 500, label: 'Jug', icon: 'layers' }
                ].map(btn => (
                  <button 
                    key={btn.ml}
                    onClick={() => addWater(btn.ml, btn.label, btn.icon, 'Manual')}
                    className="flex-1 max-w-[150px] py-4 rounded-[2rem] bg-white/95 border-2 border-primary/5 shadow-cute flex flex-col items-center justify-center gap-1 active:scale-90 hover:-translate-y-2 transition-all z-20 group"
                  >
                    <span className="material-symbols-outlined text-primary text-3xl transition-transform group-hover:scale-125 group-hover:rotate-12">{btn.icon}</span>
                    <span className="font-black text-text-main text-sm">{btn.ml}ml</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Right Column: History (Adapted for all devices) */}
          <div className="glass-effect p-6 lg:p-8 rounded-[2.5rem] lg:rounded-[4rem] shadow-cute order-3 flex flex-col border-2 border-white/50 h-[350px] lg:h-[80%] lg:max-h-[600px] mb-8 lg:mb-0">
             <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-2xl lg:text-3xl">history</span>
                <h4 className="font-black text-xl lg:text-2xl text-text-main tracking-tighter">Journal</h4>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {state.history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-4 py-10">
                    <span className="material-symbols-outlined text-5xl text-primary animate-pulse">water_drop</span>
                    <p className="font-black uppercase tracking-widest text-[9px]">Awaiting your love...</p>
                  </div>
                ) : (
                  state.history.map((sip, idx) => (
                    <div 
                      key={sip.id} 
                      className="group flex items-center gap-4 p-4 rounded-[1.8rem] bg-white/70 shadow-sm border border-primary/5 hover:shadow-cute transition-all animate-[pop-out_0.4s_ease-out_both]"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="w-11 h-11 rounded-full bg-secondary/30 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                        <span className="material-symbols-outlined text-xl">{sip.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-black text-text-main block">{sip.label}</span>
                          <span className="text-[10px] font-bold text-primary/60">{sip.timestamp}</span>
                        </div>
                        <span className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em]">+{sip.amount}ml</span>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Goal Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="absolute inset-0 bg-text-main/30 backdrop-blur-md" onClick={() => setShowGoalModal(false)}></div>
            <div className="relative bg-white w-full max-w-[320px] rounded-[4rem] shadow-2xl p-10 text-center animate-[scaleIn_0.25s_ease-out] border-[12px] border-secondary/20">
               <span className="material-symbols-outlined text-6xl text-primary mb-4 block animate-heartbeat">water_lux</span>
               <h3 className="text-3xl font-black text-text-main tracking-tighter mb-2">My Goal</h3>
               <p className="text-text-muted/40 font-bold mb-8 text-[10px] uppercase tracking-widest">Hydrate to radiate!</p>
               <div className="grid grid-cols-2 gap-4 mb-8">
                  {[1.5, 2.0, 2.5, 3.0].map(val => (
                    <button 
                      key={val}
                      onClick={() => { setState(prev => ({ ...prev, goal: val })); setShowGoalModal(false); }}
                      className={`py-5 rounded-[2rem] font-black text-2xl transition-all ${state.goal === val ? 'bg-primary text-white shadow-cute scale-105' : 'bg-secondary/40 text-text-main hover:bg-secondary active:scale-95'}`}
                    >
                      {val}L
                    </button>
                  ))}
               </div>
               <button onClick={() => setShowGoalModal(false)} className="text-[10px] font-black uppercase text-text-muted/20 tracking-widest hover:text-primary transition-colors">Close</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @media (min-width: 1024px) {
          body { overflow: hidden; }
        }
      `}</style>
    </div>
  );
};

export default App;
