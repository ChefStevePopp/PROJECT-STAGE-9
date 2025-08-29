import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
/* import { TempoDevtools } from 'tempo-devtools'; [deprecated] */
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';

// Initialize Tempo before rendering
if (import.meta.env.VITE_TEMPO) {
  /* TempoDevtools.init() [deprecated] */;
}
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'card !bg-gray-800 !text-white',
          duration: 3000,
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);