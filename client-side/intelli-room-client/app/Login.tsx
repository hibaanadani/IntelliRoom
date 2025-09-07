import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import AuthButton from '../components/AuthButton';
import InputField from '../components/InputField';
import { useAuth } from './context/AuthContext.tsx';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpPress = () => {
    router.push('/Signup');
  };

  const handleForgotPassword = () => {};

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#FEF7E5' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-1 bg-backgroundclr"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 items-center justify-center px-6 py-8">
          <View className="items-center mb-8">
            <Image 
              source={require('../assets/images/logo.png')}
              className="w-96 h-96 mb-4"
              resizeMode="contain"
            />
          </View>

          <View className="w-full max-w-sm rounded-[50px] p-6 border border-primary">
            <Text className="text-primary text-2xl font-cinzel-bold text-center mb-6">
              LOGIN
            </Text>
            <View className="space-y-4">
              <InputField
                placeholder="Email"
                value={formData.email}
                onChangeText={(value: string) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              <InputField
                placeholder="Password"
                value={formData.password}
                onChangeText={(value: string) => handleInputChange('password', value)}
                secureTextEntry={true}
                editable={!isLoading}
              />
            </View>
            <TouchableOpacity 
              onPress={handleForgotPassword}
              className="self-end mb-6"
              disabled={isLoading}
            >
              <Text className="text-secondary text-sm">Forgot Password?</Text>
            </TouchableOpacity>

            {isLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <AuthButton 
                text="Login"
                variant="primary"
                onPress={handleLogin}
              />
            )}

            {error ? <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</Text> : null}
          </View>

          <View className="mt-6 flex-row items-center">
            <Text className="text-primary text-sm">Don't have an account?{' '}</Text>
            <TouchableOpacity onPress={handleSignUpPress}>
              <Text className="text-primary text-sm font-cinzel-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;