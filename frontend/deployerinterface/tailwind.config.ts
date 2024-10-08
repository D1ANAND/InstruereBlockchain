import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/preline/preline.js", // Ensure Preline path is correct
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)", // Ensure these variables are defined
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    require('preline/plugin'), // Ensure Preline plugin is added
  ],
};

export default config;
