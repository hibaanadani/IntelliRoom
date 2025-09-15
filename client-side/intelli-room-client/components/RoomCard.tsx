import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import PageButton from "./PageButton";

interface RoomCardProps {
  imageSource: any;
  onPress: () => void;
  onLongPress: () => void;
  title: string;
}

const RoomCard = ({
  imageSource,
  onPress,
  onLongPress,
  title,
}: RoomCardProps) => {
  return (
    <TouchableOpacity
      className="w-full h-64 mb-6 rounded-2xl overflow-hidden shadow-lg"
      onLongPress={onLongPress}
    >
      <View className="relative w-full h-full">
        <Image
          source={imageSource}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/35" />

        <View className="absolute top-4 w-full items-start px-4">
          <Text className="text-white text-xl font-cinzel-semi-bold uppercase">
            {title}
          </Text>
        </View>

        <PageButton
          text="Open"
          height={30}
          backgroundColor="#DBAF8E"
          onPress={onPress}
        />
      </View>
    </TouchableOpacity>
  );
};

export default RoomCard;
