// src/components/atoms/AppText.tsx
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";

type Variant =
  | "h1"
  | "h2"
  | "h3"
  | "bodyLg"
  | "bodyMd"
  | "bodySm"
  | "caption";

const HEADING_VARIANTS: Variant[] = ["h1", "h2", "h3"];

type AppTextProps = TextProps & {
  variant?: Variant;
  className?: string;
};

const variantStyles: Record<Variant, TextStyle> = {
  h1: { fontSize: 36, fontWeight: "700", color: "#212121" },
  h2: { fontSize: 30, fontWeight: "600", color: "#212121" },
  h3: { fontSize: 24, fontWeight: "600", color: "#212121" },
  bodyLg: { fontSize: 20, color: "#212121" },
  bodyMd: { fontSize: 18, color: "#212121" },
  bodySm: { fontSize: 16, color: "#616161" },
  caption: { fontSize: 14, color: "#9E9E9E" },
};

/**
 * AppText uses StyleSheet-based variants internally.
 *
 * The `className` prop is accepted for compatibility (so existing callers
 * compile without errors) but is NOT applied — this deliberately keeps
 * react-native-css-interop out of AppText's render path.
 *
 * WHY: css-interop's render-component.js reads NavigationStateContext
 * during React Fast Refresh before the NavigationContainer is re-mounted,
 * causing: "Couldn't find a navigation context".
 *
 * To override a style, use the `style` prop instead of `className`.
 *
 * Accessibility: h1/h2/h3 variants default to accessibilityRole="header".
 * All other variants have no default role. Pass accessibilityRole explicitly
 * to override.
 */
export default function AppText({
  variant = "bodyMd",
  className: _className,   // accepted but not used — see note above
  style,
  accessibilityRole,
  ...props
}: AppTextProps) {
  const resolvedRole =
    accessibilityRole ?? (HEADING_VARIANTS.includes(variant) ? "header" : undefined);

  return (
    <Text
      {...props}
      accessibilityRole={resolvedRole}
      style={[variantStyles[variant], style]}
    />
  );
}
