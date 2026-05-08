import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useAuth, AppRole } from "../contexts/AuthContext";
import { useRouter } from "expo-router";
import { GraduationCap, Users, Shield, BookOpen } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HOME: Record<AppRole, string> = {
  student: "/(student)",
  lecturer: "/(lecturer)",
  course_rep: "/(course-rep)",
};

const DEMO = [
  { label: "Student", id: "2022/1/86884ET", pw: "aisuedion" },
  { label: "Lecturer", id: "foloruso@attendclass.com", pw: "lecturer" },
  { label: "Course Rep", id: "courserep@attendclass.com", pw: "courserep" },
];

export default function LoginPage() {
  const { user, signIn, loading } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user?.role) {
      router.replace(HOME[user.role] as any);
    }
  }, [user, loading]);

  async function submit() {
    if (!identifier || !password) return;
    setBusy(true);
    const { error } = await signIn(identifier, password);
    setBusy(false);
    if (error) {
      Alert.alert("Login failed", error);
    }
  }

  function fill(id: string, pw: string) {
    setIdentifier(id);
    setPassword(pw);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-10">
        <View className="flex-1 justify-center">
          <View className="items-center mb-8">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-sm">
              <GraduationCap color="white" size={32} />
            </View>
            <Text className="mt-4 text-2xl font-bold text-gray-900">AttendClass</Text>
            <Text className="text-gray-500">FUT Minna</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Email or Matric Number</Text>
              <TextInput
                className="w-full h-12 border border-gray-200 rounded-xl px-4 bg-gray-50"
                placeholder="Enter your login ID"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
              <TextInput
                className="w-full h-12 border border-gray-200 rounded-xl px-4 bg-gray-50"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              onPress={submit}
              disabled={busy}
              className={`w-full h-14 rounded-xl items-center justify-center mt-6 ${busy ? 'bg-blue-400' : 'bg-blue-600'}`}
            >
              {busy ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-10 pt-6 border-t border-gray-100">
            <Text className="text-sm text-gray-500 mb-4">Quick demo login</Text>
            <View className="flex-row justify-between">
              {DEMO.map((d, index) => {
                const Icon = index === 0 ? Users : index === 1 ? Shield : BookOpen;
                return (
                  <TouchableOpacity
                    key={d.label}
                    onPress={() => fill(d.id, d.pw)}
                    className="flex-1 mx-1 rounded-xl border border-gray-100 bg-gray-50 p-3 items-center"
                  >
                    <Icon size={20} color="#2563eb" />
                    <Text className="mt-2 text-[10px] font-bold text-gray-800">{d.label}</Text>
                    <Text className="text-[8px] text-gray-400 text-center" numberOfLines={1}>
                      {d.id}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
