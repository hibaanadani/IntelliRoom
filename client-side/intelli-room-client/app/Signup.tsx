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
import { router } from "expo-router";
import AuthButton from "../components/AuthButton";
import InputField from "../components/InputField";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { signUp } from "../store/authSlice";

const Signup = () => {
  const { isLoading: isAuthLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmpassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLoginPress = () => {
    router.push("/Login");
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullname: "",
      email: "",
      password: "",
      confirmpassword: "",
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required.";
      isValid = false;
    }
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
      isValid = false;
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
      isValid = false;
    }
    if (formData.password !== formData.confirmpassword) {
      newErrors.confirmpassword = "Passwords do not match.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { confirmpassword, ...userData } = formData;
      await dispatch(signUp(userData)).unwrap();
      router.replace("/(tabs)/Home");
    } catch (err: any) {
      console.error("Signup failed:", err);
      const backendError =
        err.response?.data?.message || "Signup failed. Please try again.";
      setError(backendError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior="height">
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
          <View className="w-full max-w-sm rounded-3xl p-6 border border-primary">
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
              {errors.fullname ? (
                <Text className="text-red-500 -mt-2">{errors.fullname}</Text>
              ) : null}
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
              {errors.email ? (
                <Text className="text-red-500 -mt-2">{errors.email}</Text>
              ) : null}
              <InputField
                placeholder="Password"
                value={formData.password}
                onChangeText={(value: string) =>
                  handleInputChange("password", value)
                }
                secureTextEntry={true}
                editable={!isLoading}
              />
              {errors.password ? (
                <Text className="text-red-500 -mt-2">{errors.password}</Text>
              ) : null}
              <InputField
                placeholder="Confirm Password"
                value={formData.confirmpassword}
                onChangeText={(value: string) =>
                  handleInputChange("confirmpassword", value)
                }
                secureTextEntry={true}
                editable={!isLoading}
              />
              {errors.confirmpassword ? (
                <Text className="text-red-500 -mt-2">
                  {errors.confirmpassword}
                </Text>
              ) : null}
            </View>
            {isLoading || isAuthLoading ? (
              <ActivityIndicator size="large" className="text-white" />
            ) : (
              <AuthButton
                text="Sign Up"
                variant="primary"
                onPress={handleSignUp}
              />
            )}
            {error ? (
              <Text className="text-red-500 text-center mt-2">{error}</Text>
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
