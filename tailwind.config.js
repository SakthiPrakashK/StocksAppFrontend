/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#0D1117',
          secondary: '#161B22',
          tertiary: '#21262D',
          border: '#30363D',
          text: '#C9D1D9',
          muted: '#8B949E',
        },
        accent: {
          primary: '#58A6FF',
          success: '#3FB950',
          warning: '#D29922',
          danger: '#F85149',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}


