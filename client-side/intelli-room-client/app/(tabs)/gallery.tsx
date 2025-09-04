import GalleryCard from '@/components/GalleryCard';
import React from 'react';
import {
  ScrollView,
  Text,
  View
} from 'react-native';


const myRooms = [
  { id: '1', image: require('../../assets/images/gallery.png'), title: 'Daze' },
  { id: '2', image: require('../../assets/images/gallery-1.png'), title: 'Istikbal' },
  { id: '3', image: require('../../assets/images/gallery-2.png'), title: 'Matta' },
];

const gallery = () => {
  const handleCardPress = (cardTitle: string) => {
    console.log(`Opening room: ${cardTitle}`);
  };


  return (
    <ScrollView className="flex-1 bg-backgroundclr pt-16 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-primary text-2xl font-cinzel-bold">
          Galleries
        </Text>
      </View>

      <View className="space-y-4">
        {myRooms.map((room) => (
          <GalleryCard
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

export default gallery;