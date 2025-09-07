import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

const AuthButton = ({text, variant, onPress}: any) => {
  const buttonStyle = variant === 'primary' 
    ? "bg-primary shadow-lg"
    : "bg-transparent border-2 border-secondary";
  
  const textStyle = variant === 'primary'
    ? "text-center text-lg text-white font-semibold"
    : "text-center text-lg text-secondary font-medium";
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`${buttonStyle} flex items-center justify-center self-center`}
      style={{
        width: 300,
        height: 50,
        borderRadius: 25,
        marginBottom: 10,
      }}
    >
      <Text className={textStyle}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

export default AuthButton;