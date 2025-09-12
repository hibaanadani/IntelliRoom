import axios from "axios";
import api from "./axiosInstance";
import { Platform } from "react-native";
import { Room } from "../app/(tabs)/rooms";
import { isAxiosError } from "./users.service";

export const saveRoomWithImage = async (
  userObjectId: string,
  roomName: string,
  mlOutput: any,
  imageUri: string,
  token: string
) => {
  console.log("SAVE ROOM: Attempting to save a room for userId:", userObjectId);
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
    const response = await axios.post(
      `http://192.168.1.110:9000/users/${userObjectId}/rooms/upload`,
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
  const url = `http://192.168.1.110:9000/users/${userObjectId}/rooms`;
  console.log("GET ROOMS: Full URL being requested:", url);
  console.log("GET ROOMS: Token value:", token);
  try {
    const response = await axios.get(url, {
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
  const url = `http://192.168.1.110:9000/users/${userObjectId}/rooms/${roomId}`;
  console.log("DELETE URL:", url);

  try {
    await axios.delete(url, {
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
