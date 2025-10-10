/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        blue: "#3C467B", 
        blueLight: "#50589C", 
        darkBlue: "#000435",
        darkPurple: "#636CCB",
        purple: "#6E8CFB",
        lightPurple: "#D8D8FF",
        accentPurple : "#BABCFF",
        primaryText :"#E8EAFF",
        secondaryText : "#B7B9E0",
        accentText : "#6E8CFB"
      },
      fontFamily: {
        poppins: "Poppins-Regular",
        glasing: "Glasing-Regular",
      },
    },
  },
  plugins: [],
}


