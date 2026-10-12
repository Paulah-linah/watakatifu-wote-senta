import React from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface TabItem {
  key: string;
  label: string;
  icon?: LucideIcon;
}

/** Page sub-navigation whose active tab comes from the URL, so tabs are linkable and work with Back/Forward. */
export const TabNav: React.FC<{ basePath: string; items: TabItem[]; active: string; label: string }> = ({
  basePath,
  items,
  active,
  label,
}) => (
  <nav aria-label={label} className="flex items-center justify-start sm:justify-center border-b border-stone-200">
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-px">
      {items.map(({ key, label: text, icon: Icon }) => {
        const isActive = key === active;
        return (
          <Link
            key={key}
            to={`${basePath}/${key}`}
            preventScrollReset
            aria-current={isActive ? 'page' : undefined}
            className={`py-3 px-3 sm:px-5 text-xs sm:text-sm font-semibold border-b-2 transition-colors shrink-0 flex items-center gap-2 ${
              isActive ? 'border-sky-700 text-sky-900 bg-sky-50/50' : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{text}</span>
          </Link>
        );
      })}
    </div>
  </nav>
);
