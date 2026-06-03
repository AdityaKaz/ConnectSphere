import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        connectsphere: {
          primary: "#0F766E", // Teal
          secondary: "#FFFFFF",
          accent: "#14B8A6", // Light teal
          neutral: "#1F2937", // Dark gray
          "base-100": "#F8FAFC", // Very light gray
          info: "#64748B",
          success: "#16A34A",
          warning: "#F59E0B",
          error: "#DC2626",
        },
      },
    ],
  },
};
