/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0d9488', // teal-600
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // teal-500
          600: '#0d9488', // teal-600 - DEFAULT
          700: '#0f766e', // teal-700
          800: '#115e59', // teal-800
          900: '#134e4a', // teal-900
          950: '#042f2e', // teal-950
        },
      },
    },
  },
  plugins: [],
}