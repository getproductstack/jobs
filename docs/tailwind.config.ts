import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

export default {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx,mdx}"],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        gray: colors.zinc,
        primary: colors.indigo,
      },
    },
  },
  plugins: [typography],
} satisfies Config;
