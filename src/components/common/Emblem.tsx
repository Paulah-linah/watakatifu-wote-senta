import React from 'react';

/** Arched chapel-window emblem with a gold cross and halo (All Saints). */
export const Emblem: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 48 56" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="emblem-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#294a79" />
        <stop offset="1" stopColor="#121f33" />
      </linearGradient>
    </defs>
    <path d="M24 1.5C11.6 1.5 2 11.6 2 24v30.5h44V24C46 11.6 36.4 1.5 24 1.5Z" fill="url(#emblem-bg)" stroke="#d3a947" strokeWidth="1.5" />
    <path d="M24 6.5C14.6 6.5 7 14.3 7 24v26h34V24c0-9.7-7.6-17.5-17-17.5Z" fill="none" stroke="#d3a947" strokeOpacity="0.35" strokeWidth="1" />
    <circle cx="24" cy="20" r="7.5" fill="none" stroke="#e0c06c" strokeOpacity="0.55" strokeWidth="1" />
    <rect x="22.25" y="12" width="3.5" height="32" rx="1" fill="#e0c06c" />
    <rect x="15" y="19" width="18" height="3.5" rx="1" fill="#e0c06c" />
  </svg>
);
