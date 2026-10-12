import React from 'react';

/**
 * The official Watakatifu Wote Senta logo, used exactly as supplied (public/brand/wws-logo.png).
 * The artwork has a white background, so place it on white surfaces or use `framed`.
 */
export const Logo: React.FC<{ className?: string; framed?: boolean }> = ({ className = 'h-14 w-auto', framed = false }) => {
  const img = (
    <img
      src="/brand/wws-logo.png"
      width={572}
      height={376}
      alt="Watakatifu Wote Senta, Catholic Diocese of Ngong"
      className={`${className} object-contain`}
      decoding="async"
    />
  );
  return framed ? <span className="inline-flex rounded-2xl bg-white p-1.5 shadow-soft">{img}</span> : img;
};
