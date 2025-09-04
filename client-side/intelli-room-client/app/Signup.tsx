import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AuthButton from '../components/AuthButton';
import InputField from '../components/InputField';

const Signup = ({}) => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmpassword: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoginPress = () => {
    router.push('/Login');
  };

  const handleSignUp = () => {
  };

  return (
    // We wrap the whole screen content with KeyboardAvoidingView
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="height" 
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-backgroundclr">
        <View className="flex-1 items-center justify-center px-6 py-8">
          <View className="items-center mb-8">
            <Image
              source={require('../assets/images/logo.png')}
              className="w-80 h-80 mb-4"
              resizeMode="contain"
            />
          </View>

          <View className="w-full max-w-sm rounded-[50px] p-6 border border-primary">
            <Text className="text-primary text-2xl font-cinzel-bold text-center mb-6">
              SIGN UP
            </Text>

            <View className="space-y-4">
              <InputField
                placeholder="Full Name"
                value={formData.fullname}
                onChangeText={(value: any) => handleInputChange('fullname', value)}
                autoCapitalize="none"
              />

              <InputField
                placeholder="Email"
                value={formData.email}
                onChangeText={(value: any) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <InputField
                placeholder="Password"
                value={formData.password}
                onChangeText={(value: any) => handleInputChange('password', value)}
                secureTextEntry={true}
              />

              <InputField
                placeholder="Confirm Password"
                value={formData.confirmpassword}
                onChangeText={(value: any) => handleInputChange('confirmpassword', value)}
                secureTextEntry={true}
              />
            </View>

            <AuthButton
              text="Sign Up"
              variant="primary"
              onPress={handleSignUp}
            />
          </View>

          <View className="mt-6 flex-row items-center">
            <Text className="text-primary text-sm">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleLoginPress}>
              <Text className="text-primary text-sm font-cinzel-bold">
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;