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
  actionableReport?: string[];
}

const RoomDetails = () => {
  const { name, mlOutput, imageUrl } = useLocalSearchParams();
  console.log("mlOutput from params:", mlOutput);

  let parsedMlOutput: MLOutput | undefined;
  if (mlOutput) {
    if (typeof mlOutput === "string") {
      try {
        parsedMlOutput = JSON.parse(mlOutput);
      } catch (e) {
        console.error("Failed to parse ML output:", e);
      }
    } else {
      parsedMlOutput = mlOutput as unknown as MLOutput;
    }
  }

  const roomName = name as string;
  const roomImageUrl = imageUrl as string;

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
        {roomImageUrl && (
          <Image
            source={{ uri: roomImageUrl }}
            className="w-full h-52 rounded-xl mb-4"
            resizeMode="cover"
          />
        )}

        <Text className="text-primary text-2xl font-cinzel-bold mb-5">
          Analysis for {roomName}
        </Text>

        <View className="mb-5 p-4 bg-white rounded-lg shadow-md">
          <Text className="text-lg font-bold text-gray-700 mb-2">
            Overall Classification
          </Text>
          <Text className="text-base text-gray-600">
            {parsedMlOutput.overallClassification}
          </Text>
        </View>

        <View className="mb-5 p-4 bg-white rounded-lg shadow-md">
          <Text className="text-lg font-bold text-gray-700 mb-2">
            Object Analysis
          </Text>
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

        <View className="mb-5 p-4 bg-white rounded-lg shadow-md">
          <Text className="text-lg font-bold text-gray-700 mb-2">
            Actionable Report
          </Text>
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
