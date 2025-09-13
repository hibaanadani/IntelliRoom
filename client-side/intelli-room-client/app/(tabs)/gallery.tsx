import GalleryCard from "@/components/GalleryCard";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { getAllGalleries } from "../../services/gallary.service";
import { Gallery as GalleryInterface } from "../../interfaces/gallery.interface";

const Gallery = () => {
  const [galleries, setGalleries] = useState<GalleryInterface[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleViewCatalogue = (galleryId: string) => {
    router.push(`/catalogue?galleryId=${galleryId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-backgroundclr">
        <ActivityIndicator size="large" color="#8C3B1E" />
        <Text className="mt-4 text-primary font-cinzel-bold">
          Loading Galleries...
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
            onPress={() => handleViewCatalogue(galleryItem._id)}
            onCalendarPress={() => handleBookings(galleryItem._id)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default Gallery;
