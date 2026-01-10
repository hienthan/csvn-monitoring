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
      light: {
        colors: {
          primary: {
            DEFAULT: '#2a5ba7', // Calm enterprise blue
            foreground: '#ffffff',
          },
          background: '#f8f9fa',
          content1: '#ffffff',
          content2: '#f1f3f5',
          divider: 'rgba(0, 0, 0, 0.08)',
        }
      },
      dark: {
        colors: {
          primary: {
            DEFAULT: '#3d85c6',
            foreground: '#ffffff',
          },
          background: '#1a1d21', // Desaturated dark gray-blue
          content1: '#232b33', // Sidebar/Card background
          content2: '#2b343d',
          divider: 'rgba(255, 255, 255, 0.1)',
          foreground: '#d1d5db', // Soft light gray
        }
      }
    }
  })],
}

