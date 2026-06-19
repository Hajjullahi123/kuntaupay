import React from 'react';

const KuntauPayLogo = ({ size = 40, className = "", stacked = false }) => {
  return (
    <div className={`flex ${stacked ? 'flex-col justify-center' : 'items-center'} gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center ${stacked ? 'mx-auto' : ''}`} style={{ width: size * 1.2, height: size * 1.2 }}>
        <img 
          src="/images/school_logo_transparent.png" 
          alt="School Logo" 
          className="rounded-lg shadow-sm border border-slate-200/50"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => {
             // Fallback if image isn't found
             e.target.style.display = 'none';
          }}
        />
      </div>
      <div className={`flex flex-col ${stacked ? 'items-center mt-2' : ''}`}>
        <span className={`font-black tracking-tighter text-lg leading-none ${className.includes('logo-white-text') ? 'text-white' : 'text-slate-900'}`}>
          KUNTAU
        </span>
        <span className="text-primary font-black text-[8px] uppercase tracking-[3px] mt-1">
          PAY
        </span>
      </div>
    </div>
  );
};

export default KuntauPayLogo;
