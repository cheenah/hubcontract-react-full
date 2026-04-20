/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // ── shadcn/ui base (не трогать) ──────────────────────────────────────
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // HubContract tokens
        none:   'var(--radius-none)',
        xs:     'var(--radius-xs)',
        xl:     'var(--radius-xl)',
        '2xl':  'var(--radius-2xl)',
        '3xl':  'var(--radius-3xl)',
        '4xl':  'var(--radius-4xl)',
        pill:   'var(--radius-pill)',
        circle: 'var(--radius-circle)',
      },
      colors: {
        // shadcn/ui base
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },

        // ── HubContract design tokens ──────────────────────────────────────
        brand: {
          DEFAULT: 'var(--color-primary)',
          dark:    'var(--color-primary-dark)',
          darker:  'var(--color-primary-darker)',
          light:   'var(--color-primary-light)',
          bg:      'var(--color-primary-bg)',
          border:  'var(--color-primary-border)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          dark:    'var(--color-success-dark)',
          light:   'var(--color-success-light)',
          alt:     'var(--color-success-alt)',
          bg:      'var(--color-success-bg)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          alt:     'var(--color-danger-alt)',
          dark:    'var(--color-danger-dark)',
          bg:      'var(--color-danger-bg)',
        },
        warn: {
          DEFAULT: 'var(--color-warning)',
          alt:     'var(--color-warning-alt)',
          bg:      'var(--color-warning-bg)',
        },
        surface: {
          DEFAULT:   'var(--color-bg-surface)',
          page:      'var(--color-bg-page)',
          warm:      'var(--color-bg-warm)',
          muted:     'var(--color-bg-muted)',
          subtle:    'var(--color-bg-subtle)',
        },
        ink: {
          DEFAULT:     'var(--color-text-primary)',
          secondary:   'var(--color-text-secondary)',
          tertiary:    'var(--color-text-tertiary)',
          muted:       'var(--color-text-muted)',
          placeholder: 'var(--color-text-placeholder)',
          inverse:     'var(--color-text-inverse)',
          link:        'var(--color-text-link)',
        },
        line: {
          DEFAULT: 'var(--color-border)',
          light:   'var(--color-border-light)',
          medium:  'var(--color-border-medium)',
          dark:    'var(--color-border-dark)',
        },
      },

      // ── Spacing ────────────────────────────────────────────────────────────
      spacing: {
        '0':    'var(--space-0)',
        '0.5':  'var(--space-05)',
        '1':    'var(--space-1)',
        '1.5':  'var(--space-1-5)',
        '2':    'var(--space-2)',
        '2.5':  'var(--space-2-5)',
        '3':    'var(--space-3)',
        '3.5':  'var(--space-3-5)',
        '4':    'var(--space-4)',
        '4.5':  'var(--space-4-5)',
        '5':    'var(--space-5)',
        '6':    'var(--space-6)',
        '7':    'var(--space-7)',
        '7.5':  'var(--space-7-5)',
        '8':    'var(--space-8)',
        '9':    'var(--space-9)',
        '10':   'var(--space-10)',
        '12':   'var(--space-12)',
        '14':   'var(--space-14)',
        '15':   'var(--space-15)',
        '16':   'var(--space-16)',
        '20':   'var(--space-20)',
        '25':   'var(--space-25)',
        '30':   'var(--space-30)',
      },

      // ── Font Size ──────────────────────────────────────────────────────────
      fontSize: {
        '2xs':  ['var(--font-size-2xs)',  { lineHeight: 'var(--line-height-tight)' }],
        'xs':   ['var(--font-size-xs)',   { lineHeight: 'var(--line-height-normal)' }],
        'sm':   ['var(--font-size-base)', { lineHeight: 'var(--line-height-normal)' }],
        'base': ['var(--font-size-lg)',   { lineHeight: 'var(--line-height-normal)' }],
        'lg':   ['var(--font-size-xl)',   { lineHeight: 'var(--line-height-normal)' }],
        'xl':   ['var(--font-size-xl2)',  { lineHeight: 'var(--line-height-snug)' }],
        '2xl':  ['var(--font-size-3xl)',  { lineHeight: 'var(--line-height-snug)' }],
        '3xl':  ['var(--font-size-6xl)',  { lineHeight: 'var(--line-height-tight)' }],
        '4xl':  ['var(--font-size-7xl)',  { lineHeight: 'var(--line-height-tight)' }],
        '5xl':  ['var(--font-size-8xl)',  { lineHeight: 'var(--line-height-tight)' }],
        'fluid-sm':    ['var(--font-size-fluid-sm)',    { lineHeight: 'var(--line-height-normal)' }],
        'fluid-hero':  ['var(--font-size-fluid-hero)',  { lineHeight: 'var(--line-height-tight)' }],
        'fluid-title': ['var(--font-size-fluid-title)', { lineHeight: 'var(--line-height-tight)' }],
      },

      // ── Font Weight ────────────────────────────────────────────────────────
      fontWeight: {
        normal:    'var(--font-weight-normal)',
        medium:    'var(--font-weight-medium)',
        semibold:  'var(--font-weight-semibold)',
        bold:      'var(--font-weight-bold)',
        black:     'var(--font-weight-black)',
      },

      // ── Line Height ────────────────────────────────────────────────────────
      lineHeight: {
        tight:   'var(--line-height-tight)',
        snug:    'var(--line-height-snug)',
        normal:  'var(--line-height-normal)',
        relaxed: 'var(--line-height-relaxed)',
        loose:   'var(--line-height-loose)',
      },

      // ── Box Shadow ─────────────────────────────────────────────────────────
      boxShadow: {
        xs:                 'var(--shadow-xs)',
        sm:                 'var(--shadow-sm)',
        md:                 'var(--shadow-md)',
        lg:                 'var(--shadow-lg)',
        xl:                 'var(--shadow-xl)',
        card:               'var(--shadow-card)',
        'card-hover':       'var(--shadow-card-hover)',
        'card-hover-strong':'var(--shadow-card-hover-strong)',
        'blue-md':          'var(--shadow-blue-md)',
        'green-lg':         'var(--shadow-green-lg)',
        'green-xl':         'var(--shadow-green-xl)',
        focus:              'var(--shadow-focus)',
        'focus-ring':       'var(--shadow-focus-ring)',
      },

      // ── Z-Index ────────────────────────────────────────────────────────────
      zIndex: {
        base:      'var(--z-base)',
        dropdown:  'var(--z-dropdown)',
        overlay:   'var(--z-overlay)',
        sidebar:   'var(--z-sidebar)',
        header:    'var(--z-header)',
        recaptcha: 'var(--z-recaptcha)',
      },

      // ── Transition Duration ────────────────────────────────────────────────
      transitionDuration: {
        fast:    '150ms',
        normal:  '200ms',
        slow:    '300ms',
        slower:  '400ms',
      },

      // ── Transition Timing ──────────────────────────────────────────────────
      transitionTimingFunction: {
        ease: 'var(--transition-ease)',
      },

      // ── Layout / Fixed Sizes ───────────────────────────────────────────────
      height: {
        header:     'var(--header-height)',
        subnav:     'var(--subnav-height)',
      },
      width: {
        sidebar:    'var(--sidebar-width)',
      },
      maxWidth: {
        container:  'var(--container-max)',
        tender:     'var(--container-tender)',
        hero:       'var(--container-hero)',
        section:    'var(--container-section)',
        dialog:     'var(--dialog-max)',
        'auth-dialog': 'var(--auth-dialog-max)',
      },

      // ── Keyframes (shadcn + project) ───────────────────────────────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        flow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'spin-slow':      'spin 1s ease-in-out infinite',
        'pulse-slow':     'pulse 2s infinite',
        'flow':           'flow 3s infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};