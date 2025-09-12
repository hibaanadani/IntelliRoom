// RoomDetails.tsx
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MLOutput {
  overallClassification: string;
  individualObjectAnalysis: {
    object: string;
    classification: "Good" | "Bad";
  }[];
  actionableReport: string[];
}

const RoomDetails = () => {
  const { name, mlOutput, imageUrl } = useLocalSearchParams();

  let parsedMlOutput: MLOutput | undefined;
  // Safely parse the JSON data from the route parameters
  if (mlOutput) {
    // <-- FIX 1: Check if mlOutput exists before trying to parse it
    try {
      parsedMlOutput = JSON.parse(mlOutput as string);
    } catch (e) {
      console.error("Failed to parse ML output:", e);
      // Optional: Handle the error in the UI if needed
    }
  }

  const roomName = name as string;
  const roomImageUrl = imageUrl as string;

  // We will only render the analysis if the data was parsed correctly
  if (!parsedMlOutput) {
    return (
      <View className="flex-1 justify-center items-center bg-backgroundclr">
        <Text className="text-red-500 text-lg">
          No analysis data available for this room.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-backgroundclr">
      <Stack.Screen
        options={{
          headerTitle: roomName,
        }}
      />
      <ScrollView className="p-4">
        {/* Room Image */}
        {roomImageUrl && (
          <Image
            source={{ uri: roomImageUrl }}
            className="w-full h-52 rounded-xl mb-4"
            resizeMode="cover"
          />
        )}

        {/* Room Name */}
        <Text className="text-primary text-2xl font-cinzel-bold mb-5">
          Analysis for {roomName}
        </Text>

        {/* Overall Classification */}
        <View className="mb-5 p-4 bg-white rounded-lg shadow-md">
          <Text className="text-lg font-bold text-gray-700 mb-2">
            Overall Classification
          </Text>
          <Text className="text-base text-gray-600">
            {parsedMlOutput.overallClassification}
          </Text>
        </View>

        {/* Individual Object Analysis */}
        <View className="mb-5 p-4 bg-white rounded-lg shadow-md">
          <Text className="text-lg font-bold text-gray-700 mb-2">
            Object Analysis
          </Text>
          {/* FIX 2: Ensure the map call is safe with optional chaining */}
          {parsedMlOutput.individualObjectAnalysis?.map((item, index) => (
            <Text key={index} className="text-base text-gray-600">
              - {item.object}:{" "}
              <Text
                className={
                  item.classification === "Good"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {item.classification}
              </Text>
            </Text>
          ))}
        </View>

        {/* Actionable Report */}
        <View className="mb-5 p-4 bg-white rounded-lg shadow-md">
          <Text className="text-lg font-bold text-gray-700 mb-2">
            Actionable Report
          </Text>
          {/* FIX 2: Ensure the map call is safe with optional chaining */}
          {parsedMlOutput.actionableReport?.map((item, index) => (
            <Text key={index} className="text-base text-gray-600">
              - {item}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoomDetails;
