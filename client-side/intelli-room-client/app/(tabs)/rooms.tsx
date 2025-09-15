import React, { useEffect, useState, useCallback } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import RoomCard from "../../components/RoomCard";
import Chatbtn from "@/components/Chatbtn";
import { icons } from "../../constants/icons";
import { router, useFocusEffect } from "expo-router";
import { deleteRoom, getUserRooms } from "../../services/rooms.service";
import { useAuth } from "../context/AuthContext";

export interface Room {
  id: string;
  name: string;
  imageUrl: string;
  mlOutput: any;
  createdAt: string;
}

const Rooms = () => {
  const { user, token, isLoading } = useAuth();
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchUserRooms = useCallback(async () => {
    if (!user || !token) {
      setIsFetching(false);
      return;
    }

    try {
      setIsFetching(true);
      const roomsData = await getUserRooms(String(user.id), token);
      setMyRooms(roomsData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      Alert.alert(
        "Error",
        "Could not fetch your rooms. Please try again later."
      );
    } finally {
      setIsFetching(false);
    }
  }, [user, token]);

  useFocusEffect(
    useCallback(() => {
      fetchUserRooms();
    }, [fetchUserRooms])
  );

  const handleDeleteRoom = (roomId: string) => {
    if (!user || !token) {
      Alert.alert("Error", "You must be logged in to delete a room.");
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this room?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteRoom(String(user.id), roomId, token);
              Alert.alert("Success", "Room deleted successfully!");
              fetchUserRooms();
            } catch (error) {
              console.error("Error deleting room:", error);
              Alert.alert("Error", "Failed to delete room. Please try again.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleCardPress = (room: Room) => {
    router.push({
      pathname: "/RoomDetails",
      params: {
        name: room.name,
        mlOutput: JSON.stringify(room.mlOutput),
        imageUrl: room.imageUrl,
      },
    });
  };

  const handleAddRoom = () => {
    router.push({ pathname: "/camera", params: { mode: "gallery" } });
  };

  return (
    <View className="flex-1">
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
            <Image
              source={icons.plus}
              className="w-8 h-8"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {isFetching || isLoading ? (
          <ActivityIndicator size="large" color="#DBAF8E" />
        ) : (
          <View className="space-y-4">
            {myRooms.length > 0 ? (
              myRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  imageSource={{ uri: room.imageUrl }}
                  title={room.name}
                  onPress={() => handleCardPress(room)}
                  onLongPress={() => handleDeleteRoom(room.id)}
                />
              ))
            ) : (
              <Text className="text-center text-greyclr mt-10">
                No rooms found. Add a new one!
              </Text>
            )}
          </View>
        )}
      </ScrollView>
      <Chatbtn />
    </View>
  );
};

export default Rooms;
