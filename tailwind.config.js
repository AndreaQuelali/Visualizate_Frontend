/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          fixed: 'var(--primary-fixed)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        surface: {
          'container-lowest': 'var(--surface-container-lowest)',
          'container-low': 'var(--surface-container-low)',
          container: 'var(--surface-container)',
          variant: 'var(--surface-variant)',
        },
        'outline-variant': 'var(--outline-variant)',
        'on-primary-fixed-variant': 'var(--on-primary-fixed-variant)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      maxWidth: {
        'container-max': '1280px',
      },
      spacing: {
        gutter: '24px',
        'section-gap': '80px',
        'section-gap-lg': '120px',
      },
      fontSize: {
        'display-hero': [
          '72px',
          { lineHeight: '80px', letterSpacing: '-0.04em', fontWeight: '700' },
        ],
        'display-hero-mobile': [
          '40px',
          { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        'headline-xl': [
          '40px',
          { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        'headline-lg': [
          '32px',
          { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '600' },
        ],
        'headline-md': [
          '24px',
          { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' },
        ],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md': [
          '14px',
          { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' },
        ],
        'label-sm': [
          '12px',
          { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' },
        ],
      },
    },
  },
  plugins: [],
};
