import { useFonts } from 'expo-font';
import { SplashScreen, Stack, router } from "expo-router";
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/Login');
    }
  }, [isAuthenticated, isLoading]);

  const [fontsLoaded, error] = useFonts({
    'Cinzel': require('../assets/fonts/Cinzel-Regular.ttf'),
    'Cinzel-Bold': require('../assets/fonts/Cinzel-Bold.ttf'),
    'Cinzel-SemiBold': require('../assets/fonts/Cinzel-SemiBold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="bookings"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}