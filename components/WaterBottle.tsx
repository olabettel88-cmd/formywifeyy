
import React, { useEffect, useState } from 'react';

interface WaterBottleProps {
  current: number;
  goal: number;
  isSplashing: boolean;
  onQuickAdd: () => void;
}

const WaterBottle: React.FC<WaterBottleProps> = ({ current, goal, isSplashing, onQuickAdd }) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const targetPercentage = Math.min((current / goal) * 100, 100);

  useEffect(() => {
    const timeout = setTimeout(() => setDisplayPercentage(targetPercentage), 100);
    return () => clearTimeout(timeout);
  }, [targetPercentage]);

  // Constraints: Map 0-100% hydration to a safe 18-78% vertical range inside the bottle to prevent clipping
  const constrainedBottom = 18 + (displayPercentage * 0.6);

  // Pink Evolution Logic - Custom Designed for her
  const getEvolution = () => {
    if (displayPercentage >= 100) return { emoji: '👑', mood: 'Queen', sub: 'Pure Magic!', glow: 'shadow-[0_0_30px_rgba(255,77,109,0.5)]', color: 'text-[#ff4d6d]' };
    if (displayPercentage >= 80) return { emoji: '💖', mood: 'Glowy', sub: 'Sparkling!', glow: 'shadow-[0_0_20px_rgba(255,117,143,0.4)]', color: 'text-[#ff758f]' };
    if (displayPercentage >= 60) return { emoji: '🌸', mood: 'Bloom', sub: 'Lovely!', glow: 'shadow-[0_0_15px_rgba(255,143,163,0.3)]', color: 'text-[#ff8fa3]' };
    if (displayPercentage >= 40) return { emoji: '🎀', mood: 'Sweet', sub: 'Good girl!', glow: 'shadow-[0_0_10px_rgba(255,179,193,0.2)]', color: 'text-[#ffb3c1]' };
    if (displayPercentage >= 20) return { emoji: '🌷', mood: 'Growing', sub: 'Almost!', glow: 'shadow-sm', color: 'text-[#ffccd5]' };
    return { emoji: '🥀', mood: 'Thirsty', sub: 'Needs love', glow: 'shadow-none', color: 'text-pink-200' };
  };

  const { emoji, mood, sub, glow, color } = getEvolution();

  const handleBottleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const newHeart = { id: Date.now(), x };
    setHearts(prev => [...prev, newHeart]);
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== newHeart.id)), 1000);
    onQuickAdd();
  };

  return (
    <div 
      onClick={handleBottleClick}
      className={`relative w-full max-w-[280px] md:max-w-[320px] aspect-[1/1.6] bg-white/50 rounded-[5rem] md:rounded-[6.5rem] p-2 md:p-3 transition-all duration-700 cursor-pointer active:scale-95 group bottle-shadow ${isSplashing ? 'scale-105 rotate-1' : 'hover:scale-[1.02]'}`}
    >
      {/* Premium Bezel */}
      <div className="absolute inset-0 rounded-[5rem] md:rounded-[6.5rem] border-[8px] md:border-[12px] border-white/90 shadow-glass pointer-events-none z-40"></div>
      
      {/* Cap */}
      <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-1/2 h-10 bg-white rounded-t-3xl z-30 shadow-sm border-x-4 border-t-4 border-white/20"></div>

      {/* Internal Container */}
      <div className="relative w-full h-full bg-gradient-to-b from-blue-50/10 to-white/5 rounded-[4.5rem] md:rounded-[6rem] overflow-hidden z-10 border border-white/20">
        
        {/* Readings */}
        <div className="absolute top-12 md:top-16 w-full z-30 flex flex-col items-center pointer-events-none px-4">
          <div className="animate-pop-out text-center">
            <h2 className="text-6xl md:text-8xl font-black text-text-main tracking-tighter drop-shadow-md">
              {current.toFixed(1)}<span className="text-2xl md:text-3xl text-primary font-bold ml-1">L</span>
            </h2>
            <div className="mt-3 md:mt-5 px-4 md:px-6 py-1.5 md:py-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-primary/20 shadow-cute inline-flex items-center gap-2 transition-transform group-hover:scale-105">
               <span className="material-symbols-outlined text-primary text-lg animate-heartbeat">favorite</span>
               <p className="text-[10px] md:text-[12px] font-black text-text-muted uppercase tracking-[0.2em]">
                Goal: {goal.toFixed(1)}L
              </p>
            </div>
          </div>
        </div>

        {/* The Pink Companion Card */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 z-20 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
          style={{ bottom: `${constrainedBottom}%`, transform: `translate(-50%, 50%)` }}
        >
          <div className={`${isSplashing ? 'animate-bounce' : 'animate-float-fast'}`}>
            <div className="relative flex flex-col items-center">
              <div className={`bg-white/95 backdrop-blur-xl p-4 md:p-6 rounded-[2.5rem] md:rounded-[3.5rem] border-2 md:border-4 border-white ring-4 md:ring-[10px] ring-primary/5 flex flex-col items-center min-w-[110px] md:min-w-[140px] transition-all ${glow}`}>
                <span className={`text-5xl md:text-7xl select-none ${color} drop-shadow-md transition-all duration-500 transform group-hover:scale-110`}>
                  {emoji}
                </span>
                <span className="mt-2 text-[9px] md:text-[11px] font-black text-text-muted/60 uppercase tracking-[0.2em]">{mood}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Heart Particles */}
        <div className="absolute inset-0 pointer-events-none z-50">
          {hearts.map(h => (
            <span 
              key={h.id} 
              className="absolute material-symbols-outlined text-primary text-3xl animate-heart-rise"
              style={{ left: `${h.x}%`, bottom: '20%' }}
            >
              favorite
            </span>
          ))}
        </div>

        {/* Water Logic */}
        <div 
          className="absolute bottom-0 left-0 w-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) bg-gradient-to-t from-blue-400/90 via-blue-300/70 to-blue-200/50"
          style={{ height: `${displayPercentage}%` }}
        >
          <div className="absolute -top-[35px] left-0 w-[400%] h-14 overflow-hidden pointer-events-none opacity-80">
            <svg className="absolute top-0 left-0 w-full h-full fill-blue-200/80 animate-[wave_16s_linear_infinite]" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z"></path>
            </svg>
            <svg className="absolute top-2 left-0 w-full h-full fill-blue-300/60 animate-[wave_12s_linear_infinite_reverse]" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z"></path>
            </svg>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none overflow-hidden">
             <div className="absolute inset-0 animate-shimmer opacity-30"></div>
          </div>
        </div>

        {/* Level Marks */}
        <div className="absolute right-6 top-[15%] bottom-[15%] flex flex-col justify-between opacity-5 z-20 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`h-1 bg-text-main rounded-full ${i % 2 === 0 ? 'w-8' : 'w-4'}`} />
          ))}
        </div>
      </div>

      {/* Tap Hint */}
      <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none hidden md:block">
        <div className="bg-white/95 backdrop-blur-md px-6 py-2 rounded-full border border-primary/20 shadow-cute-hover">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] whitespace-nowrap">Tap to Drink 💖</span>
        </div>
      </div>
      
      <style>{`
        @keyframes wave { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
};

export default WaterBottle;
