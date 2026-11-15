/* Portfolio Tao ROLA : configuration Tailwind.
   Reconstruire la feuille de style après modification des pages :
   npx tailwindcss@3 -c portfolio-src/tailwind.config.js -i portfolio-src/input.css -o portfolio/assets/app.css --minify */
module.exports = {
  content: ['./portfolio/**/*.html', './portfolio/assets/**/*.js'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'] },
      keyframes: {
        zoom: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.1)' } },
        float: { '0%,100%': { transform: 'scale(1)', opacity: '.6' }, '50%': { transform: 'scale(1.15)', opacity: '.75' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'none' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        sheet: { from: { transform: 'translateY(40px)', opacity: '0' }, to: { transform: 'none', opacity: '1' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        zoom: 'zoom 20s ease-in-out infinite',
        float: 'float 8s ease-in-out infinite',
        'fade-up': 'fadeUp .8s ease-out both',
        'fade-in': 'fadeIn .4s ease-out both',
        sheet: 'sheet .35s cubic-bezier(.2,.8,.2,1) both',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
