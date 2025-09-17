import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { icons } from "../../constants/icons.ts";
import ChatForm from "./ChatForm.tsx";
import ChatMessage from "./ChatMessage.tsx";
import { postChatbotMessage } from "../../services/chatbot.service.ts";
import { ChatbotResponse } from "../../services/chatbot.service.ts";

interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: number;
}

interface ChatbotProps {
  userId: string;
}

const Chatbot = ({ userId }: ChatbotProps) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView | null>(null);

  const getStorageKey = (userId: string): string => {
    return `chatbot_messages_${userId}`;
  };

  const saveMessagesToStorage = async (
    messages: ChatMessage[]
  ): Promise<void> => {
    try {
      const storageKey = getStorageKey(userId);
      await AsyncStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save messages to storage:", error);
    }
  };

  const loadMessagesFromStorage = async (): Promise<ChatMessage[]> => {
    try {
      const storageKey = getStorageKey(userId);
      const storedMessages = await AsyncStorage.getItem(storageKey);
      if (storedMessages) {
        return JSON.parse(storedMessages);
      }
    } catch (error) {
      console.error("Failed to load messages from storage:", error);
    }
    return [];
  };

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
    const initializeChat = async () => {
      const storedMessages = await loadMessagesFromStorage();
      setChatHistory(storedMessages);
      setIsLoading(false);
    };

    initializeChat();
  }, [userId]);

  useEffect(() => {
    if (!isLoading && chatHistory.length > 0) {
      saveMessagesToStorage(chatHistory);
    }
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      getBotResponse(lastMessage.text)
        .then((botResponse) => {
          const botMessage: ChatMessage = {
            role: "model",
            text: botResponse,
            timestamp: Date.now(),
          };

          setChatHistory((prevHistory) => [...prevHistory, botMessage]);
        })
        .catch((error) => {
          const errorMessage: ChatMessage = {
            role: "model",
            text: "Sorry, I'm having trouble connecting right now. Please try again later.",
            timestamp: Date.now(),
          };

          setChatHistory((prevHistory) => [...prevHistory, errorMessage]);
        });
    }
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatHistory]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-backgroundclr">
        <Text className="text-gray-500">Loading chat history...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-between rounded-lg overflow-hidden bg-backgroundclr">
      <View className="flex-row items-center p-4 bg-primary rounded-t-lg">
        <Image source={icons.chatbot} className="w-8 h-8 mr-2" />
        <Text className="text-xl font-bold text-backgroundclr">
          IntelliRoom chatbot
        </Text>
      </View>

      <View className="flex-1">
        <ScrollView className="p-4" ref={scrollViewRef}>
          <View className="flex-row items-start mb-4">
            <Image source={icons.chatbot} className="w-6 h-6 mr-2" />
            <View className="bg-beigeclr p-3 rounded-lg max-w-[80%]">
              <Text className="text-sm">
                Hey there 👋 {"\n"} How can I help you today?
              </Text>
            </View>
          </View>

          {chatHistory.map((chat, index) => (
            <ChatMessage key={`${chat.timestamp}-${index}`} chat={chat} />
          ))}
        </ScrollView>
      </View>

      <View className="px-4 py-2 bg-backgroundclr border-greyclr">
        <ChatForm setChatHistory={setChatHistory} />
      </View>
    </View>
  );
};

export default Chatbot;
