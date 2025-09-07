import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AuthButton from "../components/AuthButton";
import InputField from "../components/InputField";

// Import Redux hooks and the setUser action
import { useDispatch } from "react-redux";
import { setUser } from "../store/authSlice";

const Signup = () => {
  // Use a mock signUp function for now. This would be your actual API call.
  const signUp = async (userData: any) => {
    // In a real app, this is where you would call your backend API
    console.log("Signing up with:", userData);

    // Simulate a successful API response after a delay
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmpassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoginPress = () => {
    router.push("/Login");
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmpassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const { confirmpassword, ...userData } = formData;
      await signUp(userData);

      // On successful sign-up, dispatch the setUser action
      dispatch(setUser({ name: formData.fullname }));

      // Optionally navigate to the next screen after successful sign-up
      router.replace("/(tabs)"); // or wherever your authenticated home screen is
    } catch (err: any) {
      console.error("Signup failed:", err);
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-backgroundclr"
      >
        <View className="flex-1 items-center justify-center px-6 py-8">
          <View className="items-center mb-8">
            <Image
              source={require("../assets/images/logo.png")}
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
                onChangeText={(value: string) =>
                  handleInputChange("fullname", value)
                }
                autoCapitalize="none"
                editable={!isLoading}
              />
              <InputField
                placeholder="Email"
                value={formData.email}
                onChangeText={(value: string) =>
                  handleInputChange("email", value)
                }
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              <InputField
                placeholder="Password"
                value={formData.password}
                onChangeText={(value: string) =>
                  handleInputChange("password", value)
                }
                secureTextEntry={true}
                editable={!isLoading}
              />
              <InputField
                placeholder="Confirm Password"
                value={formData.confirmpassword}
                onChangeText={(value: string) =>
                  handleInputChange("confirmpassword", value)
                }
                secureTextEntry={true}
                editable={!isLoading}
              />
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <AuthButton
                text="Sign Up"
                variant="primary"
                onPress={handleSignUp}
              />
            )}

            {error ? (
              <Text
                style={{ color: "red", textAlign: "center", marginTop: 10 }}
              >
                {error}
              </Text>
            ) : null}
          </View>

          <View className="mt-6 flex-row items-center">
            <Text className="text-primary text-sm">
              Already have an account?{" "}
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
