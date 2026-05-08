import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useRouter, usePathname } from "expo-router";
import { LogOut, User, Home, BookOpen, Settings } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", path: `/${user?.role}`, icon: Home },
    { label: "Courses", path: `/${user?.role}/courses`, icon: BookOpen },
    { label: "Profile", path: "/profile", icon: User },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-gray-200">
        <View>
          <Text className="text-xl font-bold text-blue-600">AttendClass</Text>
        </View>
        <TouchableOpacity onPress={signOut} className="p-2">
          <LogOut size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {children}
      </ScrollView>

      <View className="flex-row bg-white border-t border-gray-200 px-6 py-3 justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.path as any)}
              className="items-center"
            >
              <Icon size={24} color={active ? "#2563eb" : "#6b7280"} />
              <Text className={`text-[10px] mt-1 ${active ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
