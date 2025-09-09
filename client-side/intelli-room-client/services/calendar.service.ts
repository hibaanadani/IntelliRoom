import api from "./axiosInstance.ts";

interface CalendarResponse {
  message?: string;
  status?: string;
}

export const postCalendarMessage = async (message: string) => {
  try {
    const response = await api.post<CalendarResponse>("/calendar/message", {
      message,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
