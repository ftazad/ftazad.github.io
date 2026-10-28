import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Research from '../pages/Research';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Research />
  </StrictMode>,
);
