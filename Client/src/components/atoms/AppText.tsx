// src/components/atoms/AppText.tsx
import { Text, TextProps, TextStyle } from "react-native";
import { theme } from "../../styles/colors";

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
  h1: { fontSize: 36, fontWeight: "700", color: theme.text.dark },
  h2: { fontSize: 30, fontWeight: "600", color: theme.text.dark },
  h3: { fontSize: 24, fontWeight: "600", color: theme.text.dark },
  bodyLg: { fontSize: 20, color: theme.text.dark },
  bodyMd: { fontSize: 18, color: theme.text.dark },
  bodySm: { fontSize: 16, color: theme.text.medium },
  caption: { fontSize: 14, color: theme.text.light },
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
