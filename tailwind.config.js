/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        accent: '#903c38',
        background: '#ffffff',
        muted: '#f9f2f1',
        text: '#2f2a28',
      },
      fontFamily: {
        heading: ['"Happy Monkey"', '"Comic Sans MS"', '"Comic Neue"', 'cursive'],
        body: ['"Quicksand"', '"Trebuchet MS"', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(144, 60, 56, 0.12)',
      },
    },
  },
  plugins: [],
};
