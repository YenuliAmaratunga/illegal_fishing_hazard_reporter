/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        blue: "#3C467B", //important text
        blueLight: "#50589C", //tab chosen button colour
        darkPurple: "#636CCB", //accent colour
        lightPurple: "#6E8CFB" //button bg colour

      },
      fontFamily: {
        poppins: "Poppins-Regular",
        glasing: "Glasing-Regular",
      },
    },
  },
  plugins: [],
}


