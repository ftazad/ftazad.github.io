import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Publications from '../pages/Publications';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Publications />
  </StrictMode>,
);
