
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

  // Constrained range for the evolution card to stay centered within the glass
  const constrainedBottom = 22 + (displayPercentage * 0.52);

  const getEvolution = () => {
    if (displayPercentage >= 100) return { emoji: '👑', mood: 'Queen', color: 'text-[#ff4d6d]' };
    if (displayPercentage >= 80) return { emoji: '💖', mood: 'Beautiful', color: 'text-[#ff758f]' };
    if (displayPercentage >= 60) return { emoji: '🌸', mood: 'Honey', color: 'text-[#ff8fa3]' };
    if (displayPercentage >= 40) return { emoji: '🎀', mood: 'Sweetie', color: 'text-[#ffb3c1]' };
    if (displayPercentage >= 20) return { emoji: '🌷', mood: 'Waking', color: 'text-[#ffccd5]' };
    return { emoji: '🥀', mood: 'Thirsty', color: 'text-pink-200' };
  };

  const { emoji, mood, color } = getEvolution();

  const handleBottleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const newHeart = { id: Date.now(), x };
    setHearts(prev => [...prev, newHeart]);
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== newHeart.id)), 800);
    onQuickAdd();
  };

  return (
    <div 
      onClick={handleBottleClick}
      className={`relative w-[210px] xs:w-[230px] md:w-[280px] aspect-[1/1.75] bg-white/40 rounded-[4rem] md:rounded-[6rem] p-1.5 transition-all duration-700 cursor-pointer active:scale-95 group bottle-shadow ${isSplashing ? 'scale-105' : 'hover:scale-[1.01]'}`}
    >
      {/* Outer Glass Frame */}
      <div className="absolute inset-0 rounded-[4rem] md:rounded-[6rem] border-[6px] md:border-[10px] border-white/95 shadow-glass pointer-events-none z-40"></div>
      
      {/* Liquid Chamber */}
      <div className="relative w-full h-full bg-gradient-to-b from-blue-50/10 to-white/5 rounded-[3.6rem] md:rounded-[5.6rem] overflow-hidden z-10 border border-white/10">
        
        {/* Status Display */}
        <div className="absolute top-10 md:top-14 w-full z-30 flex flex-col items-center pointer-events-none px-2">
          <div className="animate-pop-out text-center">
            <h2 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter drop-shadow-sm">
              {current.toFixed(1)}<span className="text-xl md:text-2xl text-primary font-bold ml-0.5">L</span>
            </h2>
            <div className="mt-2.5 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-primary/10 shadow-cute inline-flex items-center gap-1.5">
               <span className="material-symbols-outlined text-primary text-xs animate-heartbeat">favorite</span>
               <p className="text-[9px] md:text-[11px] font-black text-text-muted uppercase tracking-widest">
                Goal {goal.toFixed(1)}L
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Evolution Mascot */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 z-20 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
          style={{ bottom: `${constrainedBottom}%`, transform: `translate(-50%, 50%)` }}
        >
          <div className={`${isSplashing ? 'animate-bounce' : 'animate-float-fast'}`}>
            <div className="bg-white/95 backdrop-blur-md p-3.5 md:p-5 rounded-[2.2rem] md:rounded-[3.5rem] border-2 md:border-4 border-white ring-[8px] md:ring-[12px] ring-primary/5 flex flex-col items-center min-w-[95px] md:min-w-[130px] transition-all shadow-xl">
              <span className={`text-4xl md:text-6xl select-none ${color} transition-all duration-500 transform group-hover:scale-110`}>
                {emoji}
              </span>
              <span className="mt-1.5 md:mt-2 text-[8px] md:text-[10px] font-black text-text-muted/40 uppercase tracking-widest">{mood}</span>
            </div>
          </div>
        </div>

        {/* Heart Pop Effects */}
        <div className="absolute inset-0 pointer-events-none z-50">
          {hearts.map(h => (
            <span 
              key={h.id} 
              className="absolute material-symbols-outlined text-primary text-2xl md:text-4xl animate-heart-rise"
              style={{ left: `${h.x}%`, bottom: '20%' }}
            >
              favorite
            </span>
          ))}
        </div>

        {/* Water Physics Visual */}
        <div 
          className="absolute bottom-0 left-0 w-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) bg-gradient-to-t from-blue-400/80 via-blue-300/60 to-blue-200/40"
          style={{ height: `${displayPercentage}%` }}
        >
          {/* Surface Wave */}
          <div className="absolute -top-[25px] md:-top-[35px] left-0 w-[400%] h-10 md:h-14 overflow-hidden pointer-events-none opacity-60">
            <svg className="absolute top-0 left-0 w-full h-full fill-blue-100/60 animate-[wave_16s_linear_infinite]" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z"></path>
            </svg>
          </div>
        </div>

        {/* Scale Marks */}
        <div className="absolute right-5 md:right-7 top-[15%] bottom-[15%] flex flex-col justify-between opacity-10 z-20 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-0.5 bg-text-main rounded-full ${i % 2 === 0 ? 'w-6 md:w-10' : 'w-3 md:w-5'}`} />
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes wave { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
};

export default WaterBottle;
