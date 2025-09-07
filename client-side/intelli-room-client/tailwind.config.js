/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#8C3B1E",
        secondary: "#548E32",
        beigeclr: "#DBAF8E",
        backgroundclr: "#FEF7E5",
        greyclr: "#9AA394",
      },
      fontFamily: {
        "cinzel-regular": ["Cinzel-Regular"],
        "cinzel-bold": ["Cinzel-Bold"],
        "cinzel-semi-bold": ["Cinzel-SemiBold"],
      },
    },
  },
  plugins: [],
};
