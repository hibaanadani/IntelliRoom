import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { icons } from '../constants/icons';
import PageButton from './PageButton';

interface GalleryCardProps {
  imageSource: any;
  onPress: () => void;
  title: string;
  onCalendarPress: () => void;
}

const GalleryCard = ({ imageSource, onPress, title, onCalendarPress }: GalleryCardProps) => {
  return (
    <TouchableOpacity className="w-full h-64 mb-6 rounded-2xl overflow-hidden shadow-lg">
      <View className="relative w-full h-full">
        <Image
          source={imageSource}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }} />

        <View className="absolute top-4 w-full items-start px-4">
          <Text
            className="text-white text-xl font-cinzel-semi-bold"
            style={{ textTransform: 'uppercase' }}
          >
            {title}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onCalendarPress}
          className="absolute bottom-4 right-[128] p-2 bg-primary rounded-full"
        >
          <Image
            source={icons.calendar}
            className="w-7 h-7"
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View className="absolute bottom-4 right-4">
          <PageButton
            text="Catalogue"
            height={30}
            backgroundColor="#DBAF8E"
            onPress={onPress}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default GalleryCard;