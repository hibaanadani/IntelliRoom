import React from 'react';
import { TextInput, View, TextInputProps } from 'react-native';

interface InputFieldProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  editable?: boolean;
}

const InputField = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  ...rest 
}: InputFieldProps) => {
  return (
    <View>
      <TextInput 
        style={{ marginBottom: 13}}
        className="bg-transparent border border-greyclr rounded-xl px-4 py-3 text-greyclr"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#9AA394"
        {...rest}
      />
    </View>
  );
};

export default InputField;