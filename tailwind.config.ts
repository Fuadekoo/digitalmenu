import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [
    heroui({
      layout: {},
      themes: {
        light: {
          extend: "light",
          colors: {
            background: "#FFFFFF",
            foreground: "#000000",
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#504B38",
              50: "#F6F4E7",
              100: "#F6F4E7",
              200: "#EDE9D1",
              300: "#CAC4A6",
              400: "#968F74",
              500: "#504B38",
              600: "#443E28",
              700: "#39321C",
              800: "#2E2611",
              900: "#261E0A",
            },
          },
        },
        dark: {
          extend: "dark",
          colors: {
            background: "#000000",
            foreground: "#FFFFFF",
            primary: {
              DEFAULT: "#504B38",
              foreground: "#000000",
              50: "#F6F4E7",
              100: "#261E0A",
              200: "#2E2611",
              300: "#39321C",
              400: "#443E28",
              500: "#504B38",
              600: "#968F74",
              700: "#CAC4A6",
              800: "#EDE9D1",
              900: "#F6F4E7",
            },
          },
        },
      },
    }),
  ],
} satisfies Config;
