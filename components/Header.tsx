
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full flex justify-between items-center mb-10 animate-[fadeInDown_1s_ease-out]">
      <div className="glass-effect px-6 py-3 rounded-full flex items-center gap-3 shadow-cute hover:scale-105 transition-transform duration-300 cursor-pointer">
        <div className="bg-primary/20 p-2 rounded-full">
          <span className="material-symbols-outlined text-primary text-2xl animate-bounce-slight">water_drop</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text-main">
          Hydro<span className="text-primary">Love</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-12 h-12 rounded-full bg-white shadow-cute flex items-center justify-center text-primary-hover hover:bg-primary hover:text-white transition-all duration-300 hover:rotate-90">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div 
          className="h-12 w-12 rounded-full bg-cover bg-center border-4 border-white shadow-cute hover:scale-110 transition-transform duration-300 relative group"
          style={{ backgroundImage: `url('https://picsum.photos/seed/hydrolove/100/100')` }}
        >
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
