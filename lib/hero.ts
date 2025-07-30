import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      extend: "light",
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        primary: {
          foreground: "#000000",
          DEFAULT: "#FFA500", // Orange
          50: "#FFF8F1",
          100: "#FFECDC",
          200: "#FFD8B5",
          300: "#FFC285",
          400: "#FFA500",
          500: "#FF9400",
          600: "#FF8500",
          700: "#E67600",
          800: "#CC6600",
          900: "#B35900",
        },
        secondary: {
          foreground: "#FFFFFF",
          DEFAULT: "#3B82F6", // Blue
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
      },
    },
    dark: {
      extend: "dark",
      colors: {
        background: "#1a1a1a",
        foreground: "#f0f0f0",
        primary: {
          foreground: "#000000",
          DEFAULT: "#FFA500", // Orange
          50: "#FFF8F1",
          100: "#FFECDC",
          200: "#FFD8B5",
          300: "#FFC285",
          400: "#FFA500",
          500: "#FF9400",
          600: "#FF8500",
          700: "#E67600",
          800: "#CC6600",
          900: "#B35900",
        },
        secondary: {
          foreground: "#FFFFFF",
          DEFAULT: "#3B82F6", // Blue
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
      },
    },
  },
});
