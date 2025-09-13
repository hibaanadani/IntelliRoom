import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { getGalleryById } from "../services/gallary.service";
import { Gallery as GalleryInterface } from "../interfaces/gallery.interface";

const Catalogue = () => {
  const { galleryId } = useLocalSearchParams();
  const [gallery, setGallery] = useState<GalleryInterface | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!galleryId) {
      setLoading(false);
      return;
    }

    const fetchGallery = async () => {
      try {
        const data = await getGalleryById(galleryId as string);
        setGallery(data);
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [galleryId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-backgroundclr">
        <ActivityIndicator size="large" color="#8C3B1E" />
        <Text className="mt-4 text-primary font-cinzel-bold">
          Loading Catalogue...
        </Text>
      </View>
    );
  }

  if (!gallery?.catalogue) {
    return (
      <View className="flex-1 justify-center items-center bg-backgroundclr">
        <Text className="text-xl font-cinzel-bold text-primary">
          No catalogue available for this gallery.
        </Text>
      </View>
    );
  }

  // CONSTRUCT THE PDF URI WITH THE GOOGLE VIEWER
  const pdfSource = {
    uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
      `${process.env.EXPO_PUBLIC_API_URL}/${gallery.catalogue}`
    )}`,
  };

  return (
    <View className="flex-1">
      <WebView source={pdfSource} style={{ flex: 1 }} />
    </View>
  );
};

export default Catalogue;
