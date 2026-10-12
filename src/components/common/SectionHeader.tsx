import React from 'react';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  /** Use 1 for the main heading of a page. */
  level?: 1 | 2;
  /** Light text for dark backgrounds. */
  inverted?: boolean;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  subtitle,
  centered = false,
  className = '',
  level = 2,
  inverted = false,
  action,
}) => {
  const Heading = level === 1 ? 'h1' : 'h2';
  return (
    <div
      className={`mb-10 sm:mb-12 flex flex-col gap-5 ${
        centered ? 'items-center text-center max-w-3xl mx-auto' : 'md:flex-row md:items-end md:justify-between'
      } ${className}`}
    >
      <div className={centered ? '' : 'max-w-2xl'}>
        {badge && <p className={`eyebrow ${inverted ? 'text-gold-300!' : ''}`}>{badge}</p>}
        <Heading
          className={`mt-3 font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-[1.1] text-balance ${
            inverted ? 'text-white' : 'text-ink'
          }`}
        >
          {title}
        </Heading>
        {subtitle && (
          <p className={`mt-4 text-base sm:text-lg leading-relaxed text-pretty ${inverted ? 'text-stone-300' : 'text-stone-600'}`}>{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
