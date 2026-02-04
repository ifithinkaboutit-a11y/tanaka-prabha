// src/components/atoms/Card.tsx
import clsx from "clsx";
import { View } from "react-native";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return (
    <View
      className={clsx(
        "bg-neutral-surface rounded-xl p-4 border border-gray-300",
        className,
      )}
    >
      {children}
    </View>
  );
}
