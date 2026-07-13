module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          yellow: '#FFE58F',
          'yellow-dark': '#F5C800',
          red: '#F06277',
          'red-dark': '#E84260',
        },
        surface: {
          primary: '#FAFAFA',
          secondary: '#F5F5F5',
          card: '#FFFFFF',
          border: '#E5E7EB',
        },
        content: {
          primary: '#111827',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
        lg: '16px',
        xl: '20px',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-left': { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.97)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer: { from: { backgroundPosition: '-200px 0' }, to: { backgroundPosition: 'calc(200px + 100%) 0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-left': 'slide-in-left 0.2s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
