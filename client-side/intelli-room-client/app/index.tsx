import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function StartPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/Home" />;
  } else {
    return <Redirect href="/onboarding" />;
  }
}
