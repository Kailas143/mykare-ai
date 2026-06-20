import React from 'react';

interface AvatarProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking';
}

export default function Avatar({ state }: AvatarProps) {
  return (
    <div className="relative flex flex-col items-center justify-center w-64 h-64 mb-8">
      
      {/* Background ripples */}
      {state === 'listening' && (
        <>
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-4 bg-blue-300 rounded-full animate-ping opacity-30 animation-delay-300"></div>
        </>
      )}
      
      {/* Processing spinner ring */}
      {state === 'processing' && (
        <div className="absolute inset-0 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
      )}

      {/* SVG Face Container */}
      <div className={`relative w-48 h-48 rounded-full bg-[#fdf2f0] flex items-end justify-center border-4 overflow-hidden ${
        state === 'speaking' ? 'border-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.5)]' : 'border-slate-200'
      } transition-all duration-300`}>
        
        {/* Professional Female SVG Vector */}
        <svg viewBox="0 0 100 100" className="w-full h-full pt-4">
          {/* Hair back */}
          <path d="M 20 60 Q 20 10 50 10 Q 80 10 80 60 L 80 100 L 20 100 Z" fill="#2d3748" />
          
          {/* Neck */}
          <rect x="40" y="80" width="20" height="20" fill="#f4cdba" />
          
          {/* Face base */}
          <path d="M 25 45 Q 25 90 50 90 Q 75 90 75 45 Z" fill="#ffe0d1" />
          
          {/* Hair front/bangs */}
          <path d="M 20 50 Q 25 25 50 25 Q 75 25 80 50 Q 65 15 50 15 Q 35 15 20 50 Z" fill="#1a202c" />

          {/* Eyes */}
          <circle cx="38" cy="55" r="3.5" fill="#333" />
          <circle cx="62" cy="55" r="3.5" fill="#333" />
          
          {/* Glasses */}
          <path d="M 28 55 Q 38 50 46 55" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
          <path d="M 54 55 Q 62 50 72 55" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
          <path d="M 46 55 L 54 55" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />

          {/* Blush */}
          <circle cx="32" cy="65" r="5" fill="#ffb6a3" opacity="0.4" />
          <circle cx="68" cy="65" r="5" fill="#ffb6a3" opacity="0.4" />
          
          {/* Nose */}
          <path d="M 50 55 L 50 65" stroke="#e8bfae" strokeWidth="2" strokeLinecap="round" />

          {/* Mouth for TRUE Lip Sync! */}
          <path 
            id="avatar-mouth"
            d="M 42 75 Q 50 75 58 75" 
            fill="none" 
            stroke="#d47070" 
            strokeWidth="3" 
            strokeLinecap="round"
            style={{
              transition: 'd 0.05s linear'
            }}
          />
        </svg>

      </div>
    </div>
  );
}
