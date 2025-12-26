
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import WaterBottle from './components/WaterBottle';
import { SipRecord, AppState } from './types';
import { getHydrationTip } from './services/geminiService';

const STORAGE_KEY = 'hydrolove_pro_v2';

const INITIAL_STATE: AppState = {
  currentAmount: 0.0,
  goal: 2.0,
  streak: 1,
  mood: "Sparkly!",
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

  const [tip, setTip] = useState<string>("Hydroy is waking up for her...");
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
      history: [newSip, ...prev.history].slice(0, 50)
    }));

    setTimeout(() => {
      setIsLogging(false);
      setIsSplashing(false);
    }, 600);
  };

  return (
    <div className="min-h-screen font-display p-4 md:p-8 xl:p-12 relative overflow-x-hidden">
      {/* Background Blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[140px] pointer-events-none animate-float"></div>
      <div className="fixed bottom-[-5%] left-[-10%] w-[50vw] h-[50vw] bg-water/10 rounded-full blur-[140px] pointer-events-none animate-float-delayed"></div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        <Header />

        {/* Laptop-Ready 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-16 items-start">
          
          {/* Left: Coaching & Quick Menu */}
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
             <div className="glass-effect p-8 md:p-10 rounded-[3rem] md:rounded-[4rem] shadow-cute border-2 border-white/40">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl animate-heartbeat">auto_awesome</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">Hydroy's Advice</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-text-main leading-tight italic">
                  "{tip}"
                </p>
             </div>

             <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-cute flex flex-col items-center border border-white hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-orange-400 text-3xl mb-2">local_fire_department</span>
                  <span className="text-3xl md:text-4xl font-black text-text-main">{state.streak}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/40 mt-1">Day Streak</span>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-cute flex flex-col items-center border border-white hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-green-500 text-3xl mb-2">stars</span>
                  <span className="text-xl md:text-2xl font-black text-text-main text-center leading-none">{state.mood}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/40 mt-1">Daily Vibe</span>
                </div>
             </div>

             <div className="glass-effect p-8 md:p-10 rounded-[3rem] md:rounded-[4rem] shadow-cute border-2 border-white/40">
                <h3 className="font-black text-text-main uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">restaurant_menu</span> Drink Menu
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   {[
                    { ml: 150, label: 'Cup', icon: 'local_cafe' },
                    { ml: 500, label: 'Jug', icon: 'layers' }
                   ].map(btn => (
                     <button 
                      key={btn.ml}
                      onClick={() => addWater(btn.ml, btn.label, btn.icon, 'Manual')}
                      className="py-6 rounded-[2.5rem] bg-white border border-primary/5 shadow-sm hover:shadow-cute hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-3 group active:scale-95"
                     >
                       <span className="material-symbols-outlined text-2xl text-primary group-hover:rotate-12 transition-transform">{btn.icon}</span>
                       <span className="font-black text-text-main text-lg">{btn.ml}ml</span>
                     </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Center: The Hero Bottle */}
          <div className="flex flex-col items-center gap-8 md:gap-10 order-1 lg:order-2">
             <div 
              onClick={() => setShowGoalModal(true)}
              className="bg-white/95 backdrop-blur-xl px-8 md:px-10 py-4 md:py-5 rounded-full shadow-cute border-2 border-white cursor-pointer hover:scale-105 transition-all group active:scale-95 flex items-center gap-4"
             >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl md:text-2xl group-hover:rotate-90 transition-transform">tune</span>
                </div>
                <span className="font-black text-text-main uppercase text-[11px] md:text-xs tracking-[0.3em]">Adjust My Goal</span>
             </div>

             <WaterBottle 
              current={state.currentAmount} 
              goal={state.goal} 
              isSplashing={isSplashing} 
              onQuickAdd={() => addWater(250, 'Pure Water', 'water_full', 'Automatic')}
             />
          </div>

          {/* Right: History Feed */}
          <div className="glass-effect p-10 md:p-12 rounded-[3.5rem] md:rounded-[5rem] shadow-cute order-3 flex flex-col border-2 border-white/40 lg:h-[750px]">
             <div className="flex items-center justify-between mb-8 md:mb-10">
                <h4 className="font-black text-2xl md:text-3xl text-text-main tracking-tighter flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary text-3xl">event_note</span>
                  Today's Journey
                </h4>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-4 md:space-y-6 custom-scrollbar scroll-smooth">
                {state.history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-25 text-center space-y-6">
                    <span className="material-symbols-outlined text-7xl animate-bounce-slight text-primary">water_drop</span>
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">Waiting for her<br/>first drink of love...</p>
                  </div>
                ) : (
                  state.history.map((sip, idx) => (
                    <div 
                      key={sip.id} 
                      className="group flex items-center justify-between p-5 md:p-6 rounded-[2.5rem] md:rounded-[3rem] bg-white shadow-sm border border-primary/5 hover:shadow-cute hover:-translate-x-2 transition-all animate-[pop-out_0.4s_ease-out_both]"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex items-center gap-5 md:gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                          <span className="material-symbols-outlined text-2xl md:text-3xl">{sip.icon}</span>
                        </div>
                        <div>
                          <span className="text-lg md:text-xl font-black text-text-main block">{sip.label}</span>
                          <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">+{sip.amount}ml • {sip.timestamp}</span>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="absolute inset-0 bg-text-main/40 backdrop-blur-2xl" onClick={() => setShowGoalModal(false)}></div>
            <div className="relative bg-white w-full max-w-sm rounded-[4rem] md:rounded-[5rem] shadow-2xl p-10 md:p-12 text-center animate-[scaleIn_0.3s_ease-out] border-[12px] border-secondary/20">
               <span className="material-symbols-outlined text-7xl text-primary mb-6 block animate-heartbeat">water_lux</span>
               <h3 className="text-3xl md:text-4xl font-black text-text-main tracking-tighter mb-3">Daily Goal</h3>
               <p className="text-text-muted/60 font-bold mb-10 text-[10px] uppercase tracking-[0.2em]">Drink to feel magical!</p>
               
               <div className="grid grid-cols-2 gap-4 mb-10">
                  {[1.5, 2.0, 2.5, 3.0].map(val => (
                    <button 
                      key={val}
                      onClick={() => { setState(prev => ({ ...prev, goal: val })); setShowGoalModal(false); }}
                      className={`py-6 rounded-[2.5rem] md:rounded-[3rem] font-black text-2xl md:text-3xl transition-all ${state.goal === val ? 'bg-primary text-white shadow-cute scale-105' : 'bg-secondary/40 text-text-main hover:bg-secondary active:scale-95'}`}
                    >
                      {val}L
                    </button>
                  ))}
               </div>
               
               <button onClick={() => setShowGoalModal(false)} className="text-[10px] font-black uppercase text-text-muted/30 tracking-[0.3em] hover:text-primary transition-colors">Close</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default App;
