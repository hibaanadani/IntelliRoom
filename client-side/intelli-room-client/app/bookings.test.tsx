import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Booking from "./bookings";
import { Alert } from "react-native";

// --- START: CORRECTED MOCKING PATTERNS ---
const mockGetGalleryById = jest.fn();
const mockGetAvailableTimes = jest.fn();
const mockCreateBooking = jest.fn();

jest.mock("../services/gallary.service", () => ({
  getGalleryById: mockGetGalleryById,
}));

jest.mock("../services/booking.service", () => ({
  getAvailableTimes: mockGetAvailableTimes,
  createBooking: mockCreateBooking,
}));

// This is the correct pattern for mocking hooks
const mockUseLocalSearchParams = jest.fn();
const mockUseAuth = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: mockUseLocalSearchParams,
}));

// CORRECTED: The mock returns a function that we can later configure
jest.mock("./context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the third-party Calendar component correctly
jest.mock("react-native-calendars", () => {
  const { View } = require("react-native");

  const MockCalendar = ({ onDayPress, ...props }: any) => {
    return (
      <View testID="mock-calendar-view">
        <View
          testID="mock-calendar-day"
          onTouchEnd={() => onDayPress({ dateString: "2025-10-25" })}
        />
      </View>
    );
  };
  return { Calendar: MockCalendar };
});
// --- END: CORRECTED MOCKING PATTERNS ---

// Mock the global Alert function
jest.spyOn(Alert, "alert");

describe("Booking Screen", () => {
  const mockUser = { fullname: "John Doe", email: "john@example.com" };
  const mockToken = "mock-token";
  const mockGallery = {
    _id: "gallery-123",
    name: "Art Gallery",
    description: "Art Gallery",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Now this mock configuration will work as expected
    mockUseAuth.mockReturnValue({
      user: mockUser,
      token: mockToken,
    });
    mockUseLocalSearchParams.mockReturnValue({ galleryId: "gallery-123" });
  });

  it("renders loading state initially and then displays gallery and calendar", async () => {
    mockGetGalleryById.mockResolvedValue(mockGallery);
    mockGetAvailableTimes.mockResolvedValue([]);

    const { getByText, getByTestId, queryByText } = render(<Booking />);
    expect(getByText("Loading Booking Details...")).toBeTruthy();
    await waitFor(() => {
      expect(queryByText("Loading Booking Details...")).toBeNull();
      expect(getByText("John Doe")).toBeTruthy();
    });
    expect(mockGetGalleryById).toHaveBeenCalledWith("gallery-123");
    expect(getByTestId("mock-calendar-view")).toBeTruthy();
  });

  it("displays error message if gallery fetch fails", async () => {
    mockGetGalleryById.mockRejectedValue(new Error("Network Error"));
    const { getByText } = render(<Booking />);
    await waitFor(() => {
      expect(getByText("Failed to load gallery details.")).toBeTruthy();
    });
  });

  it("fetches available times when a date is selected", async () => {
    mockGetGalleryById.mockResolvedValue(mockGallery);
    const mockTimes = ["10:00 AM", "11:00 AM"];
    mockGetAvailableTimes.mockResolvedValue(mockTimes);

    const { getByTestId, getByText } = render(<Booking />);
    await waitFor(() => expect(mockGetGalleryById).toHaveBeenCalled());
    fireEvent(getByTestId("mock-calendar-day"), "onTouchEnd");
    await waitFor(() => {
      expect(mockGetAvailableTimes).toHaveBeenCalledWith(
        new Date("2025-10-25").toISOString()
      );
      expect(getByText("10:00 AM")).toBeTruthy();
      expect(getByText("11:00 AM")).toBeTruthy();
    });
  });

  it("displays error if fetching available times fails", async () => {
    mockGetGalleryById.mockResolvedValue(mockGallery);
    mockGetAvailableTimes.mockRejectedValue(new Error("Times error"));
    const { getByTestId, getByText } = render(<Booking />);
    await waitFor(() => expect(mockGetGalleryById).toHaveBeenCalled());
    fireEvent(getByTestId("mock-calendar-day"), "onTouchEnd");
    await waitFor(() => {
      expect(
        getByText("Failed to load times. Please try another day.")
      ).toBeTruthy();
    });
  });

  it("handles a successful booking submission", async () => {
    mockGetGalleryById.mockResolvedValue(mockGallery);
    mockGetAvailableTimes
      .mockResolvedValueOnce(["10:00 AM"])
      .mockResolvedValueOnce([]);
    mockCreateBooking.mockResolvedValueOnce({});
    const { getByText, getByTestId } = render(<Booking />);
    await waitFor(() => expect(mockGetGalleryById).toHaveBeenCalled());
    fireEvent(getByTestId("mock-calendar-day"), "onTouchEnd");
    await waitFor(() => expect(mockGetAvailableTimes).toHaveBeenCalled());
    fireEvent.press(getByText("10:00 AM"));
    fireEvent.press(getByText("+ Book"));
    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Booking for Art Gallery",
          email: "john@example.com",
        }),
        "mock-token"
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Your booking has been successfully created!"
      );
    });
  });

  it("handles a failed booking submission", async () => {
    mockGetGalleryById.mockResolvedValue(mockGallery);
    mockGetAvailableTimes.mockResolvedValue(["10:00 AM"]);
    mockCreateBooking.mockRejectedValue(new Error("Booking Failed"));
    const { getByText, getByTestId } = render(<Booking />);
    await waitFor(() => expect(mockGetGalleryById).toHaveBeenCalled());
    fireEvent(getByTestId("mock-calendar-day"), "onTouchEnd");
    await waitFor(() => expect(mockGetAvailableTimes).toHaveBeenCalled());
    fireEvent.press(getByText("10:00 AM"));
    fireEvent.press(getByText("+ Book"));
    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Failed to create booking. Please try again."
      );
    });
  });
});
