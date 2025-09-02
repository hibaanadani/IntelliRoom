import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from "expo-router";
import React, { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    'Cinzel': require('../assets/fonts/Cinzel-Regular.ttf'),
    'Cinzel-Bold': require('../assets/fonts/Cinzel-Bold.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in your app.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // Your Stack navigator will render after fonts are loaded.
  return (
    <Stack>
      {/* <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      /> */}
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}