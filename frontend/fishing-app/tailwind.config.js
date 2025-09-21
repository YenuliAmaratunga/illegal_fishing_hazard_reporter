/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ "./App.{js,jsx}",
    "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        regalBlue: "#004675",
        darkBlue:"#285260",
        seaGreen:"#548C92",
        lightGreen: "#B4D7D8",
        lightPeach: "#E0D7CF",
        beige : "#AB9072"
      }
    },
  },
  plugins: [],
}

