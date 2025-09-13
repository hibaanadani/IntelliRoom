import React, { useState, useEffect } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import AuthButton from "../../components/AuthButton";
import Chatbtn from "@/components/Chatbtn";
import InputField from "../../components/InputField";
import { icons } from "../../constants/icons";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../../services/users.service";
import { router } from "expo-router";

const profilePicture = require("../../assets/images/profilepic.png");

const Profile = () => {
  const { user, logout, token } = useAuth();
  const [formData, setFormData] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    password: "",
    age: user?.age?.toString() || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    if (user) {
      console.log("User data received in Profile.tsx:", user);
      setFormData({
        fullname: user.fullname,
        email: user.email,
        password: "",
        age: user.age?.toString() || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = async () => {
    if (!user || !token) {
      console.error("User or token is not available. Cannot update profile.");
      return;
    }

    const updatedData: { [key: string]: any } = {};

    if (formData.fullname !== user.fullname) {
      updatedData.fullname = formData.fullname;
    }

    if (formData.email !== user.email) {
      updatedData.email = formData.email;
    }

    if (formData.password) {
      updatedData.password = formData.password;
    }

    const newAge = formData.age ? Number(formData.age) : null;
    if (newAge !== user.age) {
      updatedData.age = newAge;
    }

    const newPhone = formData.phone || null;
    if (newPhone !== user.phone) {
      updatedData.phone = newPhone;
    }

    if (Object.keys(updatedData).length === 0) {
      console.log("No changes detected. Profile not updated.");
      return;
    }

    try {
      console.log("Attempting to update profile for user ID:", user.id);
      console.log("Data being sent:", updatedData);
      await updateProfile(user.id, updatedData, token);
      console.log("Profile updated successfully!");
      router.replace("/(tabs)/profile");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleEditPicture = () => {
    console.log("Edit profile picture");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/onboarding");
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-backgroundclr pt-16"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <TouchableOpacity
          onPress={handleLogout}
          className="absolute top-8 right-4 z-10 flex-row items-center bg-primary rounded-full px-3 py-3"
        >
          <Image
            source={icons.logout}
            className="w-5 h-5"
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View className="items-center mb-8">
          <View className="relative w-32 h-32 rounded-full mb-4">
            <Image
              source={profilePicture}
              className="w-full h-full"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={handleEditPicture}
              className="absolute bottom-0 right-[-4] p-2 bg-primary rounded-full"
            >
              <Image
                source={icons.edit}
                className="w-4 h-4"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text className="text-primary text-2xl font-cinzel-bold">
            Edit Profile
          </Text>
        </View>
        <View className="pt-8 px-8">
          <View className="w-full">
            <Text className="text-greyclr text-base font-cinzel-semi-bold mb-2">
              Full Name
            </Text>
            <InputField
              value={formData.fullname}
              onChangeText={(value) => handleInputChange("fullname", value)}
            />
            <Text className="text-greyclr text-base font-cinzel-semi-bold mb-2">
              Email
            </Text>
            <InputField
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text className="text-greyclr text-base font-cinzel-semi-bold mb-2">
              Age
            </Text>
            <InputField
              value={formData.age}
              onChangeText={(value) => handleInputChange("age", value)}
              keyboardType="numeric"
            />
            <Text className="text-greyclr text-base font-cinzel-semi-bold mb-2">
              Phone
            </Text>
            <InputField
              value={formData.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              keyboardType="phone-pad"
            />
            <Text className="text-greyclr text-base font-cinzel-semi-bold mb-2">
              Password
            </Text>
            <InputField
              placeholder="New Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              secureTextEntry
            />
          </View>
          <AuthButton
            text="Confirm"
            variant="primary"
            onPress={handleConfirm}
          />
        </View>
      </ScrollView>
      <Chatbtn />
    </View>
  );
};

export default Profile;
