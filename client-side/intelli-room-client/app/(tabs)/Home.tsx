import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AuthButton from "../../components/AuthButton";
import HomeCard from "../../components/HomeCard";
import Chatbtn from "../../components/Chatbtn.tsx";
import { useAuth } from "../context/AuthContext.tsx";
import { getAllGalleries } from "../../services/gallary.service";
import { Gallery } from "../../interfaces/gallery.interface";

const suggestedItems = [
  {
    id: "1",
    title: "Modern Sofa",
    image: require("../../assets/images/recommended.png"),
  },
  {
    id: "2",
    title: "Elegant Table",
    image: require("../../assets/images/recommended-2.png"),
  },
  {
    id: "3",
    title: "Lamp Set",
    image: require("../../assets/images/recommended-1.png"),
  },
];

const home = () => {
  const { user } = useAuth();

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [galleriesLoading, setGalleriesLoading] = useState(true);
  const [galleriesError, setGalleriesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const data = await getAllGalleries();
        setGalleries(data);
      } catch (err) {
        console.error("Failed to fetch galleries:", err);
        setGalleriesError("Failed to load galleries.");
      } finally {
        setGalleriesLoading(false);
      }
    };
    fetchGalleries();
  }, []);

  const handleScanNow = () => {
    router.push("/camera");
  };

  const handleUploadPhoto = () => {
    router.push({ pathname: "/camera", params: { mode: "gallery" } });
  };

  const handleCardPress = (id: string) => {
    router.push({ pathname: "/bookings", params: { galleryId: id } });
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-backgroundclr pt-16 px-4">
        <View className="items-center mb-8">
          <Text className="text-primary text-2xl font-cinzel-bold">
            WELCOME {user?.fullname?.toUpperCase()}!
          </Text>
        </View>

        <View className="mb-8 items-center space-y-4">
          <AuthButton
            text="Scan Your Room Now"
            variant="primary"
            onPress={handleScanNow}
          />
          <TouchableOpacity onPress={handleUploadPhoto}>
            <Text className="text-secondary text-sm">Upload Photo</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <Text className="text-black text-base font-cinzel-semi-bold mb-4">
            Suggested For You
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {suggestedItems.map((item) => (
              <HomeCard
                key={item.id}
                imageSource={item.image}
                onPress={() => console.log(`Card "${item.title}" was pressed.`)}
              />
            ))}
          </ScrollView>
        </View>

        <View className="mb-8">
          <Text className="text-black text-lg font-cinzel-semi-bold mb-4">
            Galleries
          </Text>
          {galleriesLoading ? (
            <ActivityIndicator size="large" color="#8C3B1E" />
          ) : galleriesError ? (
            <Text className="text-red-500 text-center">{galleriesError}</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {galleries.map((gallery) => {
                const fullImageUrl = `${process.env.EXPO_PUBLIC_API_URL}/${gallery.coverImage}`;
                return (
                  <HomeCard
                    key={gallery._id}
                    imageSource={{ uri: fullImageUrl }}
                    onPress={() => handleCardPress(gallery._id)}
                  />
                );
              })}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <Chatbtn />
    </View>
  );
};

export default home;
