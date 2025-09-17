import { Platform } from "react-native";
import { Room } from "../app/(tabs)/rooms";
import { isAxiosError } from "./users.service";
import api from "./axiosInstance";

export const saveRoomWithImage = async (
  userObjectId: string,
  roomName: string,
  imageUri: string,
  token: string
) => {
  console.log("SAVE ROOM: Attempting to save a room for userId:", userObjectId);

  const formData = new FormData();

  const fileExtension = imageUri.split(".").pop();
  const fileName = `room_image_${Date.now()}.${fileExtension}`;
  const fileType = `image/${fileExtension}`;

  const imageFormData: any = {
    uri: Platform.OS === "android" ? imageUri : imageUri.replace("file://", ""),
    name: fileName,
    type: fileType,
  };

  formData.append("image", imageFormData);
  formData.append(
    "roomData",
    JSON.stringify({
      name: roomName,
    })
  );

  try {
    const response = await api.post(
      `/users/${userObjectId}/rooms/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
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
  userObjectId: string,
  token: string
): Promise<Room[]> => {
  console.log("GET ROOMS: Attempting to fetch rooms for userId:", userObjectId);
  const url = `/users/${userObjectId}/rooms`;
  console.log("GET ROOMS: Full URL being requested:", url);

  try {
    const response = await api.get(url, {
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
  userObjectId: string,
  roomId: string,
  token: string
) => {
  console.log("DELETE ROOM: Attempting to delete room.");
  console.log("User ID:", userObjectId);
  console.log("Room ID:", roomId);

  const url = `/users/${userObjectId}/rooms/${roomId}`;
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
