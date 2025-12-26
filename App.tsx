
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import WaterBottle from './components/WaterBottle';
import { SipRecord, AppState } from './types';
import { getHydrationTip } from './services/geminiService';

const STORAGE_KEY = 'hydrolove_pro_v1';

const INITIAL_STATE: AppState = {
  currentAmount: 0.0,
  goal: 2.0,
  streak: 1,
  mood: "Glowing!",
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
        
        // Robust Daily Reset Check
        if (lastUpdateStr !== todayStr) {
          const lastUpdateTime = parsed.lastUpdate || 0;
          const diffDays = Math.floor((Date.now() - lastUpdateTime) / (1000 * 60 * 60 * 24));
          
          // Only maintain streak if the user logged yesterday
          const newStreak = diffDays <= 1 ? parsed.streak + 1 : 1;
          
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

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastUpdate: Date.now() }));
  }, [state]);

  const fetchTip = useCallback(async () => {
    const newTip = await getHydrationTip(state.currentAmount, state.goal);
    setTip(newTip);
  }, [state.currentAmount, state.goal]);

  useEffect(() => {
    fetchTip();
    const interval = setInterval(fetchTip, 300000); // 5 min interval
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

    setState(prev => {
      const newAmount = Math.round((prev.currentAmount + amountMl / 1000) * 100) / 100;
      return {
        ...prev,
        currentAmount: newAmount,
        history: [newSip, ...prev.history].slice(0, 50) // Reset every day, keep up to 50 sips per day
      };
    });

    setTimeout(() => {
      setIsLogging(false);
      setIsSplashing(false);
    }, 700);
  };

  return (
    <div className="min-h-screen font-display p-6 md:p-10 xl:p-16 relative">
      {/* Visual Ambiance */}
      <div className="fixed top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-primary/10 rounded-full blur-[160px] pointer-events-none animate-float"></div>
      <div className="fixed bottom-[-15%] left-[-15%] w-[60vw] h-[60vw] bg-water/20 rounded-full blur-[160px] pointer-events-none animate-float-delayed"></div>

      <div className="max-w-[1500px] mx-auto relative z-10">
        <Header />

        {/* Main Laptop Optimized Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 xl:gap-24 items-start">
          
          {/* Section 1: Mood & Coaching (Left) */}
          <div className="space-y-10 order-2 lg:order-1">
             <div className="glass-effect p-12 rounded-[4.5rem] shadow-cute animate-[pop-out_0.6s_ease-out] border-2 border-white/50 group hover:-translate-y-2 transition-transform">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/15 rounded-3xl flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-primary text-3xl animate-heartbeat">auto_awesome</span>
                  </div>
                  <span className="text-sm font-black uppercase tracking-[0.25em] text-text-muted/60">Hydroy's Notes</span>
                </div>
                <p className="text-3xl font-bold text-text-main leading-tight italic drop-shadow-sm">
                  "{tip}"
                </p>
             </div>

             <div className="grid grid-cols-2 gap-10">
                <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[4rem] shadow-cute flex flex-col items-center border border-white hover:scale-105 transition-all">
                  <span className="material-symbols-outlined text-orange-400 text-5xl mb-4">local_fire_department</span>
                  <span className="text-5xl font-black text-text-main tracking-tighter">{state.streak}</span>
                  <span className="text-[12px] font-black uppercase tracking-[0.2em] text-text-muted/40 mt-2">Day Streak</span>
                </div>
                <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[4rem] shadow-cute flex flex-col items-center border border-white hover:scale-105 transition-all">
                  <span className="material-symbols-outlined text-green-500 text-5xl mb-4">stars</span>
                  <span className="text-2xl font-black text-text-main text-center leading-none tracking-tight">{state.mood}</span>
                  <span className="text-[12px] font-black uppercase tracking-[0.2em] text-text-muted/40 mt-2">Daily Vibe</span>
                </div>
             </div>

             <div className="glass-effect p-12 rounded-[4.5rem] shadow-cute space-y-4 border-2 border-white/50">
                <h3 className="font-black text-text-main uppercase tracking-[0.3em] text-[11px] mb-10 flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">restaurant_menu</span> Refresh Menu
                </h3>
                <div className="grid grid-cols-2 gap-6">
                   {[
                    { ml: 150, label: 'Cup', icon: 'local_cafe' },
                    { ml: 500, label: 'Jug', icon: 'layers' }
                   ].map(btn => (
                     <button 
                      key={btn.ml}
                      onClick={() => addWater(btn.ml, btn.label, btn.icon, 'Fresh')}
                      className="py-8 px-6 rounded-[3rem] bg-white border border-primary/5 shadow-sm hover:shadow-cute hover:-translate-y-2 transition-all flex flex-col items-center justify-center gap-4 group active:scale-90"
                     >
                       <span className="material-symbols-outlined text-4xl text-primary group-hover:rotate-12 transition-transform">{btn.icon}</span>
                       <span className="font-black text-text-main text-2xl tracking-tighter">{btn.ml}ml</span>
                     </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Section 2: The Heart - Bottle (Center) */}
          <div className="flex flex-col items-center gap-12 order-1 lg:order-2">
             <div 
              onClick={() => setShowGoalModal(true)}
              className="bg-white/95 backdrop-blur-2xl px-12 py-6 rounded-full shadow-cute border-4 border-white cursor-pointer hover:scale-110 transition-all group active:scale-95 flex items-center gap-5 hover:shadow-cute-hover"
             >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:rotate-90 transition-transform">tune</span>
                </div>
                <span className="font-black text-text-main uppercase text-sm tracking-[0.4em]">Personal Goal</span>
             </div>

             <WaterBottle 
              current={state.currentAmount} 
              goal={state.goal} 
              isSplashing={isSplashing} 
              onQuickAdd={() => addWater(250, 'Pure Sip', 'water_full', 'Quick Add')}
             />
          </div>

          {/* Section 3: Today's Journey (Right) */}
          <div className="glass-effect p-14 rounded-[5.5rem] shadow-cute order-3 flex flex-col border-2 border-white/50 lg:h-[800px] group">
             <div className="flex items-center justify-between mb-12">
                <h4 className="font-black text-4xl text-text-main tracking-tighter flex items-center gap-5">
                  <div className="w-14 h-14 bg-secondary/50 rounded-full flex items-center justify-center text-primary shadow-inner">
                    <span className="material-symbols-outlined text-4xl">event_note</span>
                  </div>
                  Daily Log
                </h4>
             </div>

             <div className="flex-1 overflow-y-auto pr-4 space-y-8 custom-scrollbar scroll-smooth">
                {state.history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-25 text-center space-y-8 p-12">
                    <span className="material-symbols-outlined text-9xl animate-bounce-slight text-primary">water_drop</span>
                    <p className="font-black uppercase tracking-[0.4em] text-xs leading-loose">Waiting for her<br/>first drink of love...</p>
                  </div>
                ) : (
                  state.history.map((sip, idx) => (
                    <div 
                      key={sip.id} 
                      className="group/item flex items-center justify-between p-8 rounded-[3.5rem] bg-white shadow-sm border border-primary/5 hover:shadow-cute hover:-translate-x-3 transition-all animate-[pop-out_0.5s_ease-out_both]"
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-[2rem] bg-secondary/20 flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform shadow-inner">
                          <span className="material-symbols-outlined text-4xl">{sip.icon}</span>
                        </div>
                        <div>
                          <span className="text-2xl font-black text-text-main block tracking-tight">{sip.label}</span>
                          <span className="text-[12px] font-bold text-primary/60 uppercase tracking-widest mt-2 inline-block">+{sip.amount}ml • {sip.timestamp}</span>
                        </div>
                      </div>
                      <div className="w-14 h-14 rounded-full border-2 border-primary/10 flex items-center justify-center text-primary/20 group-hover/item:text-primary group-hover/item:border-primary/40 transition-all">
                        <span className="material-symbols-outlined text-2xl">verified</span>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Goal Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-text-main/50 backdrop-blur-3xl animate-[fadeIn_0.4s_ease-out]" onClick={() => setShowGoalModal(false)}></div>
            <div className="relative bg-white w-full max-w-md rounded-[6rem] shadow-2xl p-16 text-center animate-[scaleIn_0.4s_ease-out] border-[16px] border-secondary/30">
               <div className="w-32 h-32 bg-primary/10 rounded-[3.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                 <span className="material-symbols-outlined text-8xl text-primary animate-heartbeat">water_lux</span>
               </div>
               <h3 className="text-5xl font-black text-text-main tracking-tighter mb-4">Daily Goal</h3>
               <p className="text-text-muted/60 font-bold mb-12 text-sm uppercase tracking-[0.3em]">Stay glowing, princess!</p>
               
               <div className="grid grid-cols-2 gap-6 mb-12">
                  {[1.5, 2.0, 2.5, 3.0].map(val => (
                    <button 
                      key={val}
                      onClick={() => { setState(prev => ({ ...prev, goal: val })); setShowGoalModal(false); }}
                      className={`py-8 rounded-[3.5rem] font-black text-4xl transition-all ${state.goal === val ? 'bg-primary text-white shadow-cute scale-110' : 'bg-secondary/40 text-text-main hover:bg-secondary active:scale-90'}`}
                    >
                      {val}L
                    </button>
                  ))}
               </div>
               
               <button onClick={() => setShowGoalModal(false)} className="text-[12px] font-black uppercase text-text-muted/30 tracking-[0.5em] hover:text-primary transition-colors">Close</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.85) translateY(40px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default App;
