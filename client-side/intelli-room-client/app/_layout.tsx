import { Stack, SplashScreen, router } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";

import { Provider } from "react-redux";
import { store } from "../store";

import { useAuth, AuthProvider } from "./context/AuthContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [fontsLoaded] = useFonts({
    "Cinzel-Bold": require("../assets/fonts/Cinzel-Bold.ttf"),
    "Cinzel-Regular": require("../assets/fonts/Cinzel-Regular.ttf"),
    "Cinzel-SemiBold": require("../assets/fonts/Cinzel-SemiBold.ttf"),
  });

  useEffect(() => {
    if (isLoading || !fontsLoaded) {
      return;
    }

    SplashScreen.hideAsync();

    if (isAuthenticated) {
      router.replace("/(tabs)");
    } else {
      router.replace("/onboarding");
    }
  }, [isAuthenticated, isLoading, fontsLoaded]);

  if (isLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="Signup" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        {" "}
        <RootLayoutContent />
      </AuthProvider>
    </Provider>
  );
}
