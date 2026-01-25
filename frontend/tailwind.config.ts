import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors (from UI/UX design)
        primary: {
          gold: '#FF9C00',
          blue: '#99CCFF',
          purple: '#CC99CC',
        },

        // Background Colors
        bg: {
          primary: '#000000',
          surface: 'rgba(20, 20, 25, 0.9)',
          card: 'rgba(30, 30, 35, 0.8)',
          modal: 'rgba(0, 0, 0, 0.95)',
        },

        // Text Colors
        text: {
          primary: '#99CCFF',
          secondary: '#FFFFFF',
          muted: 'rgba(153, 204, 255, 0.7)',
        },

        // Functional Colors
        success: '#00CC66',
        warning: '#FF9C00',
        error: '#CC3333',
        info: '#99CCFF',

        // Borders & Accents
        border: {
          gold: '#FF9C00',
          blue: '#99CCFF',
          subtle: 'rgba(153, 204, 255, 0.2)',
        }
      },

      fontFamily: {
        'primary': ['Rajdhani', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'display': ['Antonio', 'Rajdhani', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['JetBrains Mono', 'SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },

      fontWeight: {
        'normal': '400',
        'medium': '500',
        'bold': '700',
        'black': '900',
      },

      letterSpacing: {
        'tight': '-0.025em',
        'normal': '0',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.125em', // 2px equivalent for buttons
      },

      spacing: {
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px - Primary spacing unit
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
      },

      borderRadius: {
        'sm': '0.125rem',   // 2px
        'DEFAULT': '0.25rem', // 4px - Primary border radius
        'md': '0.375rem',   // 6px
        'lg': '0.5rem',     // 8px
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
      },

      boxShadow: {
        'glow-gold': '0 0 20px rgba(255, 156, 0, 0.3)',
        'glow-blue': '0 0 20px rgba(153, 204, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(204, 153, 204, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(255, 156, 0, 0.1)',
        'depth': '0 4px 20px rgba(0, 0, 0, 0.5)',
      },

      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in',
      },

      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 156, 0, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 156, 0, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },

      backdropBlur: {
        'xs': '2px',
      },

      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [],
}

export default config