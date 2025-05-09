// File: tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js}'
  ],
  theme: {
    extend: {
      colors: {
        // map to CSS variables you can define in index.html or a global CSS file
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
