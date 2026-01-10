import { heroui } from '@heroui/react'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [heroui({
    addCommonColors: true,
    themes: {
      'youtrack-calm': {
        light: {
          colors: {
            background: '#f5f6f8', // Very light cool gray (NOT pure white)
            foreground: '#1a1d21', // Dark neutral text
            content1: '#ffffff', // Slightly warmer/softer than background
            content2: '#f8f9fa', // Secondary content surface
            content3: '#f1f3f5', // Tertiary content surface
            content4: '#e9ecef', // Quaternary content surface
            divider: 'rgba(0, 0, 0, 0.08)', // Subtle divider
            focus: '#2a5ba7', // Calm blue for focus
            overlay: 'rgba(0, 0, 0, 0.5)', // Overlay
            default: {
              50: '#f8f9fa',
              100: '#f1f3f5',
              200: '#e9ecef',
              300: '#dee2e6',
              400: '#ced4da',
              500: '#adb5bd',
              600: '#868e96',
              700: '#495057',
              800: '#343a40',
              900: '#212529',
              DEFAULT: '#495057',
              foreground: '#ffffff',
            },
            primary: {
              50: '#e8f0f9',
              100: '#c5d9f0',
              200: '#9ebee5',
              300: '#77a3da',
              400: '#598ed2',
              500: '#3b79ca', // Calm blue (not neon)
              600: '#356bb8',
              700: '#2a5ba7', // Main primary
              800: '#1f4b96',
              900: '#0d2f75',
              DEFAULT: '#2a5ba7',
              foreground: '#ffffff',
            },
            secondary: {
              50: '#f0f4f8',
              100: '#d9e2ec',
              200: '#bcccdc',
              300: '#9fb3c8',
              400: '#829ab1',
              500: '#627d98',
              600: '#486581',
              700: '#334e68',
              800: '#243b53',
              900: '#102a43',
              DEFAULT: '#486581',
              foreground: '#ffffff',
            },
            success: {
              50: '#f0fdf4',
              100: '#dcfce7',
              200: '#bbf7d0',
              300: '#86efac',
              400: '#4ade80',
              500: '#22c55e',
              600: '#16a34a',
              700: '#15803d',
              800: '#166534',
              900: '#14532d',
              DEFAULT: '#16a34a',
              foreground: '#ffffff',
            },
            warning: {
              50: '#fffbeb',
              100: '#fef3c7',
              200: '#fde68a',
              300: '#fcd34d',
              400: '#fbbf24',
              500: '#f59e0b',
              600: '#d97706',
              700: '#b45309',
              800: '#92400e',
              900: '#78350f',
              DEFAULT: '#f59e0b',
              foreground: '#ffffff',
            },
            danger: {
              50: '#fef2f2',
              100: '#fee2e2',
              200: '#fecaca',
              300: '#fca5a5',
              400: '#f87171',
              500: '#ef4444',
              600: '#dc2626',
              700: '#b91c1c',
              800: '#991b1b',
              900: '#7f1d1d',
              DEFAULT: '#dc2626',
              foreground: '#ffffff',
            },
          },
        },
        dark: {
          colors: {
            background: '#0B1220', // Deep bluish-gray (NOT pure black)
            foreground: '#E6EDF7', // Off-white text
            content1: '#101B2D', // Slightly lighter than background
            content2: '#13223A', // Secondary content surface (table headers, filter bars)
            content3: '#172844', // Hover surface
            content4: '#1a1d29', // Quaternary content surface
            divider: '#22314A', // Subtle divider/border
            focus: '#4B8DFF', // Calm blue for focus
            overlay: 'rgba(0, 0, 0, 0.7)', // Overlay
            // Muted text colors
            muted: '#A8B3C7', // Secondary text
            mutedForeground: '#7F8BA3', // Tertiary text
            default: {
              50: '#0B1220',
              100: '#101B2D',
              200: '#13223A',
              300: '#172844',
              400: '#1a1d29',
              500: '#22314A',
              600: '#2b3441',
              700: '#343d4a',
              800: '#3d4653',
              900: '#4a5568',
              DEFAULT: '#22314A',
              foreground: '#E6EDF7',
            },
            primary: {
              50: '#0d2f75',
              100: '#1f4b96',
              200: '#2a5ba7',
              300: '#3D7EF0', // Hover
              400: '#4B8DFF', // Main primary
              500: '#5a9de6',
              600: '#6badf0',
              700: '#7cbdfa',
              800: '#8dcdf4',
              900: '#9dd5ff',
              DEFAULT: '#4B8DFF',
              foreground: '#ffffff',
            },
            secondary: {
              50: '#102a43',
              100: '#243b53',
              200: '#334e68',
              300: '#486581',
              400: '#627d98',
              500: '#829ab1',
              600: '#9fb3c8',
              700: '#bcccdc',
              800: '#d9e2ec',
              900: '#f0f4f8',
              DEFAULT: '#486581',
              foreground: '#ffffff',
            },
            success: {
              50: '#14532d',
              100: '#166534',
              200: '#15803d',
              300: '#16a34a',
              400: '#22c55e',
              500: '#4ade80',
              600: '#86efac',
              700: '#bbf7d0',
              800: '#dcfce7',
              900: '#f0fdf4',
              DEFAULT: '#16a34a',
              foreground: '#ffffff',
            },
            warning: {
              50: '#78350f',
              100: '#92400e',
              200: '#b45309',
              300: '#d97706',
              400: '#f59e0b',
              500: '#fbbf24',
              600: '#fcd34d',
              700: '#fde68a',
              800: '#fef3c7',
              900: '#fffbeb',
              DEFAULT: '#f59e0b',
              foreground: '#ffffff',
            },
            danger: {
              50: '#7f1d1d',
              100: '#991b1b',
              200: '#b91c1c',
              300: '#dc2626',
              400: '#ef4444',
              500: '#f87171',
              600: '#fca5a5',
              700: '#fecaca',
              800: '#fee2e2',
              900: '#fef2f2',
              DEFAULT: '#dc2626',
              foreground: '#ffffff',
            },
          },
        },
      },
    },
    defaultTheme: 'youtrack-calm',
  })],
}

