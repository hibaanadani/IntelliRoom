import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, ScrollView, Text, View, Alert, TextInput } from "react-native";
import { router } from "expo-router";

import AuthButton from "../../components/AuthButton";
import { saveRoomWithImage } from "../../services/rooms.service";
import { useAuth } from "../context/AuthContext";

const UploadPhoto = () => {
  const { user, token } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [roomName, setRoomName] = useState("");

  const mlOutputPlaceholder = {
    overallClassification: "Clean and Tidy",
    individualObjectAnalysis: [
      { object: "Bed", classification: "Good" },
      { object: "Desk", classification: "Good" },
      { object: "Clutter", classification: "Bad" },
    ],
    actionableReport: [
      "Tidy up the desk area.",
      "Clear the clutter from the floor.",
    ],
  };

  const handleLaunchCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleLaunchGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photo gallery!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSaveRoom = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select or take a photo first.");
      return;
    }

    if (!user || !token) {
      Alert.alert("Error", "You must be logged in to save a room.");
      return;
    }

    setLoading(true);
    const finalRoomName =
      roomName || `My New Room ${new Date().toLocaleTimeString()}`;

    try {
      await saveRoomWithImage(
        user.id,
        finalRoomName,
        mlOutputPlaceholder,
        selectedImage,
        token
      );
      Alert.alert("Success", "Room saved successfully!");
      setTimeout(() => {
        router.replace("/(tabs)/rooms");
      }, 500);
    } catch (error) {
      console.error("Failed to save room:", error);
      Alert.alert("Error", "Failed to save room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-backgroundclr pt-16 px-4">
      <View className="items-center justify-center">
        <Text className="text-primary text-2xl font-cinzel-bold mb-8">
          Upload a Photo
        </Text>

        {selectedImage && (
          <Image
            source={{ uri: selectedImage }}
            className="w-48 h-48 rounded-full mb-8"
          />
        )}

        {selectedImage && (
          <TextInput
            className="w-full h-12 bg-white rounded-lg mb-4 text-black text-center"
            placeholder="Name your room"
            placeholderTextColor="#666"
            value={roomName}
            onChangeText={setRoomName}
          />
        )}

        <AuthButton
          onPress={handleLaunchCamera}
          text="Open Camera"
          variant="primary"
        />

        <AuthButton
          onPress={handleLaunchGallery}
          text="Choose from Gallery"
          variant="primary"
        />

        {selectedImage && (
          <AuthButton
            onPress={handleSaveRoom}
            text={loading ? "Saving..." : "Save Room"}
            variant="secondary"
            disabled={loading}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default UploadPhoto;
