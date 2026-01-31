// src/components/atoms/IconButton.tsx
import { Pressable } from "react-native";
import clsx from "clsx";

type IconButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
};

export default function IconButton({
  children,
  onPress,
  className,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={clsx(
        "w-10 h-10 items-center justify-center bg-neutral-surface",
        className
      )}
    >
      {children}
    </Pressable>
  );
}
