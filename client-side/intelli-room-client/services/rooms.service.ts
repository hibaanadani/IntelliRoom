import api from "./axiosInstance";
import { Platform } from "react-native";
import { Room } from "../app/(tabs)/rooms";
import { isAxiosError } from "./users.service";

export const saveRoomWithImage = async (
  userId: number,
  roomName: string,
  mlOutput: any,
  imageUri: string,
  token: string
) => {
  const formData = new FormData();

  const fileExtension = imageUri.split(".").pop();
  const fileName = `room_image_${Date.now()}.${fileExtension}`;
  const fileType = `image/${fileExtension}`;

  formData.append("image", {
    uri: Platform.OS === "android" ? imageUri : imageUri.replace("file://", ""),
    name: fileName,
    type: fileType,
  } as any);

  formData.append(
    "roomData",
    JSON.stringify({
      name: roomName,
      mlOutput: mlOutput,
    })
  );

  try {
    const response = await api.post(`/users/${userId}/rooms/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred during room save.");
    }
  }
};

export const getUserRooms = async (
  userId: number,
  token: string
): Promise<Room[]> => {
  try {
    const response = await api.get(`/users/${userId}/rooms`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as Room[];
  } catch (error) {
    if (isAxiosError(error)) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred during room fetch.");
    }
  }
};

export const deleteRoom = async (
  userId: number,
  roomId: string,
  token: string
) => {
  console.log("DELETE REQUEST DETAILS");
  console.log("User ID:", userId);
  console.log("Room ID:", roomId);
  const url = `/users/${userId}/rooms/${roomId}`;
  console.log("DELETE URL:", url);

  try {
    await api.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (isAxiosError(error)) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred during room deletion.");
    }
  }
};
