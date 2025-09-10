import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

import AuthButton from "../../components/AuthButton";

const UploadPhoto = () => {
  // --- This is the updated line ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Function to handle camera launch
  const handleLaunchCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    if (!result.canceled) {
      // The uri is a string, which now matches the state's type
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Function to handle gallery launch
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
      // The uri is a string, which now matches the state's type
      setSelectedImage(result.assets[0].uri);
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
      </View>
    </ScrollView>
  );
};

export default UploadPhoto;
