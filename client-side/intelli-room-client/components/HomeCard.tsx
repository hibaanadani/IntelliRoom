import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import PageButton from "./PageButton";

interface HomeCardProps {
  imageSource: any;
  onPress: () => void;
}

const HomeCard = ({ imageSource, onPress }: HomeCardProps) => {
  return (
    <TouchableOpacity className="w-40 mr-4">
      <View className="bg-transparent rounded-xl">
        <Image
          source={imageSource}
          className="w-full h-40 rounded-xl"
          resizeMode="cover"
        />
        <PageButton
          text="Open"
          height={25}
          backgroundColor="#548E32"
          onPress={onPress}
        />
      </View>
    </TouchableOpacity>
  );
};

export default HomeCard;
