import { icons } from "@/constants/icons";
import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useAuth } from "./context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import { getGalleryById } from "../services/gallary.service";

interface Gallery {
  id: string;
  name: string;
  coverImage: string | null;
  appointments: string[];
}

const Booking = () => {
  const { user } = useAuth();
  const { galleryId } = useLocalSearchParams();

  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!galleryId) {
      setLoading(false);
      setError("No gallery selected. Please go back and select a gallery.");
      return;
    }

    const fetchGallery = async () => {
      try {
        const data = await getGalleryById(galleryId as string);
        setSelectedGallery(data);
      } catch (err) {
        console.error("Failed to fetch gallery:", err);
        setError("Failed to load gallery details.");
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [galleryId]);

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setSelectedTime(null);
  };

  const onTimePress = (time: string) => {
    setSelectedTime(time);
  };

  const getAvailableTimes = () => {
    if (!selectedGallery || !selectedDate) {
      return [];
    }
    const filteredAppointments = selectedGallery.appointments.filter((app) => {
      const appointmentDate = app.split("T")[0];
      return appointmentDate === selectedDate;
    });

    return filteredAppointments.map((app) =>
      new Date(app).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-backgroundclr">
        <ActivityIndicator size="large" color="#8C3B1E" />
        <Text className="mt-4 text-primary font-cinzel-bold">
          Loading Booking Details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-backgroundclr">
        <Text className="text-primary font-cinzel-bold text-center">
          {error}
        </Text>
      </View>
    );
  }

  const availableTimes = getAvailableTimes();

  return (
    <ScrollView
      className="flex-1 bg-backgroundclr pt-16"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-row items-center justify-between px-4 mb-8">
        <View>
          <Text className="text-secondary text-base font-cinzel-semi-bold">
            Good Day
          </Text>
          <Text className="text-primary text-2xl font-cinzel-bold">
            {user?.fullname || "Guest"}
          </Text>
        </View>
        <TouchableOpacity className="flex-row items-center bg-transparent rounded-full border border-secondary px-4 py-2">
          <Text className="text-secondary font-cinzel-semi-bold">+ Book</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 bg-beigeclr rounded-xl overflow-hidden p-4">
        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            [selectedDate as string]: {
              selected: true,
              disableTouchEvent: true,
              selectedColor: "#8C3B1E",
              selectedTextColor: "#ffffff",
            },
          }}
          theme={{
            backgroundColor: "#DBAF8E",
            calendarBackground: "#DBAF8E",
            textSectionTitleColor: "#8C3B1E",
            textSectionTitleDisabledColor: "#9AA394",
            selectedDayBackgroundColor: "#8C3B1E",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#8C3B1E",
            dayTextColor: "#8C3B1E",
            textDisabledColor: "#9AA394",
            dotColor: "#8C3B1E",
            selectedDotColor: "#ffffff",
            arrowColor: "#8C3B1E",
            monthTextColor: "#8C3B1E",
            textDayFontWeight: "500",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "500",
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 16,
          }}
        />

        {selectedDate ? (
          <View className="items-center mt-4">
            <Text className="text-primary text-base font-cinzel-semi-bold mb-4">
              Available Times
            </Text>
            {availableTimes.length > 0 ? (
              availableTimes.map((time, index) => {
                const isSelected = selectedTime === time;
                const buttonClassName = isSelected
                  ? "w-36 rounded-full py-4 mb-4 items-center bg-primary"
                  : "w-36 rounded-full border border-primary py-4 mb-4 items-center";
                const textClassName = isSelected
                  ? "text-white font-cinzel-bold"
                  : "text-primary font-cinzel-bold";

                return (
                  <TouchableOpacity
                    key={index}
                    className={buttonClassName}
                    onPress={() => onTimePress(time)}
                  >
                    <Text className={textClassName}>{time}</Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text className="text-primary text-center">
                No available times for this day.
              </Text>
            )}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center mt-4">
            <Image
              source={icons.bookings}
              className="w-44 h-44"
              resizeMode="contain"
            />
            <Text className="text-primary">No Bookings, YET!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Booking;
