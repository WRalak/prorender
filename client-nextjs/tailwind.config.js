/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#3b82f6",
          container: "#dbeafe",
          fixed: "#1d4ed8",
          variant: "#f3f4f6",
        },
        secondary: {
          DEFAULT: "#6b7280",
          container: "#f3f4f6",
          fixed: "#4b5563",
          variant: "#e5e7eb",
        },
        surface: {
          DEFAULT: "#ffffff",
          container: "#f8fafc",
          containerLow: "#f1f5f9",
          variant: "#f9fafb",
          containerHigh: "#ffffff",
          containerLowest: "#0f172a",
        },
        outline: {
          DEFAULT: "#94a3b8",
          variant: "#64748b",
        },
        onSurface: {
          DEFAULT: "#1e293b",
          variant: "#475569",
        },
        onPrimary: "#ffffff",
        onSecondary: "#ffffff",
        onSecondaryFixed: "#ffffff",
        onSecondaryFixedVariant: "#ffffff",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'label': ['Inter', 'system-ui', 'sans-serif'],
        'headline': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '3rem' }],
        'headline-lg': ['1.875rem', { lineHeight: '2.25rem' }],
        'headline-md': ['1.5rem', { lineHeight: '2rem' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'body-md': ['1rem', { lineHeight: '1.5rem' }],
        'label-bold': ['0.875rem', { lineHeight: '1.25rem' }],
        'caption': ['0.75rem', { lineHeight: '1rem' }],
      },
      spacing: {
        'xxl': '5rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
