module.exports = {
  content: ['./packages/renderer/index.html', './packages/renderer/src/**/*.{vue,js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        'my-custom-purple': '#5452C1',
        'my-custom-gray': '#404040',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
