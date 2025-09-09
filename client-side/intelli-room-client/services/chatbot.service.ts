import api from "./axiosInstance.ts";

export interface ChatbotResponse {
  output: string;
}

export const postChatbotMessage = async (
  message: string,
  userId: string
): Promise<ChatbotResponse[]> => {
  try {
    const response = await api.post<ChatbotResponse[]>("/chatbot/message", {
      message,
      userId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
