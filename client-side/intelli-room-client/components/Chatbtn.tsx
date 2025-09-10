import React, { useState } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import Chatbot from "./Chatbot/Chatbot.tsx";
import { icons } from "../constants/icons.ts";
import { useAuth } from "../app/context/AuthContext.tsx";

const Chatbtn = () => {
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const { user } = useAuth();
  const userId: string | null = user?.id?.toString() || null;

  const toggleChatbot = () => {
    if (userId) {
      setIsChatbotVisible(!isChatbotVisible);
    } else {
      console.log("Chatbot not available for guests. Please log in.");
    }
  };

  return (
    <>
      {isChatbotVisible && userId && (
        <View className="absolute inset-0 z-50 flex-1 justify-end items-end">
          <View className="absolute bottom-28 right-4 w-80 h-96 rounded-lg shadow-lg">
            <Chatbot userId={userId} />
          </View>
        </View>
      )}

      <View className="absolute bottom-14 right-4 z-50">
        <TouchableOpacity
          onPress={toggleChatbot}
          style={{ opacity: userId ? 1 : 0.5 }}
          className="w-14 h-14 rounded-full bg-primary justify-center items-center shadow-lg"
        >
          <Image
            source={isChatbotVisible ? icons.xicon : icons.chatbot}
            className="w-10 h-10"
            accessibilityLabel={isChatbotVisible ? "Close Chat" : "Open Chat"}
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default Chatbtn;
