import { router } from "expo-router";
import React from 'react';
import { ImageBackground, Text, View } from "react-native";
import bg from '../../assets/images/bg.png';
import AuthButton from '../../components/AuthButton';

export default function Index() {
  
  const handleLogin = () => {
    router.push('/Login');
  };

  const handleSignUp = () => {
    router.push('/Signup');
  };

  return (
    <ImageBackground
      source={bg}
      className="flex-1 justify-end items-center pb-20"
      style={{ backgroundColor: '#FEF7E5' }}
      resizeMode="contain" // 'stretch', 'contain', 'cover', 'center', or 'repeat'
      imageStyle={{
        opacity: 1,
      }}
    >
      <View className="items-center">
        <Text style={{
          fontSize: 24,
          color: '#8C3B1E',
          fontFamily: 'Cinzel-Bold',
          textAlign: 'center',
          marginBottom: 10
        }}>
          Welcome to Intelliroom
        </Text>

        <Text style={{
          fontSize: 16,
          color: '#548E32',
          textAlign: 'center',
          marginBottom: 40
        }}>
          Your online room decorator
        </Text>
        
        <View className="w-full mx-auto">
          
          <AuthButton 
            variant="primary"
            text="Log In"
            onPress={handleLogin}
          />
          
          <AuthButton 
            variant="secondary"
            text="Sign Up"
            onPress={handleSignUp}
          />
                  <Text style={{
          fontSize: 14,
          color: '#548E32',
          textAlign: 'center',
          marginBottom: 30
        }}>
          By signing in I confirm to Terms & Privacy Policy
        </Text>
        </View>
      </View>
    </ImageBackground>
  );
}