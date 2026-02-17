/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          green: "var(--color-primary-green)",
          greenLight: "var(--color-primary-greenLight)",
          greenDark: "var(--color-primary-greenDark)",
          main: "var(--color-primary)",
        },
        secondary: {
          soil: "var(--color-secondary-soil)",
          harvest: "var(--color-secondary-harvest)",
          clay: "var(--color-secondary-clay)",
          sky: "var(--color-secondary-sky)",
        },
        neutral: {
          surface: "var(--color-neutral-surface)",
          border: "var(--color-neutral-border)",
          textLight: "var(--color-neutral-textLight)",
          textMedium: "var(--color-neutral-textMedium)",
          textDark: "var(--color-neutral-textDark)",
        },
        semantic: {
          success: "var(--color-semantic-success)",
          error: "var(--color-semantic-error)",
          warning: "var(--color-semantic-warning)",
          info: "var(--color-semantic-info)",
        },
      },
    },
  },
  plugins: [],
};
