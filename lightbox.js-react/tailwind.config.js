module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class',
  prefix: 'lboxjs-',
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    {...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})}
  ],

  corePlugins: {    preflight: false,  }
}
