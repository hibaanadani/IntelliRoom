import GalleryCard from "@/components/GalleryCard";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  getAllGalleries,
  getGalleryById,
} from "../../services/gallary.service";
import { Gallery as GalleryInterface } from "../../interfaces/gallery.interface";
import Chatbtn from "@/components/Chatbtn";

const Gallery = () => {
  const [galleries, setGalleries] = useState<GalleryInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const data = await getAllGalleries();
        setGalleries(data);
      } catch (err) {
        console.error("Failed to fetch galleries:", err);
        setError("Failed to load galleries. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries();
  }, []);

  const handleBookings = (galleryId: string) => {
    router.push(`/bookings?galleryId=${galleryId}`);
  };

  const handleDownloadCatalogue = async (galleryId: string) => {
    if (downloading) {
      return;
    }
    setDownloading(true);

    try {
      const galleryItem = await getGalleryById(galleryId);
      if (!galleryItem?.catalogue) {
        Alert.alert(
          "No Catalogue",
          "This gallery does not have a catalogue available."
        );
        return;
      }

      const cataloguePath = galleryItem.catalogue.startsWith("/")
        ? galleryItem.catalogue.substring(1)
        : galleryItem.catalogue;

      const fileUrl = `${process.env.EXPO_PUBLIC_API_URL}/${cataloguePath}`;
      const fileName = cataloguePath.split("/").pop() || "catalogue.pdf";
      const localUri = FileSystem.documentDirectory + fileName;

      console.log("Attempting to download from URL:", fileUrl);

      const { uri: downloadedUri, status } = await FileSystem.downloadAsync(
        fileUrl,
        localUri
      );

      if (status !== 200) {
        throw new Error(`Download failed with status code ${status}`);
      }

      console.log("Download successful. File saved to:", downloadedUri);

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "Sharing Not Available",
          "Saving files is not available on your device."
        );
        return;
      }
      await Sharing.shareAsync(downloadedUri);
    } catch (err: unknown) {
      console.error("Failed to download catalogue:", err);
      if (err instanceof Error) {
        Alert.alert("Error", `Failed to download catalogue: ${err.message}`);
      } else {
        Alert.alert("Error", "An unknown error occurred during download.");
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading || downloading) {
    return (
      <View className="flex-1 justify-center items-center bg-backgroundclr">
        <ActivityIndicator size="large" color="#8C3B1E" />
        <Text className="mt-4 text-primary font-cinzel-bold">
          {loading ? "Loading Galleries..." : "Downloading Catalogue..."}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-backgroundclr">
        <Text className="text-primary font-cinzel-bold text-center">
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-backgroundclr pt-16 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-primary text-2xl font-cinzel-bold">
            Galleries
          </Text>
        </View>

        <View className="space-y-4">
          {galleries.map((galleryItem) => (
            <GalleryCard
              key={galleryItem._id}
              imageSource={{
                uri: `${process.env.EXPO_PUBLIC_API_URL}/${galleryItem.coverImage}`,
              }}
              title={galleryItem.name}
              onPress={() => handleDownloadCatalogue(galleryItem._id)}
              onCalendarPress={() => handleBookings(galleryItem._id)}
            />
          ))}
        </View>
      </ScrollView>
      <Chatbtn />
    </View>
  );
};

export default Gallery;
