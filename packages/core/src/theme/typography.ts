export const typography = {
  fontFamily: {
    display: ['DM Sans', 'sans-serif'],
    body: ['Inter', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
    status: ['Space Grotesk', 'sans-serif'],
  },
  fontSize: {
    'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
    'fluid-base': 'clamp(1rem, 0.925rem + 0.375vw, 1.125rem)',
    'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
    'fluid-xl': 'clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)',
    'fluid-2xl': 'clamp(1.5rem, 1.375rem + 0.625vw, 1.875rem)',
    'fluid-3xl': 'clamp(1.875rem, 1.75rem + 0.625vw, 2.25rem)',
    'fluid-4xl': 'clamp(2.25rem, 2rem + 1.25vw, 3rem)',
    'fluid-5xl': 'clamp(3rem, 2.75rem + 1.25vw, 4rem)',
    'fluid-6xl': 'clamp(4rem, 3.75rem + 1.25vw, 5rem)',
  },
  lineHeight: {
    'fluid-none': '1',
    'fluid-tight': '1.25',
    'fluid-snug': '1.375',
    'fluid-normal': 'clamp(1.5, calc(1.5 + 0.25vw), 1.75)',
    'fluid-relaxed': 'clamp(1.625, calc(1.625 + 0.375vw), 2)',
    'fluid-loose': 'clamp(2, calc(2 + 0.5vw), 2.5)',
  }
} as const;