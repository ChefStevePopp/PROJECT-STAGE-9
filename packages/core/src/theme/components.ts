export const components = {
  card: 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl',
  button: {
    base: 'px-fluid-2 py-fluid-1 rounded-xl font-medium transition-all duration-200 text-fluid-sm disabled:opacity-50 disabled:cursor-not-allowed',
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    ghost: 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-200',
  },
  input: 'bg-gray-800/50 border border-gray-700/50 rounded-xl px-fluid-2 py-fluid-1 text-fluid-base focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder:text-gray-500',
  tab: {
    base: 'relative flex items-center gap-3 px-6 py-3 rounded-lg transition-all text-sm font-medium',
    inactive: 'text-gray-400 hover:text-white hover:bg-gray-800/50',
    active: 'bg-gray-800 text-white',
    indicator: 'absolute -top-px left-0 right-0 h-1 rounded-full transition-opacity',
  }
} as const;