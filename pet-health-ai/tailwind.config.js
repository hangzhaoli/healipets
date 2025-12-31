/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          50: '#E5F0FF',
          100: '#E5F0FF',
          500: '#0066FF',
          600: '#0052CC',
          900: '#003366',
          DEFAULT: '#0066FF',
          foreground: '#FFFFFF',
        },
        secondary: {
          50: '#F0FDF9',
          400: '#00CC99',
          500: '#10B981',
          DEFAULT: '#00CC99',
          foreground: '#FFFFFF',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          500: '#6B7280',
          800: '#1F2937',
          900: '#111827',
        },
        accent: {
          DEFAULT: '#F5A623',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: '#00CC99',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#0066FF',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: '16px',
        xl: '24px',
        md: '8px',
        sm: '4px',
        full: '9999px',
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Inter'", 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        glow: '0 20px 40px -10px rgba(0, 102, 255, 0.3)',
        'glow-teal': '0 20px 40px -10px rgba(0, 204, 153, 0.3)',
      },
      backdropBlur: {
        glass: '16px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'score-fill': {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--score-offset)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        pulse: 'pulse 2s ease-in-out infinite',
        'scan-line': 'scan-line 2s linear infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'score-fill': 'score-fill 1.5s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
