import api from "./axiosInstance.ts";

// Add 'export' so it can be imported by other files
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
