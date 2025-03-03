/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base theme colors (unchanged)
        primary: {
          DEFAULT: "#0C2A2A",
          dark: "#071630",
        },
        secondary: "#7F7F6D",
        accent: {
          DEFAULT: "#11734f",
          hover: "#1a8960"
        },
        
        // UI Theme (unchanged)
        background: {
          DEFAULT: "#222222",
          darker: "#1a1a1a",
        },
        surface: {
          DEFAULT: "#333333",
          hover: "#4d4d4d",
          border: "#333333",
        },
        text: {
          DEFAULT: "#cccccc",
          muted: "#666666",
          accent: "#11734f",
        },

        // Code/Syntax Highlighting
        code: {
          background: '#1E1E1E',  // was #1E1E1E
          border: '#6B9955',      // was #6B9955
          text: '#D4D4D4',        // was #D4D4D4
          pink: '#C586C0',        // was #C586C0
          blue: '#9CDCFE',        // was #9CDCFE
          orange: '#CE9178',      // was #CE9178
          teal: '#4EC9B0',        // was #4EC9B0
          // This is useful for hover states or "green" text
          green: '#6B9955',
        },
      },
      fontSize: {
        'min-xs': 'clamp(10px, 0.75rem, 12px)',
        'min-sm': 'clamp(12px, 0.875rem, 14px)',
        'min-base': 'clamp(14px, 1rem, 16px)',
        'min-lg': 'clamp(16px, 1.125rem, 18px)',
        'min-xl': 'clamp(18px, 1.25rem, 20px)',
        'min-2xl': 'clamp(20px, 1.5rem, 24px)',
        'min-3xl': 'clamp(24px, 1.875rem, 30px)',
      },
      animation: {
        'globe-spin': 'globe-spin 3.2s linear infinite',
        'expand': 'expand 0.3s ease-out',
        'collapse': 'collapse 0.3s ease-in',
        'shake': 'shake 0.3s ease-in-out',
        'fade-in': 'fade-in 0.5s ease-in-out forwards',
        'slide-up': 'slide-up 0.8s ease-out forwards',
        'type-cursor': 'type-cursor 1s infinite',
      },
      keyframes: {
        'globe-spin': {
          '0%': { transform: 'rotateY(0deg) rotateX(-23.5deg)' },
          '100%': { transform: 'rotateY(360deg) rotateX(-23.5deg)' },
        },
        'expand': {
          '0%': { maxHeight: '0', opacity: '0' },
          '100%': { maxHeight: '24rem', opacity: '1' },
        },
        'collapse': {
          '0%': { maxHeight: '24rem', opacity: '1' },
          '100%': { maxHeight: '0', opacity: '0' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-5px)' },
          '40%, 80%': { transform: 'translateX(5px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'type-cursor': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        }
      },
      spacing: {
        'header': '4rem',
        'sidebar': '20rem',
        'catalog': '350px',
      },
      minWidth: {
        'sidebar-sm': '200px',
        'sidebar-md': '240px',
        'catalog': '300px',
      },
      maxHeight: {
        'dynamic-content': 'calc(100vh - 8rem)',
      },
    },
  },
  plugins: [],
};