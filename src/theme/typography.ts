// src/theme/typography.ts
export const typography = {
  fontFamily: {
    display: ['DM Sans', 'sans-serif'],
    body: ['Inter', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
    status: ['Space Grotesk', 'sans-serif'],
  },
  fontSize: {
    // Adjusted fluid scales with better max values
    'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.15vw, 0.825rem)',
    'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.2vw, 0.925rem)',
    'fluid-base': 'clamp(1rem, 0.925rem + 0.25vw, 1.05rem)',
    'fluid-lg': 'clamp(1.125rem, 1rem + 0.3vw, 1.175rem)',
    'fluid-xl': 'clamp(1.25rem, 1.125rem + 0.35vw, 1.375rem)',
    'fluid-2xl': 'clamp(1.5rem, 1.375rem + 0.4vw, 1.675rem)',
    'fluid-3xl': 'clamp(1.875rem, 1.75rem + 0.45vw, 2rem)',
    'fluid-4xl': 'clamp(2.25rem, 2rem + 0.5vw, 2.5rem)',
    'fluid-5xl': 'clamp(3rem, 2.75rem + 0.75vw, 3.5rem)',
    'fluid-6xl': 'clamp(4rem, 3.75rem + 1vw, 4.5rem)',
  },
  // Adjusted line heights for better readability on large screens
  lineHeight: {
    'fluid-none': '1',
    'fluid-tight': '1.2',
    'fluid-snug': '1.35',
    'fluid-normal': 'clamp(1.5, calc(1.5 + 0.15vw), 1.65)',
    'fluid-relaxed': 'clamp(1.625, calc(1.625 + 0.2vw), 1.75)',
    'fluid-loose': 'clamp(2, calc(2 + 0.25vw), 2.25)',
  }
} as const;

// src/theme/spacing.ts - Adjusted spacing for better scaling
export const spacing = {
  'fluid-px': 'clamp(0.0625rem, 0.05rem + 0.025vw, 0.075rem)',
  'fluid-0.5': 'clamp(0.125rem, 0.1rem + 0.05vw, 0.15rem)',
  'fluid-1': 'clamp(0.25rem, 0.2rem + 0.075vw, 0.3rem)',
  'fluid-1.5': 'clamp(0.375rem, 0.3rem + 0.1vw, 0.45rem)',
  'fluid-2': 'clamp(0.5rem, 0.4rem + 0.15vw, 0.6rem)',
  'fluid-2.5': 'clamp(0.625rem, 0.5rem + 0.2vw, 0.75rem)',
  'fluid-3': 'clamp(0.75rem, 0.6rem + 0.25vw, 0.9rem)',
  'fluid-3.5': 'clamp(0.875rem, 0.7rem + 0.3vw, 1.05rem)',
  'fluid-4': 'clamp(1rem, 0.8rem + 0.35vw, 1.2rem)',
  'fluid-5': 'clamp(1.25rem, 1rem + 0.4vw, 1.5rem)',
  'fluid-6': 'clamp(1.5rem, 1.2rem + 0.45vw, 1.8rem)',
  'fluid-8': 'clamp(2rem, 1.6rem + 0.5vw, 2.4rem)',
  'fluid-10': 'clamp(2.5rem, 2rem + 0.75vw, 3rem)',
  'fluid-12': 'clamp(3rem, 2.4rem + 1vw, 3.6rem)',
  'fluid-16': 'clamp(4rem, 3.2rem + 1.25vw, 4.8rem)',
} as const;