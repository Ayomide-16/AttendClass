import { Redirect } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  // Redirect based on role
  if (user.role === "student") return <Redirect href="/student" />;
  if (user.role === "lecturer") return <Redirect href="/lecturer" />;
  if (user.role === "course_rep") return <Redirect href="/course-rep" />;

  return <Redirect href="/login" />;
}
