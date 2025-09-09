import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import AuthButton from "../../components/AuthButton";
import HomeCard from "../../components/HomeCard";
import Chatbtn from "../../components/Chatbtn.tsx";
import { useAuth } from "../context/AuthContext.tsx";

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

const nearbyStores = [
  { id: "1", title: "Daze", image: require("../../assets/images/Daze.png") },
  {
    id: "2",
    title: "The Concept",
    image: require("../../assets/images/Concept.png"),
  },
  {
    id: "3",
    title: "Home Decor",
    image: require("../../assets/images/HomeH.png"),
  },
];

const home = () => {
  const { user } = useAuth();
  const handleScanNow = () => {
    router.push("/camera");
  };

  const handleUploadPhoto = () => {
    router.push({ pathname: "/camera", params: { mode: "gallery" } });
  };

  const handleCardPress = (title: string) => {
    console.log(`Card "${title}" was pressed.`);
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-backgroundclr pt-16 px-4">
        <View className="items-center mb-8">
          <Text className="text-primary text-2xl font-cinzel-bold">
            WELCOME {user?.fullname?.toUpperCase() || "GUEST"}!
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
                onPress={() => handleCardPress(item.title)}
              />
            ))}
          </ScrollView>
        </View>

        <View className="mb-8">
          <Text className="text-black text-lg font-cinzel-semi-bold mb-4">
            Nearby Stores
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {nearbyStores.map((item) => (
              <HomeCard
                key={item.id}
                imageSource={item.image}
                onPress={() => handleCardPress(item.title)}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <Chatbtn />
    </View>
  );
};

export default home;
