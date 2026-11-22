/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        forest: "#153f35",
        leaf: "#34745b",
        lime: "#d7ed78",
        canvas: "#f5f7f2",
      },
    },
  },
  plugins: [],
};
