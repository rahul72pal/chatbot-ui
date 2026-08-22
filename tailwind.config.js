/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // AI-Native Modern Theme Tokens
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          accent: '#06B6D4', // Neon Cyan
          glow: '#A855F7',   // Electric Violet
        },
        dark: {
          bg: '#090D16',       // Deepest Slate Background
          card: '#0F172A',     // Card Surface
          elevated: '#1E293B', // Elevated Surface
          border: '#1E293B',   // Subtle Border
          subtle: '#334155',   // Medium Border
        },
        primary: "#6366F1",
        "primary-container": "#4F46E5",
        "primary-fixed": "#312E81",
        "on-primary": "#ffffff",
        
        secondary: "#94A3B8",
        "secondary-container": "#1E293B",
        "on-secondary": "#F8FAFC",

        background: "#090D16",
        "on-background": "#F8FAFC",
        
        surface: "#0F172A",
        "surface-bright": "#1E293B",
        "surface-dim": "#0B0F19",
        "on-surface": "#F8FAFC",
        "on-surface-variant": "#94A3B8",
        
        "border-subtle": "#1E293B",
        "text-muted": "#64748B",
        "code-bg": "#0B0F19",
        
        error: "#EF4444",
        "error-container": "#450A0A",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'DM Sans'", "'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(99, 102, 241, 0.25)',
        'glow-md': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-lg': '0 0 40px -10px rgba(168, 85, 247, 0.4)',
        'glow-cyan': '0 0 30px -5px rgba(6, 182, 212, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
