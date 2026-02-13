import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        
        // Animekama Theme Colors
        'anime-black': '#0f0f12',      // Deep warm dark background
        'anime-card': '#1a1a23',       // Card background
        'anime-orange': '#ff7e27',     // Primary Action / Brand (Vibrant Orange)
        'anime-amber': '#ffb700',      // Secondary / Highlights
        'anime-red': '#ff4757',        // Accent / Notification
        'anime-cream': '#fff4e6',      // Text / Soft Highlights
        'anime-text': '#eee',          // Primary Text
        'anime-muted': '#a0a0b0',      // Secondary Text
        'aura-black': '#0f0f1a',       // Kept for backward compat if needed temporarily
        'aura-purple': '#ff7e27',      // Mapping old purple to orange for immediate effect
        'aura-pink': '#ffb700',        // Mapping old pink to amber
        'aura-card': '#1a1a23',        
        'aura-text': '#eee',
        'aura-muted': '#a0a0b0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
