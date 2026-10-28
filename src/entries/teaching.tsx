import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Teaching from '../pages/Teaching';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Teaching />
  </StrictMode>,
);
