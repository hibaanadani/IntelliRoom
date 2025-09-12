import api from "./axiosInstance";

export interface CreateBookingPayload {
  title: string;
  startTime: string;
  endTime: string;
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

export const getAllBookings = async (token: string): Promise<any> => {
  try {
    const response = await api.get("/bookings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};
