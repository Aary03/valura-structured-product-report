/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Valura Brand Colors
        valura: {
          ink: 'var(--valura-ink)',
          mint: 'var(--valura-mint)',
          mint600: 'var(--valura-mint-600)',
          mint100: 'var(--valura-mint-100)',
          sky100: 'var(--valura-sky-100)',
          link: 'var(--valura-link)',
        },
        // Surface & Neutrals
        surface: {
          DEFAULT: 'var(--surface)',
          '2': 'var(--surface-2)',
        },
        border: 'var(--border)',
        muted: 'var(--muted)',
        // Status Colors
        success: {
          bg: 'var(--success-bg)',
          fg: 'var(--success-fg)',
          DEFAULT: 'var(--success-fg)',
          light: 'var(--success-bg)',
        },
        warning: {
          bg: 'var(--warning-bg)',
          fg: 'var(--warning-fg)',
          DEFAULT: 'var(--warning-fg)',
          light: 'var(--warning-bg)',
        },
        danger: {
          bg: 'var(--danger-bg)',
          fg: 'var(--danger-fg)',
          DEFAULT: 'var(--danger-fg)',
          light: 'var(--danger-bg)',
        },
        // Chart Colors
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          barrier: 'var(--chart-barrier)',
          strike: 'var(--chart-strike)',
          current: 'var(--chart-current)',
        },
        // Text Colors
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
        },
        // Legacy aliases (for backward compatibility during migration)
        bg: 'var(--bg)',
        card: 'var(--bg-card)',
        glass: 'var(--bg-glass)',
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
        },
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        medium: 'var(--shadow-medium)',
        strong: 'var(--shadow-strong)',
        card: 'var(--shadow-card)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      backgroundImage: {
        'valura-grad': 'var(--bg-grad)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
