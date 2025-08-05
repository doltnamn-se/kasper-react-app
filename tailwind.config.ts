
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        domaine: ['DomaineDispNrw-Regular', 'serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          to: { height: '0', opacity: '0' }
        },
        'progress-line': {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        },
        'fadeInUp': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        'icon-fill': {
          '0%': { 
            'clip-path': 'inset(0 100% 0 0)',
            opacity: '0'
          },
          '50%': {
            'clip-path': 'inset(0 0 0 0)',
            opacity: '1'
          },
          '100%': {
            'clip-path': 'inset(0 0 0 100%)',
            opacity: '0'
          }
        },
        'draw-check': {
          '0%': {
            'stroke-dashoffset': '24'
          },
          '100%': {
            'stroke-dashoffset': '0'
          }
        },
        'toast-slide-in': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-16px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'toast-slide-out': {
          '0%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
          '100%': { 
            opacity: '0',
            transform: 'translateY(-16px)'
          }
        },
        'kasper-pulse': {
          '0%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 0deg, transparent 0deg)' },
          '1%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 2.4deg, transparent 2.4deg)' },
          '2%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 4.8deg, transparent 4.8deg)' },
          '3%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 7.2deg, transparent 7.2deg)' },
          '4%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 9.6deg, transparent 9.6deg)' },
          '5%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 12deg, transparent 12deg)' },
          '6%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 14.4deg, transparent 14.4deg)' },
          '7%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 16.8deg, transparent 16.8deg)' },
          '8%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 19.2deg, transparent 19.2deg)' },
          '9%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 21.6deg, transparent 21.6deg)' },
          '10%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 24deg, transparent 24deg)' },
          '11%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 26.4deg, transparent 26.4deg)' },
          '12%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 28.8deg, transparent 28.8deg)' },
          '12.5%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 30deg, transparent 30deg)' },
          '13%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 28.8deg, transparent 28.8deg)' },
          '14%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 26.4deg, transparent 26.4deg)' },
          '15%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 24deg, transparent 24deg)' },
          '16%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 21.6deg, transparent 21.6deg)' },
          '17%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 19.2deg, transparent 19.2deg)' },
          '18%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 16.8deg, transparent 16.8deg)' },
          '19%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 14.4deg, transparent 14.4deg)' },
          '20%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 12deg, transparent 12deg)' },
          '21%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 9.6deg, transparent 9.6deg)' },
          '22%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 7.2deg, transparent 7.2deg)' },
          '23%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 4.8deg, transparent 4.8deg)' },
          '24%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 2.4deg, transparent 2.4deg)' },
          '25%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 0deg, transparent 0deg)' },
          '100%': { background: 'conic-gradient(from 0deg, rgba(255, 255, 255, 0.3) 0deg, rgba(255, 255, 255, 0.3) 0deg, transparent 0deg)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        'accordion-up': 'accordion-up 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        'progress-line': 'progress-line 5s linear forwards',
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'icon-fill': 'icon-fill 2s linear infinite',
        'draw-check': 'draw-check 0.3s ease-in-out forwards',
        'toast-slide-in': 'toast-slide-in 400ms ease-out forwards',
        'toast-slide-out': 'toast-slide-out 300ms ease-out forwards',
        'kasper-pulse': 'kasper-pulse 4s ease-in-out infinite'
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'rgb(234, 56, 76)',
          foreground: 'hsl(var(--primary-foreground))',
          gradient: 'linear-gradient(90deg, rgb(234, 56, 76) 0%, rgb(249, 115, 22) 25%, rgb(254, 247, 205) 50%, rgb(14, 165, 233) 75%, rgb(16, 185, 129) 100%)'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        gray: {
          400: '#616166'
        },
        badge: {
          subscription: {
            text: '#001400',
            bg: {
              DEFAULT: '#d6f37d',
              dark: '#c8ed52 !important'
            }
          }
        },
        role: {
          superadmin: {
            text: '#dc7b18',
            'text-dark': '#db8e00',
            bg: '#ffb2241a',
            'bg-dark': '#db8e001a',
            border: '#f3ba63',
            'border-dark': '#693f05'
          },
          customer: {
            text: '#097c4f',
            'text-dark': '#85e0ba',
            bg: '#3fcf8e1a',
            'bg-dark': '#3ecf8e1a',
            border: '#16b674',
            'border-dark': '#006239'
          }
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      height: {
        10: '3rem',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
