/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        regalBlue: "#004675", //Onboarding Screen Background
        darkBlue:"#285260", //Primary Header Colour
        seaGreen:"#548C92", //Secondary Text Colour 
        lightGreen: "#B4D7D8", //Button Colour
        lightPeach: "#E0D7CF", //Secondary Button Colour
        beige : "#AB9072" //Accent Colour
      },
      fontFamily: {
        poppins: "Poppins-Regular",
        glasing: "Glasing-Regular",
      },
    },
  },
  plugins: [],
}


