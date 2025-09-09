import React, { useState, FC } from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";
import { icons } from "../../constants/icons.ts";

interface ChatFormProps {
  setChatHistory: React.Dispatch<
    React.SetStateAction<{ role: "user" | "model"; text: string }[]>
  >;
}

const ChatForm: FC<ChatFormProps> = ({ setChatHistory }) => {
  const [message, setMessage] = useState<string>("");

  const handleFormSubmit = () => {
    const userMessage: string = message.trim();
    if (!userMessage) return;

    setMessage("");

    setChatHistory((history) => [
      ...history,
      { role: "user", text: userMessage },
    ]);
  };

  return (
    <View className="flex-row items-center border border-greyclr rounded-full overflow-hidden">
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="How can I help you?"
        className="flex-1 p-3"
        placeholderTextColor="#9CA3AF"
      />

      <TouchableOpacity
        onPress={handleFormSubmit}
        className="p-4 bg-secondary rounded-full"
      >
        <Image source={icons.arrow} className="w-5 h-5 tint-white" />
      </TouchableOpacity>
    </View>
  );
};

export default ChatForm;
