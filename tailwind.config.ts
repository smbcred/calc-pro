import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': ['clamp(0.75rem, 0.725rem + 0.125vw, 0.8125rem)', { lineHeight: '1.5' }],
        'sm': ['clamp(0.875rem, 0.825rem + 0.25vw, 0.9375rem)', { lineHeight: '1.5' }],
        'base': ['clamp(1rem, 0.95rem + 0.25vw, 1.0625rem)', { lineHeight: '1.625' }],
        'lg': ['clamp(1.125rem, 1rem + 0.625vw, 1.25rem)', { lineHeight: '1.625' }],
        'xl': ['clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)', { lineHeight: '1.25' }],
        '2xl': ['clamp(1.5rem, 1.25rem + 1.25vw, 2rem)', { lineHeight: '1.25' }],
        '3xl': ['clamp(1.75rem, 1.5rem + 1.25vw, 2.5rem)', { lineHeight: '1.25' }],
        '4xl': ['clamp(2rem, 1.75rem + 1.25vw, 3rem)', { lineHeight: '1.25' }],
        '5xl': ['clamp(2.5rem, 2rem + 2.5vw, 4rem)', { lineHeight: '1.1' }],
        'impact': ['clamp(2.5rem, 2rem + 2.5vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
      },
      fontWeight: {
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
        'black': '900',
      },
      letterSpacing: {
        'tightest': '-0.03em',
        'tighter': '-0.02em',
        'tight': '-0.015em',
        'snug': '-0.01em',
        'normal': '0',
        'wide': '0.01em',
        'wider': '0.02em',
        'widest': '0.03em',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
          blue: "var(--chart-blue)",
          purple: "var(--chart-purple)",
          teal: "var(--chart-teal)",
          orange: "var(--chart-orange)",
          green: "var(--chart-green)",
        },
        neutral: {
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
        },
        blue: {
          primary: "var(--blue-primary)",
          light: "var(--blue-light)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin": "spin 1s linear infinite",
        "shimmer": "shimmer 1.5s infinite",
        "skeleton-shimmer": "skeleton-shimmer 1.5s infinite",
        "skeleton-wave": "skeletonWave 1.5s infinite",
        "shake": "shake 0.4s ease-in-out",
        "error-shake": "errorShake 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53)",
        "recovery-bounce": "recoveryBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.5s forwards",
        "successPulse": "successPulse 0.6s ease-out",
        "completePulse": "completePulse 0.6s ease-out",
        "celebrate": "celebrate 0.8s ease-out",
        "success-confetti": "confetti 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "checkmark-draw": "checkmarkDraw 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "button-bounce": "buttonBounce 150ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "stagger-in": "staggerIn 500ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "progress-shine": "progressShine 2s infinite",
        "mesh-flow": "meshFlow 8s ease-in-out infinite",
        "gradient-shift": "gradientShift 3s ease-in-out infinite",
        "chart-reveal": "chartReveal 700ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "bar-grow": "barGrow 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
        "number-pulse": "numberPulse 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out infinite 2s",
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms', 
        'slow': '500ms',
        'deliberate': '700ms',
      },
      transitionTimingFunction: {
        'natural': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'sharp': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
      },
      spacing: {
        'xs': '4px',     // 0.25rem
        'sm': '8px',     // 0.5rem
        'md': '16px',    // 1rem
        'lg': '24px',    // 1.5rem
        'xl': '32px',    // 2rem
        '2xl': '48px',   // 3rem
        '3xl': '64px',   // 4rem
        '4xl': '80px',   // 5rem
        '5xl': '96px',   // 6rem
        '6xl': '120px',  // 7.5rem
      },
      maxWidth: {
        'container-full': '1280px',
        'container-content': '1200px',
        'container-medium': '960px',
        'container-narrow': '680px',
        'container-step': '800px',
        'reading': '65ch',
        'reading-wide': '75ch',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
