/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'var(--app-bg)',
          surface: 'var(--app-surface)',
          border: 'var(--app-border)',
          text: 'var(--app-text)',
          'text-strong': 'var(--app-text-strong)',
          muted: 'var(--app-text-muted)',
          soft: 'var(--app-text-soft)',
          accent: 'var(--app-accent)',
          'accent-strong': 'var(--app-accent-strong)',
          success: 'var(--app-success-text)',
          danger: 'var(--app-danger-text)',
        },
      },
      backgroundImage: {
        'app-shell': 'var(--app-shell-bg)',
        'app-frame': 'var(--app-frame-bg)',
        'app-panel': 'var(--app-panel-bg)',
        'app-hero': 'var(--app-hero-bg)',
        'app-progress': 'var(--app-progress-fill)',
      },
      borderRadius: {
        'app-lg': 'var(--app-radius-lg)',
        'app-xl': 'var(--app-radius-xl)',
        'app-2xl': 'var(--app-radius-2xl)',
      },
      boxShadow: {
        'app-frame': 'var(--app-shadow-soft)',
        'app-card': 'var(--app-shadow-card)',
        'app-hero': 'var(--app-hero-shadow)',
      },
    },
  },
  plugins: [],
}
