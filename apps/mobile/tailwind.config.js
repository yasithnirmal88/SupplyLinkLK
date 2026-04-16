/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          green: '#2D6A4F',
        },
        accent: {
          gold: '#F4A261',
        },
        background: '#F9F7F2',
        surface: '#FFFFFF',
        text: {
          primary: '#1A1A2E',
          muted: '#6B7280',
        },
        error: '#EF4444',
        success: '#10B981',
      }
    },
  },
  plugins: [],
}
