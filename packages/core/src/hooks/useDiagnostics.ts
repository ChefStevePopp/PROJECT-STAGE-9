import { useState, useEffect } from 'react';

export function useDiagnostics() {
  const [showDiagnostics, setShowDiagnostics] = useState(() => {
    const savedPreference = localStorage.getItem('showDiagnostics');
    return savedPreference === 'true';
  });

  useEffect(() => {
    localStorage.setItem('showDiagnostics', showDiagnostics.toString());
    if (showDiagnostics) {
      document.body.classList.add('show-diagnostics');
    } else {
      document.body.classList.remove('show-diagnostics');
    }
  }, [showDiagnostics]);

  return {
    showDiagnostics,
    setShowDiagnostics
  };
}