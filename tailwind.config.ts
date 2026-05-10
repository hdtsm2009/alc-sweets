import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1F4E78",
        gold: "#D4A017",
      },
    },
  },
  plugins: [],
} satisfies Config;
