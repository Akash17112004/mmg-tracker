import type { ReactNode } from 'react';

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
};

export default function PageHero({ eyebrow, title, children }: PageHeroProps) {
  return (
    <header className="page-hero">
      <div className="page-hero-orb page-hero-orb--one" aria-hidden="true" />
      <div className="page-hero-orb page-hero-orb--two" aria-hidden="true" />

      <div className="page-frame">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children ? <p className="page-hero-copy">{children}</p> : null}
      </div>
    </header>
  );
}
