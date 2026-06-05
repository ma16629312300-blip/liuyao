/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        antique: {
          50: '#fdf8f0',
          100: '#f9eddb',
          200: '#f2d7b0',
          300: '#e8bc7a',
          400: '#dd9d4a',
          500: '#c17a2e',
          600: '#a05f25',
          700: '#7f4621',
          800: '#693a23',
          900: '#58311f',
          950: '#32180e',
        },
        jade: {
          50: '#f0faf5',
          100: '#d6f0e3',
          200: '#afe1ca',
          300: '#7bcbab',
          400: '#48ad89',
          500: '#2a916f',
          600: '#1c7458',
          700: '#175d49',
          800: '#154a3c',
          900: '#133d33',
          950: '#0a221e',
        },
        gold: {
          50: '#fdfaed',
          100: '#f9f1cb',
          200: '#f3e193',
          300: '#edcc5a',
          400: '#e8b931',
          500: '#d99c1c',
          600: '#b87915',
          700: '#935715',
          800: '#7a4418',
          900: '#68391a',
          950: '#3c1d0a',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'SimSun', 'STSong', 'serif'],
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
