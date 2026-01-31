// src/components/atoms/AppText.tsx
import { Text, TextProps } from "react-native";
import clsx from "clsx";

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
  className?: string;
};

const variantClasses: Record<Variant, string> = {
  h1: "text-h1 font-bold text-neutral-textDark",
  h2: "text-h2 font-semibold text-neutral-textDark",
  h3: "text-h3 font-semibold text-neutral-textDark",
  bodyLg: "text-bodyLg text-neutral-textDark",
  bodyMd: "text-bodyMd text-neutral-textDark",
  bodySm: "text-bodySm text-neutral-textMedium",
  caption: "text-caption text-neutral-textLight",
};

export default function AppText({
  variant = "bodyMd",
  className,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      className={clsx(variantClasses[variant], className)}
    />
  );
}
