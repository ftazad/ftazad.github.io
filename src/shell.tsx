import { useEffect, useState, type ReactNode } from 'react';

// Self-hosted fonts (no external CDN).
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/600.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';

import './index.css';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { profileData } from './data/loadContent';

function getInitialTheme(): 'light' | 'dark' {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark' || attr === 'light') return attr;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Shared page frame: sticky NavBar + main content + Footer, with theme toggle. */
export default function Shell({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* storage may be unavailable; theme still applies for the session */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div className="page">
      <NavBar brand={profileData.name} theme={theme} toggleTheme={toggleTheme} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
