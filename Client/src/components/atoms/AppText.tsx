// src/components/atoms/AppText.tsx
import { Text, TextProps, StyleSheet } from "react-native";

type Variant =
  | "h1"
  | "h2"
  | "h3"
  | "bodyLg"
  | "bodyMd"
  | "bodySm"
  | "caption";

type AppTextProps = TextProps & {
  variant?: Variant;
};

const variantStyles = StyleSheet.create({
  h1: { fontSize: 36, fontWeight: "bold", color: "#212121" },
  h2: { fontSize: 30, fontWeight: "600", color: "#212121" },
  h3: { fontSize: 24, fontWeight: "600", color: "#212121" },
  bodyLg: { fontSize: 20, color: "#212121" },
  bodyMd: { fontSize: 18, color: "#212121" },
  bodySm: { fontSize: 16, color: "#616161" },
  caption: { fontSize: 14, color: "#9E9E9E" },
});

export default function AppText({
  variant = "bodyMd",
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[variantStyles[variant], style]}
    />
  );
}
