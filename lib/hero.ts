import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      extend: "light",
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        primary: {
          foreground: "#FFFFFF",
          DEFAULT: "#5f87fb",
          50: "#f0f5ff",
          100: "#d9e4ff",
          200: "#bccdfd",
          300: "#9fb6fc",
          400: "#7f9efc",
          500: "#5f87fb",
          600: "#4c6de0",
          700: "#3a54c5",
          800: "#2a3b9a",
          900: "#1b226f",
        },
      },
    },
    dark: {
      extend: "dark",
      colors: {
        background: "#1a1a1a",
        foreground: "#f0f0f0",
        primary: {
          foreground: "#f0f5ff",
          DEFAULT: "#5f87fb",
          50: "#f0f5ff",
          100: "#d9e4ff",
          200: "#bccdfd",
          300: "#9fb6fc",
          400: "#7f9efc",
          500: "#5f87fb",
          600: "#4c6de0",
          700: "#3a54c5",
          800: "#2a3b9a",
          900: "#1b226f",
        },
      },
    },
  },
});
