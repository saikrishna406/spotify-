import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          black: "#000000",
          base: "#121212",
          card: "#181818",
          "card-hover": "#282828",
          elevated: "#242424",
          subtle: "#1f1f1f",
          green: "#1ed760",
          "green-hover": "#1fdf64",
          "green-active": "#169c46",
          subdued: "#b3b3b3",
          muted: "#727272"
        }
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
