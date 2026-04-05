import React from 'react';

export const IconFlame = ({ className = "w-5 h-5", stroke = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.254 1.184-3.106l.316.31c.143.143.344.256.5.256" />
  </svg>
);

export const IconShield = ({ className = "w-5 h-5", stroke = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const IconMap = ({ className = "w-5 h-5", stroke = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

export const IconAlert = ({ className = "w-5 h-5", stroke = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const IconClock = ({ className = "w-5 h-5", stroke = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const IconHospital = ({ className = "w-5 h-5", stroke = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
    <path d="M9 12h6" />
    <path d="M12 9v6" />
  </svg>
);

export const IconRoute = ({ className = "w-5 h-5", stroke = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
    <polyline points="13 3 15 5 13 7" />
  </svg>
);

export const IconPolice = ({ className = "w-5 h-5", stroke = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5" />
    <path d="M12 3v2" />
    <path d="M3 11h18" />
    <path d="m21 11-1 7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2l-1-7" />
    <path d="M17 11v4" />
    <path d="M7 11v4" />
  </svg>
);
