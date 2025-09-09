import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { ActivityIndicator, View } from "react-native";

const StartPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/Home" />;
  } else {
    return <Redirect href="/onboarding" />;
  }
};

export default StartPage;
