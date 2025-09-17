import React from "react";
import { View, Text, Image } from "react-native";
import { icons } from "../../constants/icons.ts";

interface ChatMessageData {
  role: "user" | "model";
  text: string;
  timestamp: number;
}

interface ChatMessageProps {
  chat: ChatMessageData;
}

const ChatMessage = ({ chat }: ChatMessageProps) => {
  const isBotMessage: boolean = chat.role === "model";
  const messageContainerClasses: string = isBotMessage
    ? "flex-row items-start mb-4"
    : "flex-row-reverse items-start mb-4";

  const messageBubbleClasses: string = isBotMessage
    ? "bg-beigeclr p-3 rounded-lg max-w-[80%]"
    : "bg-primary p-3 rounded-lg max-w-[80%]";

  return (
    <View className={messageContainerClasses}>
      {isBotMessage && (
        <Image source={icons.chatbot} className="w-6 h-6 mr-2" />
      )}
      <View className={messageBubbleClasses}>
        <Text
          className={isBotMessage ? "text-sm text-black" : "text-sm text-white"}
        >
          {chat.text}
        </Text>
      </View>
    </View>
  );
};

export default ChatMessage;
