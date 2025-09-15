import api from "./axiosInstance";
import { format } from "date-fns";

export interface CreateBookingPayload {
  title: string;
  startTime: string;
  endTime: string;
  email: string;
  fullname: string;
  participants?: string[];
  notes?: string;
}

export interface BookingResponse {
  message: string;
  n8nResponse: any;
}

export const createBooking = async (
  bookingData: CreateBookingPayload,
  token: string
): Promise<BookingResponse> => {
  try {
    const response = await api.post<BookingResponse>(
      "/ai-agent/process-booking",
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

export const getAvailableTimes = async (date: string): Promise<string[]> => {
  try {
    // Corrected to use POST method and send the date in the request body
    const response = await api.post<{ availableSlots: any[] }>(
      "/ai-agent/get-times",
      { date: date } // Send the date in the body
    );

    const formattedTimes = response.data.availableSlots
      .filter((slot) => {
        // You'll need to filter the response here as the backend is not doing it for you.
        // A better approach would be to fix the backend to return only the requested date's times.
        const slotDate = format(new Date(slot.start), "yyyy-MM-dd");
        const requestedDate = format(new Date(date), "yyyy-MM-dd");
        return slotDate === requestedDate;
      })
      .map((slot) => {
        const startTime = new Date(slot.start);
        return format(startTime, "h:mm a");
      });

    return formattedTimes;
  } catch (error) {
    console.error("Error fetching available times:", error);
    throw error;
  }
};
