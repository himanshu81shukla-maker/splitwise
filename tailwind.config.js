/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#241442',
        cloud: '#F8F6FF',
        zest: '#FF6B35',
        lime: '#C4F135',
        coral: '#FF4D6D',
        teal: '#0E7C7B',
        'ink-light': '#3D2A66',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        ticket: '18px',
      },
    },
  },
  plugins: [],
}
