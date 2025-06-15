import { StrictMode } from 'react';
import { App } from './App';
import { Buffer } from 'buffer';

import './index.css';
import { createRoot } from 'react-dom/client';

declare global {
  interface Window {
    APP: APP;
  }
}

window.APP = window.APP || {};
window.Buffer = Buffer;

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
