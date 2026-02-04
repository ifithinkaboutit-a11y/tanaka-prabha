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

type AppTextProps = Omit<TextProps, "className"> & {
  variant?: Variant;
  className?: string;
};

const variantClasses: Record<Variant, string> = {
  h1: "text-4xl font-bold text-neutral-textDark",
  h2: "text-3xl font-semibold text-neutral-textDark",
  h3: "text-2xl font-semibold text-neutral-textDark",
  bodyLg: "text-xl text-neutral-textDark",
  bodyMd: "text-lg text-neutral-textDark",
  bodySm: "text-md text-neutral-textMedium",
  caption: "text-sm text-neutral-textLight",
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
