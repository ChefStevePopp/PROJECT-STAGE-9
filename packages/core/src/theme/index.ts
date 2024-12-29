export * from './colors';
export * from './typography';
export * from './components';

export const spacing = {
  'fluid-px': 'clamp(0.0625rem, 0.05rem + 0.0625vw, 0.125rem)',
  'fluid-0.5': 'clamp(0.125rem, 0.1rem + 0.125vw, 0.25rem)',
  'fluid-1': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
  'fluid-1.5': 'clamp(0.375rem, 0.3rem + 0.375vw, 0.75rem)',
  'fluid-2': 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
  'fluid-2.5': 'clamp(0.625rem, 0.5rem + 0.625vw, 1.25rem)',
  'fluid-3': 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
  'fluid-3.5': 'clamp(0.875rem, 0.7rem + 0.875vw, 1.75rem)',
  'fluid-4': 'clamp(1rem, 0.8rem + 1vw, 2rem)',
  'fluid-5': 'clamp(1.25rem, 1rem + 1.25vw, 2.5rem)',
  'fluid-6': 'clamp(1.5rem, 1.2rem + 1.5vw, 3rem)',
  'fluid-8': 'clamp(2rem, 1.6rem + 2vw, 4rem)',
  'fluid-10': 'clamp(2.5rem, 2rem + 2.5vw, 5rem)',
  'fluid-12': 'clamp(3rem, 2.4rem + 3vw, 6rem)',
  'fluid-16': 'clamp(4rem, 3.2rem + 4vw, 8rem)',
} as const;