/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Vibrant
        primary: {
          blue: 'var(--primary-blue)',
          'blue-light': 'var(--primary-blue-light)',
          'blue-dark': 'var(--primary-blue-dark)',
          'blue-bg': 'var(--primary-blue-bg)',
          DEFAULT: 'var(--primary-blue)',
        },
        // Accent Colors
        accent: {
          teal: 'var(--accent-teal)',
          'teal-light': 'var(--accent-teal-light)',
          'teal-dark': 'var(--accent-teal-dark)',
          'teal-bg': 'var(--accent-teal-bg)',
          coral: 'var(--accent-coral)',
          'coral-light': 'var(--accent-coral-light)',
          'coral-dark': 'var(--accent-coral-dark)',
          'coral-bg': 'var(--accent-coral-bg)',
          purple: 'var(--accent-purple)',
          'purple-light': 'var(--accent-purple-light)',
          'purple-dark': 'var(--accent-purple-dark)',
          'purple-bg': 'var(--accent-purple-bg)',
        },
        // Legacy Valura aliases
        valura: {
          ink: 'var(--text-primary)',
          mint: 'var(--accent-teal)',
          mint600: 'var(--accent-teal-dark)',
          mint500: 'var(--accent-teal)',
          mint100: 'var(--accent-teal-bg)',
          sky100: 'var(--primary-blue-bg)',
          link: 'var(--primary-blue)',
        },
        // Surface & Neutrals
        surface: {
          DEFAULT: 'var(--surface)',
          '2': 'var(--surface-2)',
          '3': 'var(--surface-3)',
        },
        border: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          light: 'var(--muted-light)',
        },
        // Status Colors
        success: {
          bg: 'var(--success-bg)',
          fg: 'var(--success-fg)',
          border: 'var(--success-border)',
          DEFAULT: 'var(--success)',
          light: 'var(--success-bg)',
        },
        warning: {
          bg: 'var(--warning-bg)',
          fg: 'var(--warning-fg)',
          border: 'var(--warning-border)',
          DEFAULT: 'var(--warning)',
          light: 'var(--warning-bg)',
        },
        danger: {
          bg: 'var(--danger-bg)',
          fg: 'var(--danger-fg)',
          border: 'var(--danger-border)',
          DEFAULT: 'var(--danger)',
          light: 'var(--danger-bg)',
        },
        info: {
          bg: 'var(--info-bg)',
          fg: 'var(--info-fg)',
          border: 'var(--info-border)',
          DEFAULT: 'var(--info)',
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
        button: 'var(--shadow-button)',
        'button-hover': 'var(--shadow-button-hover)',
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
