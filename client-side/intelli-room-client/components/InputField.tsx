import React from 'react';
import { TextInput, View } from 'react-native';

const InputField = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
}:any) => {
  return (
    <View>
      <TextInput  style={{ marginBottom: 13}}
        className="bg-transparent border border-greyclr rounded-xl px-4 py-3 text-greyclr"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#9AA394"
        
      />
    </View>
  );
};

export default InputField;