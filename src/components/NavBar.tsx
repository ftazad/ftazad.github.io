import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/research.html', label: 'Research' },
  { href: '/publications.html', label: 'Publications' },
  { href: '/teaching.html', label: 'Teaching & Leadership' },
];

function normalize(path: string): string {
  // Treat "/", "/index.html" as Home; strip trailing slashes otherwise.
  if (path === '' || path === '/' || path === '/index.html') return '/';
  return path.replace(/\/$/, '');
}

interface NavBarProps {
  brand: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function NavBar({ brand, theme, toggleTheme }: NavBarProps) {
  const [current, setCurrent] = useState('/');

  useEffect(() => {
    setCurrent(normalize(window.location.pathname));
  }, []);

  return (
    <nav className="nav" aria-label="Primary">
      <div className="nav-inner">
        <a className="brand" href="/">{brand}</a>
        <div className="nav-links">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-link${normalize(link.href) === current ? ' active' : ''}`}
              aria-current={normalize(link.href) === current ? 'page' : undefined}
            >
              {link.label}
            </a>
          ))}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
