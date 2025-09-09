import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { icons } from "../../constants/icons.ts";
import ChatForm from "./ChatForm.tsx";
import ChatMessage from "./ChatMessage.tsx";
import { postChatbotMessage } from "../../services/chatbot.service.ts";
import { ChatbotResponse } from "../../services/chatbot.service.ts";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface ChatbotProps {
  userId: string;
}

const Chatbot = ({ userId }: ChatbotProps) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const scrollViewRef = useRef<ScrollView | null>(null);

  const getBotResponse = async (userMessage: string): Promise<string> => {
    try {
      const response: ChatbotResponse[] = await postChatbotMessage(
        userMessage,
        userId
      );
      const botMessage: string =
        response?.[0]?.output ||
        "Sorry, I received an empty response. Please try again.";
      return botMessage;
    } catch (error) {
      console.error("Failed to get bot response:", error);
      return "Sorry, I'm having trouble connecting right now. Please try again later.";
    }
  };

  useEffect(() => {
    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      getBotResponse(lastMessage.text)
        .then((botResponse) => {
          setChatHistory((prevHistory) => [
            ...prevHistory,
            { role: "model", text: botResponse },
          ]);
        })
        .catch((error) => {
          setChatHistory((prevHistory) => [
            ...prevHistory,
            {
              role: "model",
              text: "Sorry, I'm having trouble connecting right now. Please try again later.",
            },
          ]);
        });
    }
  }, [chatHistory]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatHistory]);

  return (
    <View className="flex-1 rounded-lg overflow-hidden bg-backgroundclr">
      <View className="flex-row items-center p-4 bg-primary rounded-t-lg">
        <Image source={icons.chatbot} className="w-8 h-8 mr-2" />
        <Text className="text-xl font-bold text-backgroundclr">
          IntelliRoom chatbot
        </Text>
      </View>

      <View className="flex-1">
        <ScrollView className="flex-1 p-4" ref={scrollViewRef}>
          <View className="flex-row items-start mb-4">
            <Image source={icons.chatbot} className="w-6 h-6 mr-2" />
            <View className="bg-beigeclr p-3 rounded-lg max-w-[80%]">
              <Text className="text-sm">
                Hey there 👋 {"\n"} How can I help you today?
              </Text>
            </View>
          </View>

          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </ScrollView>
      </View>

      <View className="px-4 pt-0 bg-backgroundclr border-greyclr">
        <ChatForm setChatHistory={setChatHistory} />
      </View>
    </View>
  );
};

export default Chatbot;
