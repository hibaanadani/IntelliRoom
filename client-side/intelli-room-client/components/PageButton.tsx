import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface PageButtonProps {
  text: string;
  height: number;
  backgroundColor: string;
  onPress: () => void;
}

const PageButton = ({ text, height, backgroundColor, onPress }: PageButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute bottom-2 right-2 rounded-2xl px-4 py-1"
      style={{
        height: height,
        backgroundColor: backgroundColor,
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 16,
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default PageButton;