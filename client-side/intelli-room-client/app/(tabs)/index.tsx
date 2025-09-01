import { Link } from "expo-router";
import React from 'react';
import { ImageBackground, Text, View } from "react-native";
import bg from '../../assets/images/bg.png';

export default function Index() {
  return (
    <ImageBackground
      source={bg}
      className="flex-1 justify-center items-center"
    >
      <View className="items-center mt-24">
        <Text style={{
          fontSize: 24,
          color: '#8C3B1E',
          fontFamily: 'Cinzel-Bold',
          textAlign: 'center',
          marginBottom: 8
        }}>
          Welcome to Intelliroom
        </Text>

        <Text style={{
          fontSize: 16,
          color: '#548E32',
          textAlign: 'center',
          marginTop: 15
        }}>
          Your online room decorator
        </Text>
        
        <Link href="/onboarding" className="mt-5">onboarding</Link>
        <Link href="./rooms/bedroom" className="mt-2">Bedroom</Link>
      </View>
    </ImageBackground>
  );
}