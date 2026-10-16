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
        // App Theme Tokens
        navy: {
          950: '#070B14', // Main application background
          900: '#080E1B', // Sidebar background
          850: '#091121', // Navbar background
          800: '#0D1730', // Primary card background
          750: '#101D39', // Elevated card background
          700: '#142342', // Secondary surface
          border: '#1C2C4B', // Primary border
          'border-subtle': '#243653', // Subtle border
        },
        app: {
          bg: '#070B14',
          sidebar: '#080E1B',
          navbar: '#091121',
          card: '#0D1730',
          elevated: '#101D39',
          surface: '#142342',
          border: '#1C2C4B',
          'border-subtle': '#243653',
          'text-primary': '#F3F6FF',
          'text-secondary': '#A3B3CF',
          'text-muted': '#71829F',
        },
        brand: {
          indigo: '#4F46E5',
          purple: '#7C3AED',
          blue: '#2563EB',
          cyan: '#22D3EE',
          success: '#10D6A0',
          warning: '#FBBF24',
          error: '#FB7185',
        },
        primary: {
          DEFAULT: '#4F46E5',
          dark: '#4338CA',
          light: '#6366F1',
        },
        purple: {
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
          light: '#8B5CF6',
        },
        slate: {
          850: '#0F172A',
          900: '#0B1120',
          950: '#070B14',
        }
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'DM Sans'", "'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        'glow-indigo': '0 0 25px -4px rgba(79, 70, 229, 0.35)',
        'glow-purple': '0 0 30px -5px rgba(124, 58, 237, 0.40)',
        'glow-cyan': '0 0 25px -5px rgba(34, 211, 238, 0.35)',
        'glow-sm': '0 0 15px -3px rgba(79, 70, 229, 0.3)',
        'glow-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(110deg, #4F46E5 0%, #7C3AED 55%, #4338CA 100%)',
        'purple-card-gradient': 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(79, 70, 229, 0.08) 100%)',
        'cyan-card-gradient': 'linear-gradient(135deg, rgba(34, 211, 238, 0.12) 0%, rgba(37, 99, 235, 0.06) 100%)',
        'indigo-purple-card': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        'ambient-glow': 'radial-gradient(ellipse at 80% 20%, rgba(79, 70, 229, 0.20), transparent 55%)',
        'blue-glow': 'radial-gradient(ellipse at 90% 0%, rgba(37, 99, 235, 0.18), transparent 50%)',
        'grid-pattern': 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
