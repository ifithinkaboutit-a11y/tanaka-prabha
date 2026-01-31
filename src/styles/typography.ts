export const typography = {
  fontFamily: {
    regular: "System",
    medium: "System",
    semiBold: "System",
    bold: "System",
  },

  heading: {
    h1: {
      fontSize: 28,
      lineHeight: 34, 
      fontWeight: "700",
    },
    h2: {
      fontSize: 24,
      lineHeight: 31, 
      fontWeight: "600",
    },
    h3: {
      fontSize: 20,
      lineHeight: 26, 
      fontWeight: "600",
    },
  },

  body: {
    large: {
      fontSize: 18,
      lineHeight: 27, 
      fontWeight: "400",
    },
    medium: {
      fontSize: 16,
      lineHeight: 24, 
      fontWeight: "400",
    },
    small: {
      fontSize: 14,
      lineHeight: 21, 
      fontWeight: "400",
    },
  },

  label: {
    button: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "600",
    },
    caption: {
      fontSize: 12,
      lineHeight: 17, 
      fontWeight: "400",
    },
  },
} as const;
