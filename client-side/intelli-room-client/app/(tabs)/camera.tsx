import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const UploadPhoto = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Function to handle camera launch
  const handleLaunchCamera = async () => {
    // Request permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync();
    
    if (!result.canceled) {
    }
  };

  // Function to handle gallery launch
  const handleLaunchGallery = async () => {
    // Request permission to access the gallery
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photo gallery!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();
    

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

        <TouchableOpacity 
          onPress={handleLaunchCamera}
          className="bg-primary rounded-full px-8 py-4 mb-4"
        >
          <Text className="text-white text-base font-semibold">
            Open Camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleLaunchGallery}
          className="bg-primary rounded-full px-8 py-4"
        >
          <Text className="text-white text-base font-semibold">
            Choose from Gallery
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default UploadPhoto;