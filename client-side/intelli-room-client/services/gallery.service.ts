import api from "./axiosInstance";
import { Gallery } from "../interfaces/gallery.interface";

interface RawGalleryResponse {
  id: string;
  name: string;
  coverImage: string;
  catalogue?: string;
}

export const getAllGalleries = async (): Promise<Gallery[]> => {
  try {
    const response = await api.get<Gallery[]>("/gallery");
    return response.data;
  } catch (error) {
    console.error("Error fetching all galleries:", error);
    throw error;
  }
};

export const getGalleryById = async (id: string): Promise<Gallery> => {
  try {
    const response = await api.get<RawGalleryResponse>(`/gallery/${id}`);
    const data = response.data;

    const gallery: Gallery = {
      _id: data.id,
      name: data.name,
      coverImage: data.coverImage,
      catalogue: data.catalogue,
    };

    return gallery;
  } catch (error) {
    console.error(`Error fetching gallery with ID ${id}:`, error);
    throw error;
  }
};

export const bookAppointment = async (bookingDetails: {
  galleryId: string;
  date: string;
  time: string;
  userId: string;
}) => {
  try {
    const response = await api.post("/bookings", bookingDetails);
    return response.data;
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw error;
  }
};
