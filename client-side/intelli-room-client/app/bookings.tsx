import { icons } from "@/constants/icons";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useAuth } from "./context/AuthContext";

const Booking = () => {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const availableTimes = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"];

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setSelectedTime(null);
    console.log(`Selected date: ${day.dateString}`);
  };

  const onTimePress = (time: string) => {
    setSelectedTime(time);
    console.log(`Selected time: ${time}`);
  };

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
            {availableTimes.map((time, index) => {
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
            })}
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
