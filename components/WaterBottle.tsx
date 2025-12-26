
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

  // Constraints to keep emoji card perfectly within bottle bounds even at extremes
  // 15% is the floor (empty), 82% is the ceiling (full)
  const constrainedBottom = 15 + (displayPercentage * 0.67);

  // Pink Evolution Emojis: Designing the journey for HER
  const getEvolution = () => {
    if (displayPercentage >= 100) return { emoji: '👑', mood: 'Queen', sub: 'The Glow is Real!', color: 'text-[#ff4d6d]' };
    if (displayPercentage >= 80) return { emoji: '💖', mood: 'Lovely', sub: 'Sparkling Bright!', color: 'text-[#ff758f]' };
    if (displayPercentage >= 60) return { emoji: '🌸', mood: 'Bloom', sub: 'Hydrated Beauty!', color: 'text-[#ff8fa3]' };
    if (displayPercentage >= 40) return { emoji: '🎀', mood: 'Cutie', sub: 'Sip by Sip!', color: 'text-[#ffb3c1]' };
    if (displayPercentage >= 20) return { emoji: '🌷', mood: 'Sweet', sub: 'Waking up!', color: 'text-[#ffccd5]' };
    return { emoji: '🥀', mood: 'Thirsty', sub: 'Needs Love...', color: 'text-pink-200' };
  };

  const { emoji, mood, sub, color } = getEvolution();

  const handleBottleClick = (e: React.MouseEvent) => {
    // Heart pop logic
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const newHeart = { id: Date.now(), x };
    setHearts(prev => [...prev, newHeart]);
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== newHeart.id)), 1200);
    onQuickAdd();
  };

  return (
    <div 
      onClick={handleBottleClick}
      className={`relative w-full max-w-[340px] aspect-[1/1.6] bg-white/50 rounded-[6.5rem] p-3 transition-all duration-700 cursor-pointer active:scale-95 group bottle-shadow ${isSplashing ? 'scale-105 rotate-1' : 'hover:scale-[1.03]'}`}
    >
      {/* Premium Glass Bezel */}
      <div className="absolute inset-0 rounded-[6.5rem] border-[12px] border-white/90 shadow-glass pointer-events-none z-40"></div>
      
      {/* Bottle Cap Structure */}
      <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-3/5 h-12 bg-white rounded-t-[2.5rem] z-30 shadow-sm border-x-4 border-t-4 border-white/20">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-primary/20 rounded-full animate-pulse"></div>
      </div>

      {/* Internal Vessel */}
      <div className="relative w-full h-full bg-gradient-to-b from-blue-50/10 to-white/5 rounded-[6rem] overflow-hidden z-10 border border-white/20">
        
        {/* Readings Display */}
        <div className="absolute top-16 w-full z-30 flex flex-col items-center pointer-events-none px-4">
          <div className="animate-pop-out text-center">
            <h2 className="text-8xl font-black text-text-main tracking-tighter drop-shadow-md">
              {current.toFixed(1)}<span className="text-3xl text-primary font-bold ml-1">L</span>
            </h2>
            <div className="mt-5 px-6 py-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-primary/20 shadow-cute inline-flex items-center gap-3 transition-transform group-hover:scale-110">
               <span className="material-symbols-outlined text-primary text-xl animate-heartbeat">favorite</span>
               <p className="text-[12px] font-black text-text-muted uppercase tracking-[0.25em]">
                Goal: {goal.toFixed(1)}L
              </p>
            </div>
          </div>
        </div>

        {/* The Pink Emoji Companion */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 z-20 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
          style={{ bottom: `${constrainedBottom}%`, transform: `translate(-50%, 50%)` }}
        >
          <div className={`${isSplashing ? 'animate-bounce' : 'animate-float-fast'}`}>
            <div className="relative flex flex-col items-center">
              <div className="bg-white/95 backdrop-blur-2xl p-6 rounded-[3.5rem] shadow-2xl border-4 border-white ring-[10px] ring-primary/5 flex flex-col items-center min-w-[140px] group-hover:ring-primary/20 transition-all">
                <span className={`text-7xl select-none ${color} drop-shadow-md transition-all duration-500 transform group-hover:rotate-12`}>
                  {emoji}
                </span>
                <span className="mt-3 text-[11px] font-black text-text-muted/60 uppercase tracking-[0.2em]">{mood}</span>
                <span className="text-[9px] font-bold text-primary/40 mt-1 uppercase tracking-widest">{sub}</span>
              </div>
              
              {displayPercentage >= 100 && (
                <div className="absolute inset-[-20px] bg-primary/10 blur-[30px] rounded-full animate-pulse -z-10"></div>
              )}
            </div>
          </div>
        </div>

        {/* Heart Pop Effects */}
        <div className="absolute inset-0 pointer-events-none z-50">
          {hearts.map(h => (
            <span 
              key={h.id} 
              className="absolute material-symbols-outlined text-primary text-4xl animate-heart-rise"
              style={{ left: `${h.x}%`, bottom: '15%' }}
            >
              favorite
            </span>
          ))}
        </div>

        {/* Water Level Logic */}
        <div 
          className="absolute bottom-0 left-0 w-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) bg-gradient-to-t from-blue-400/90 via-blue-300/70 to-blue-200/50"
          style={{ height: `${displayPercentage}%` }}
        >
          {/* Wave Shapes */}
          <div className="absolute -top-[40px] left-0 w-[400%] h-16 overflow-hidden pointer-events-none opacity-80">
            <svg className="absolute top-0 left-0 w-full h-full fill-blue-200/80 animate-[wave_16s_linear_infinite]" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z"></path>
            </svg>
            <svg className="absolute top-3 left-0 w-full h-full fill-blue-300/60 animate-[wave_12s_linear_infinite_reverse]" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z"></path>
            </svg>
          </div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none overflow-hidden">
             <div className="absolute inset-0 animate-shimmer"></div>
          </div>
          
          {/* Bubbles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {[...Array(15)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute bg-white/40 rounded-full animate-[floatUp_var(--duration)_infinite_ease-in]"
                  style={{
                    left: `${Math.random() * 95}%`,
                    width: `${Math.random() * 8 + 3}px`,
                    aspectRatio: '1',
                    bottom: '-20px',
                    '--duration': `${Math.random() * 3 + 4}s`,
                    animationDelay: `${Math.random() * 5}s`
                  } as any}
                />
             ))}
          </div>
        </div>

        {/* Level Ticks */}
        <div className="absolute right-8 top-[10%] bottom-[10%] flex flex-col justify-between opacity-10 z-20 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`h-1.5 bg-text-main rounded-full ${i % 2 === 0 ? 'w-12' : 'w-6'}`} />
          ))}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-8 py-2.5 rounded-full border border-primary/20 shadow-cute-hover">
          <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] whitespace-nowrap">Tap to Drink 💖</span>
        </div>
      </div>
      
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 0.6; }
          100% { transform: translateY(-600px) scale(2); opacity: 0; }
        }
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default WaterBottle;
