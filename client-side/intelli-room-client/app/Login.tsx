import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AuthButton from '../components/AuthButton';
import InputField from '../components/InputField';

const Login = ({ }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = () => {

  };

  const handleSignUpPress = () => {
    router.push('/Signup');
  };

  const handleForgotPassword = () => {
  
  };

  return (
    <ScrollView className="flex-1 bg-backgroundclr">
      <View className="flex-1 items-center justify-center px-6 py-8">
        
        <View className="items-center mb-8">
          <Image 
            source={require('../assets/images/logo.png')}
            className="w-52 h-52 mb-4"
            resizeMode="contain"
          />
        </View>

        <View className="w-full max-w-sm rounded-[50px] p-6 border border-primary">
          <Text className="text-primary text-2xl font-cinzel-bold text-center mb-6">
            LOG IN
          </Text>
          
          <View className="space-y-4">
            <InputField
              placeholder="Email"
              value={formData.email}
              onChangeText={(value:any) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <InputField
              placeholder="Password"
              value={formData.password}
              onChangeText={(value: any) => handleInputChange('password', value)}
              secureTextEntry={true}
            />
          </View>

          <TouchableOpacity 
            onPress={handleForgotPassword}
            className="self-end mb-6"
          >
            <Text className="text-secondary text-sm">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <AuthButton 
            text="Log In"
            variant="primary"
            onPress={handleLogin}
          />
        </View>

        <View className="mt-6 flex-row items-center">
          <Text className="text-primary text-sm">
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={handleSignUpPress}>
            <Text className="text-primary text-sm font-cinzel-bold">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Login;