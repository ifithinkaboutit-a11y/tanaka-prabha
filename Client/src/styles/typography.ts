export const typography = {
  fontFamily: {
    regular: "System",
    medium: "System",
    semiBold: "System",
    bold: "System",
  },

  heading: {
    h1: {
      fontSize: 30,
      lineHeight: 36, 
      fontWeight: "700",
    },
    h2: {
      fontSize: 26,
      lineHeight: 32, 
      fontWeight: "600",
    },
    h3: {
      fontSize: 22,
      lineHeight: 28, 
      fontWeight: "600",
    },
  },

  body: {
    large: {
      fontSize: 19,
      lineHeight: 28, 
      fontWeight: "400",
    },
    medium: {
      fontSize: 17,
      lineHeight: 25, 
      fontWeight: "400",
    },
    small: {
      fontSize: 15,
      lineHeight: 22, 
      fontWeight: "400",
    },
  },

  label: {
    button: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "600",
    },
    caption: {
      fontSize: 13,
      lineHeight: 18, 
      fontWeight: "400",
    },
  },
} as const;
