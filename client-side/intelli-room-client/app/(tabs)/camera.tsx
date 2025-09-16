import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, ScrollView, Text, View, Alert, TextInput } from "react-native";
import { router } from "expo-router";
import AuthButton from "../../components/AuthButton";
import { saveRoomWithImage } from "../../services/rooms.service";
import { useAppSelector } from "../..//store/hooks";

const UploadPhoto = () => {
  const { user, token } = useAppSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [roomName, setRoomName] = useState("");

  const handleLaunchCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Error",
        "You've refused to allow this app to access your camera!"
      );
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
      Alert.alert(
        "Error",
        "You've refused to allow this app to access your photo gallery!"
      );
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
        String(user._id),
        finalRoomName,
        selectedImage,
        token
      );

      setSelectedImage(null);
      setRoomName("");

      Alert.alert("Success", "Room saved successfully! Upload another room?", [
        {
          text: "View Rooms",
          onPress: () => router.replace("/(tabs)/rooms"),
        },
        {
          text: "Upload Another",
          style: "default",
        },
      ]);
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
