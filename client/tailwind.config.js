/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0B1F3A",
        accent: "#00BFA6",
        success: "#10b981",
        danger: "#ef4444",
        bgLight: "#F3F4F6",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
      borderRadius: {
        'xl': '12px',
      }
    },
  },
  plugins: [],
}
