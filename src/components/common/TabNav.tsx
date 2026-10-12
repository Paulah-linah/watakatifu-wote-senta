import React from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface TabItem {
  key: string;
  label: string;
  icon?: LucideIcon;
}

/**
 * Page sub-navigation whose active tab comes from the URL, so tabs are linkable and work with Back/Forward.
 * Sticks under the site header while the section is scrolled.
 */
export const TabNav: React.FC<{ basePath: string; items: TabItem[]; active: string; label: string }> = ({ basePath, items, active, label }) => (
  <nav aria-label={label} className="sticky top-[5rem] sm:top-[5.5rem] z-20 -mt-7 mb-10">
    <div className="container-page">
      <div className="flex justify-start md:justify-center">
        <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/95 backdrop-blur p-1.5 shadow-lift border border-sand/70 [scrollbar-width:none]">
          {items.map(({ key, label: text, icon: Icon }) => {
            const isActive = key === active;
            return (
              <Link
                key={key}
                to={`${basePath}/${key}`}
                preventScrollReset
                aria-current={isActive ? 'page' : undefined}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-sky-900 text-white shadow-sm' : 'text-stone-600 hover:text-sky-900 hover:bg-parchment'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-gold-300' : 'text-stone-400'}`} />}
                <span className="whitespace-nowrap">{text}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  </nav>
);
