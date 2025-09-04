import React from 'react';
import {
  GestureResponderEvent,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { icons } from '../constants/icons';

const Chatbot = () => {
  function handleChatPress(event: GestureResponderEvent): void {
   
    console.log('Chat button pressed.');
  }

  return (
    <TouchableOpacity
      onPress={handleChatPress}
      className="absolute bottom-20 right-6 bg-primary rounded-full p-4 shadow-lg"
    >
      <Image
        source={icons.communication}
        className="w-6 h-6"
        resizeMode="contain"
      />
    </TouchableOpacity> 
  );
};

export default Chatbot;

const styles = StyleSheet.create({});