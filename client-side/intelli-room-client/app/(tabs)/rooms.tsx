import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import RoomCard from "../../components/RoomCard";
import { icons } from "../../constants/icons";
import { router } from "expo-router";

const myRooms = [
  {
    id: "1",
    image: require("../../assets/images/Bedroom.png"),
    title: "Bedroom",
  },
  {
    id: "2",
    image: require("../../assets/images/Livingroom.png"),
    title: "Living Room",
  },
  {
    id: "3",
    image: require("../../assets/images/Library.png"),
    title: "Library",
  },
];

const Rooms = () => {
  const handleCardPress = (cardTitle: string) => {
    console.log(`Opening room: ${cardTitle}`);
  };

  const handleAddRoom = () => {
    router.push({ pathname: "/camera", params: { mode: "gallery" } });
  };

  return (
    <ScrollView
      className="flex-1 bg-backgroundclr pt-16 px-4"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-primary text-2xl font-cinzel-bold">Rooms</Text>
        <TouchableOpacity
          onPress={handleAddRoom}
          className="py-2 pl-2 pr-6 bg-primary rounded-se-3xl rounded-ss-3xl -mr-4"
        >
          <Image source={icons.plus} className="w-8 h-8" resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <View className="space-y-4">
        {myRooms.map((room) => (
          <RoomCard
            key={room.id}
            imageSource={room.image}
            title={room.title}
            onPress={() => handleCardPress(room.title)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default Rooms;
