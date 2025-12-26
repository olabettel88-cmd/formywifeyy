import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import WaterBottle from './components/WaterBottle';
import { SipRecord, AppState } from './types';
import { getHydrationTip } from './services/geminiService';

const STORAGE_KEY = 'hydrolove_v5_final_pro';
// Use environment variable for Railway backend endpoint
// In this environment, process.env is provided by the runner
const API_ENDPOINT = (process.env.VITE_API_URL || '') + '/api/hydration';

const INITIAL_STATE: AppState = {
  currentAmount: 0.0,
  goal: 2.0,
  streak: 1,
  mood: "Glowy!",
  history: [],
  lastUpdate: Date.now(),
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tip, setTip] = useState<string>("Hydroy is waking up...");
  const [isLogging, setIsLogging] = useState(false);
  const [isSplashing, setIsSplashing] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Initialize state from DB or LocalStorage
  useEffect(() => {
    const init = async () => {
      let data = INITIAL_STATE;
      
      // 1. Try to fetch from Railway Backend (Postgres via Railway API)
      try {
        const response = await fetch(API_ENDPOINT);
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('No backend data');
        }
      } catch (e) {
        // 2. Fallback to LocalStorage if backend fails
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            data = JSON.parse(saved);
          } catch (err) {
            console.error("Storage parse error", err);
          }
        }
      }

      // Check for daily reset
      const todayStr = new Date().toDateString();
      const lastUpdateStr = data.lastUpdate ? new Date(data.lastUpdate).toDateString() : '';
      
      if (lastUpdateStr && lastUpdateStr !== todayStr) {
        const lastUpdateTime = data.lastUpdate || 0;
        const diffDays = Math.floor((Date.now() - lastUpdateTime) / (1000 * 60 * 60 * 24));
        const newStreak = diffDays <= 1 ? data.streak : 1;
        
        data = { 
          ...data, 
          currentAmount: 0, 
          history: [], 
          streak: newStreak,
          lastUpdate: Date.now() 
        };
      } else {
        data = { ...data, lastUpdate: Date.now() };
      }

      setState(data);
      setIsInitialized(true);
    };

    init();
  }, []);

  // Sync state to persistence layers
  useEffect(() => {
    if (!isInitialized) return;

    const syncData = async () => {
      const payload = { ...state, lastUpdate: Date.now() };
      
      // Always save to LocalStorage for offline resilience
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

      // Attempt to save to Backend (Railway/Postgres)
      try {
        await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.debug("Backend sync pending railway setup...");
      }
    };

    syncData();
  }, [state, isInitialized]);

  const fetchTip = useCallback(async () => {
    const newTip = await getHydrationTip(state.currentAmount, state.goal);
    setTip(newTip);
  }, [state.currentAmount, state.goal]);

  useEffect(() => {
    if (isInitialized) {
      fetchTip();
      const interval = setInterval(fetchTip, 300000); 
      return () => clearInterval(interval);
    }
  }, [fetchTip, isInitialized]);

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
      
      {/* Background Ambience Layers */}
      <div className="fixed top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[140px] pointer-events-none animate-float"></div>
      <div className="fixed bottom-[-5%] left-[-10%] w-[50vw] h-[50vw] bg-water/10 rounded-full blur-[140px] pointer-events-none animate-float-delayed"></div>

      <div className="w-full max-w-[1440px] h-full relative z-10 flex flex-col pt-12 lg:pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-20 items-stretch lg:items-center flex-1 h-full py-6">
          
          {/* Left Column: Advice & Stats */}
          <div className="space-y-6 order-2 lg:order-1 flex flex-col justify-center animate-[pop-out_0.6s_ease-out]">
             <div className="glass-effect p-6 md:p-8 rounded-[2.5rem] shadow-cute border-2 border-white/60 bg-white/40 backdrop-blur-md relative">
                <div className="absolute -top-3 left-8 bg-primary text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-sm">
                  Hydroy says:
                </div>
                <div className="flex items-start gap-3 mt-1">
                  <span className="material-symbols-outlined text-primary text-2xl animate-heartbeat flex-shrink-0">auto_awesome</span>
                  <p className="text-lg lg:text-xl font-bold text-text-main italic leading-tight">
                    "{tip}"
                  </p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white/90 p-5 md:p-6 rounded-[2.5rem] shadow-cute border border-white/50 flex flex-col items-center transition-all hover:translate-y-[-4px]">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-orange-400 text-2xl">local_fire_department</span>
                  </div>
                  <span className="text-2xl lg:text-3xl font-black text-text-main leading-none">{state.streak}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/40 mt-1">Streak</span>
                </div>
                <div className="bg-white/90 p-5 md:p-6 rounded-[2.5rem] shadow-cute border border-white/50 flex flex-col items-center transition-all hover:translate-y-[-4px]">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-green-500 text-2xl">stars</span>
                  </div>
                  <span className="text-lg lg:text-xl font-black text-text-main text-center leading-none truncate w-full px-1">{state.mood}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/40 mt-1">Status</span>
                </div>
             </div>
          </div>

          {/* Center Column: The Hero Bottle */}
          <div className="flex flex-col items-center justify-center gap-6 lg:gap-8 order-1 lg:order-2">
             <div 
              onClick={() => setShowGoalModal(true)}
              className="bg-white/95 px-6 py-2 md:px-10 md:py-3 rounded-full shadow-cute border-2 border-white cursor-pointer hover:scale-110 active:scale-95 transition-all group flex items-center gap-2 md:gap-3 z-20"
             >
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm md:text-base group-hover:rotate-90 transition-transform">tune</span>
                </div>
                <span className="font-black text-text-main uppercase text-[10px] md:text-[12px] tracking-[0.2em] md:tracking-[0.25em]">Goal: {state.goal}L</span>
             </div>

             <div className="relative w-full flex items-center justify-center min-h-[350px] md:min-h-[480px]">
                <div className="transform scale-[1.1] xs:scale-[1.25] md:scale-[1.3] lg:scale-[0.85] transition-all duration-700">
                  <WaterBottle 
                    current={state.currentAmount} 
                    goal={state.goal} 
                    isSplashing={isSplashing} 
                    onQuickAdd={() => addWater(250, 'Sip', 'water_full', 'Auto')}
                  />
                </div>
             </div>
             
             <div className="w-full flex justify-center gap-10 md:gap-12 px-6 pb-4">
                {[
                  { ml: 250, label: 'Cup', icon: 'local_cafe' },
                  { ml: 500, label: 'Jug', icon: 'layers' }
                ].map(btn => (
                  <button 
                    key={btn.ml}
                    onClick={() => addWater(btn.ml, btn.label, btn.icon, 'Manual')}
                    className="flex-1 max-w-[100px] md:max-w-[140px] py-3.5 md:py-5 rounded-[2rem] md:rounded-[2.5rem] bg-white/95 border-2 border-white shadow-cute flex flex-col items-center justify-center gap-0.5 md:gap-1 active:scale-90 hover:translate-y-[-8px] transition-all z-20 group"
                  >
                    <span className="material-symbols-outlined text-primary text-3xl md:text-4xl transition-all group-hover:scale-125 group-hover:rotate-6">{btn.icon}</span>
                    <span className="font-black text-text-main text-xs md:text-sm">{btn.ml}ml</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Right Column: Journal */}
          <div className="glass-effect p-6 md:p-8 lg:p-6 rounded-[2.5rem] lg:rounded-[3rem] shadow-cute order-3 flex flex-col border-2 border-white/60 h-auto min-h-[450px] lg:h-[70vh] lg:max-h-[600px] mb-12 lg:mb-0 overflow-hidden lg:self-center">
             <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary text-2xl">history_edu</span>
                  </div>
                  <h4 className="font-black text-xl lg:text-2xl text-text-main tracking-tighter">Journal</h4>
                </div>
                <div className="bg-secondary/50 px-3 py-1 rounded-full text-[9px] font-black uppercase text-primary/60 tracking-widest">
                  Recent
                </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {state.history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-15 text-center space-y-6 py-12">
                    <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center animate-pulse">
                      <span className="material-symbols-outlined text-5xl text-primary">water_drop</span>
                    </div>
                    <p className="font-black uppercase tracking-[0.3em] text-[9px]">Awaiting sips...</p>
                  </div>
                ) : (
                  state.history.map((sip, idx) => (
                    <div 
                      key={sip.id} 
                      className="group flex items-center gap-3 p-3 lg:p-4 rounded-[1.8rem] bg-white/80 shadow-sm border border-white hover:shadow-cute hover:bg-white transition-all animate-[pop-out_0.4s_ease-out_both]"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-secondary/40 flex items-center justify-center text-primary transition-all group-hover:scale-110">
                        <span className="material-symbols-outlined text-xl">{sip.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-black text-text-main block leading-none">{sip.label}</span>
                          <span className="text-[9px] font-bold text-primary/70">{sip.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black text-primary/50 uppercase tracking-[0.2em]">+{sip.amount}ml</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Goal Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="absolute inset-0 bg-text-main/40 backdrop-blur-xl" onClick={() => setShowGoalModal(false)}></div>
            <div className="relative bg-white w-full max-w-[360px] rounded-[4.5rem] shadow-2xl p-10 lg:p-12 text-center animate-[scaleIn_0.25s_ease-out] border-[16px] border-secondary/20">
               <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <span className="material-symbols-outlined text-6xl text-primary animate-heartbeat">water_lux</span>
               </div>
               <h3 className="text-4xl font-black text-text-main tracking-tighter mb-2">My Daily Goal</h3>
               <p className="text-text-muted/40 font-bold mb-10 text-[11px] uppercase tracking-[0.3em]">Radiate from within!</p>
               <div className="grid grid-cols-2 gap-5 mb-10">
                  {[1.5, 2.0, 2.5, 3.0].map(val => (
                    <button 
                      key={val}
                      onClick={() => { setState(prev => ({ ...prev, goal: val })); setShowGoalModal(false); }}
                      className={`py-6 rounded-[2.5rem] font-black text-2xl lg:text-3xl transition-all ${state.goal === val ? 'bg-primary text-white shadow-cute scale-105 ring-8 ring-primary/10' : 'bg-secondary/50 text-text-main hover:bg-secondary active:scale-95'}`}
                    >
                      {val}L
                    </button>
                  ))}
               </div>
               <button onClick={() => setShowGoalModal(false)} className="text-[10px] font-black uppercase text-text-muted/30 tracking-[0.4em] hover:text-primary transition-colors">Go Back</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.9) translateY(30px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @media (min-width: 1024px) {
          body { overflow: hidden; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ffccd5; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ff8fa3; background-clip: content-box; }
      `}</style>
    </div>
  );
};

export default App;
