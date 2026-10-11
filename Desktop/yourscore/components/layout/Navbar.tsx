'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Approach & Process', href: '/#approach-process' },
  { label: 'Mentor', href: '/mentor' },
  { label: 'Our Team', href: '/#our-team' },
  { label: 'Results', href: '/results' },
  { label: 'Contact', href: '/contact' },
];

const SIGNUP_URL = 'https://yourscore.learnyst.com/sign-up';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="site-nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        padding: '18px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div className={`nav-pill${menuOpen ? ' nav-menu-open' : ''}`}
        style={{
          width: 'min(1240px, calc(100vw - 32px))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '12px 18px 12px 20px',
          border: '1px solid rgba(232, 228, 224, 0.9)',
          borderRadius: '999px',
          background: scrolled ? 'rgba(255,255,255,0.82)' : 'rgba(250,250,248,0.8)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 12px 30px rgba(10,10,10,0.05)',
          transition: 'all 0.35s ease',
          pointerEvents: 'auto',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '20px',
              fontWeight: 900,
              letterSpacing: '-0.8px',
              color: '#0a0a0a',
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '2px',
            }}
          >
            Your<em style={{ fontStyle: 'italic', color: '#8B0000' }}>Score</em>
          </span>
        </Link>

        <button
          type="button"
          className="mobile-nav-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>

        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
              style={{
                fontSize: '12px',
                color: pathname === item.href ? '#8B0000' : '#4b4b4b',
                textDecoration: 'none',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '10px 12px',
                borderRadius: '999px',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#0a0a0a';
                e.currentTarget.style.background = 'rgba(139,0,0,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#4b4b4b';
                e.currentTarget.style.background = 'transparent';
              }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          className="nav-cta"
          href={SIGNUP_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: '12px',
            fontWeight: 700,
            background: '#1e3a5f',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '999px',
            textDecoration: 'none',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            boxShadow: '0 12px 24px rgba(30,58,95,0.22)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#274b74';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#1e3a5f';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onClick={() => setMenuOpen(false)}
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
