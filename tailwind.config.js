const { colors } = require("./src/styles/colors");
const { typography } = require("./src/styles/typography");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      /* ---------------- COLORS ---------------- */
      colors: {
        primary: {
          DEFAULT: colors.primary.green,
          light: colors.primary.greenLight,
          dark: colors.primary.greenDark,
        },

        secondary: {
          soil: colors.secondary.soil,
          harvest: colors.secondary.harvest,
          clay: colors.secondary.clay,
          sky: colors.secondary.sky,
        },

        neutral: {
          surface: colors.neutral.surface,
          border: colors.neutral.border,
          textLight: colors.neutral.textLight,
          textMedium: colors.neutral.textMedium,
          textDark: colors.neutral.textDark,
        },

        semantic: {
          success: colors.semantic.success,
          error: colors.semantic.error,
          warning: colors.semantic.warning,
          info: colors.semantic.info,
        },
      },

      /* ---------------- TYPOGRAPHY ---------------- */
      fontSize: {
        h1: [
          `${typography.heading.h1.fontSize}px`,
        ],
        h2: [
          `${typography.heading.h2.fontSize}px`,
        ],
        h3: [
          `${typography.heading.h3.fontSize}px`,
        ],

        bodyLg: [
          `${typography.body.large.fontSize}px`,
        ],
        bodyMd: [
          `${typography.body.medium.fontSize}px`,
        ],
        bodySm: [
          `${typography.body.small.fontSize}px`,
        ],

        caption: [
          `${typography.label.caption.fontSize}px`,
        ],
      },
    },
  },

  plugins: [],
};
