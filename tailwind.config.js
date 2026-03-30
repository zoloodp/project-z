/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        card: '#111827',
        border: '#1f2937',
        neon: '#22c55e',
        cyan: '#38bdf8'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,197,94,0.15), 0 0 30px rgba(56,189,248,0.18)',
        card: '0 12px 40px rgba(2,6,23,0.45)'
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)'
      }
    }
  },
  plugins: []
}
