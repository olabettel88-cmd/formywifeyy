
import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="fixed top-6 left-6 z-50 pointer-events-none">
      <div className="pointer-events-auto glass-effect p-3 rounded-full shadow-cute border-2 border-white/70 bg-white/40 backdrop-blur-lg hover:scale-110 active:scale-95 transition-all cursor-pointer">
        <div className="bg-primary/25 p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-2xl animate-bounce-slight">water_drop</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
