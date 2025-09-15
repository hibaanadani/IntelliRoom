import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface PageButtonProps {
  text: string;
  height: number;
  backgroundColor: string;
  onPress: () => void;
}

const PageButton = ({
  text,
  height,
  backgroundColor,
  onPress,
}: PageButtonProps) => {
  const bgColorClass = {
    "#DBAF8E": "bg-beigeclr",
    "#548E32": "bg-secondary",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`absolute bottom-2 right-2 rounded-2xl px-4 py-1 h-[${height}px] ${
        bgColorClass[backgroundColor as keyof typeof bgColorClass]
      }`}
    >
      <Text className="text-white text-base">{text}</Text>
    </TouchableOpacity>
  );
};

export default PageButton;
