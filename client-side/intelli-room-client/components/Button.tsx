import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  textClassName?: string;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  className = "",
  textClassName = "",
}: ButtonProps) => {
  const buttonClasses =
    variant === "primary"
      ? `bg-primary`
      : `bg-transparent border-2 border-primary`;

  const textClasses = variant === "primary" ? `text-white` : `text-primary`;

  return (
    <TouchableOpacity
      className={`rounded-2xl py-4 px-8 items-center justify-center min-w-[200px] ${buttonClasses} ${className}`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        className={`text-base font-semibold ${textClasses} ${textClassName}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
