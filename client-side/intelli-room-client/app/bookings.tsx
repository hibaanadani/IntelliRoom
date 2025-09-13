import { icons } from "@/constants/icons";
import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useAuth } from "./context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import { getGalleryById } from "../services/gallary.service";
import { Gallery } from "../interfaces/gallery.interface";
import { createBooking, getAvailableTimes } from "../services/booking.service";

const Booking = () => {
  const { user, token } = useAuth();
  const { galleryId } = useLocalSearchParams();

  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [timesLoading, setTimesLoading] = useState(false);
  const [timesError, setTimesError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchAndSetAvailableTimes = async (date: string) => {
    setTimesLoading(true);
    setTimesError(null);
    setSelectedTime(null);

    try {
      const fullDate = new Date(date).toISOString();
      console.log("Date being sent to backend:", fullDate);

      const times = await getAvailableTimes(fullDate);
      setAvailableTimes(times);
    } catch (err) {
      console.error("Failed to fetch available times:", err);
      setTimesError("Failed to load times. Please try another day.");
      setAvailableTimes([]);
    } finally {
      setTimesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAndSetAvailableTimes(selectedDate);
    }
  }, [selectedDate]);

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const onTimePress = (time: string) => {
    setSelectedTime(time);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !user || !token) {
      Alert.alert(
        "Error",
        "Please select a date and time to book and ensure you are logged in."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const [hour, minute] = selectedTime.split(":").map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hour, minute, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      const bookingData = {
        title: `Booking for ${selectedGallery?.name || "Gallery"}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        email: user.email,
        fullname: user.fullname,
        participants: [user.email],
        notes: `Booking for ${
          selectedGallery?.name || "the gallery"
        } at ${selectedTime} on ${selectedDate}`,
      };

      await createBooking(bookingData, token);

      Alert.alert("Success", "Your booking has been successfully created!");
    } catch (error) {
      console.error("Booking failed:", error);
      Alert.alert("Error", "Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <ScrollView className="flex-1 bg-backgroundclr pt-16">
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

      <View className="bg-beigeclr rounded-xl overflow-hidden p-4">
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

        <View className="mt-4">
          {timesLoading ? (
            <ActivityIndicator size="large" color="#8C3B1E" />
          ) : timesError ? (
            <View className="justify-center items-center">
              <Text className="text-red-500 font-cinzel-bold text-center">
                {timesError}
              </Text>
            </View>
          ) : availableTimes.length > 0 ? (
            <View className="flex-col justify-center items-center">
              <Text className="text-primary text-lg font-cinzel-bold text-center mb-4">
                Available Times for {selectedDate}
              </Text>
              {availableTimes.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => onTimePress(time)}
                  className={`rounded-full p-3 mb-2 w-48 items-center ${
                    selectedTime === time
                      ? "bg-primary"
                      : "border-2 border-primary"
                  }`}
                >
                  <Text
                    className={`font-cinzel-semi-bold ${
                      selectedTime === time ? "text-white" : "text-primary"
                    }`}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="flex-1 justify-center items-center">
              <Image
                source={icons.bookings}
                className="w-44 h-44"
                resizeMode="contain"
              />
              <Text className="text-primary mt-2">No Bookings, YET!</Text>
            </View>
          )}
        </View>

        {selectedTime && (
          <TouchableOpacity
            className="mt-6 p-4 rounded-xl bg-primary flex-row justify-center items-center"
            onPress={handleBooking}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-lg font-cinzel-bold">
                Book Now
              </Text>
            )}
          </TouchableOpacity>
        )}
        <View className="h-16" />
      </View>
    </ScrollView>
  );
};

export default Booking;
