import { router } from "expo-router";
import React from "react";
import { Image, Text, View, Dimensions } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import bg from "../assets/images/bg.png";
import AuthButton from "../components/AuthButton";

export default function Index() {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;

  const handleLogin = () => {
    router.push("/Login");
  };

  const handleSignUp = () => {
    router.push("/Signup");
  };

  const goToHome = () => {
    router.push("/Home");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#FEF7E5" }}>
      <Image
        source={bg}
        style={{
          position: "absolute",
          top: insets.top,
          width: screenWidth,
          height: screenHeight * 1,
          resizeMode: "contain",
        }}
      />
      <SafeAreaView className="flex-1 justify-end items-center pb-20">
        <View className="items-center">
          <Text
            className="text-primary font-cinzel-bold text-center mb-2.5"
            style={{
              fontSize: 24,
              marginBottom: 10,
            }}
          >
            Welcome to Intelliroom
          </Text>
          <Text
            className="text-secondary text-center mb-10"
            style={{
              fontSize: 16,
              marginBottom: 40,
            }}
          >
            Your online room decorator
          </Text>
          <View className="w-full mx-auto">
            <AuthButton variant="primary" text="Login" onPress={handleLogin} />
            <AuthButton
              variant="secondary"
              text="Sign Up"
              onPress={handleSignUp}
            />
            <Text
              className=" text-secondary text-center mb-7.5"
              style={{
                fontSize: 14,
                marginBottom: 30,
              }}
            >
              By signing in I confirm to Terms & Privacy Policy
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
