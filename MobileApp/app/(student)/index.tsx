import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../../components/DashboardLayout";
import { BookOpen, CheckCircle2, Clock } from "lucide-react-native";
import { formatLoggedAt } from "../../lib/time";

export default function StudentDashboard() {
  const { user } = useAuth();

  const enrollments = useQuery({
    queryKey: ["student-enrollments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("course:courses(id, course_code, course_name)")
        .eq("student_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const attendance = useQuery({
    queryKey: ["student-attendance", user?.matric_number],
    enabled: !!user?.matric_number,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_logs")
        .select("id, method, logged_at, raw_time, time_synced, course_id, course:courses(course_code, course_name)")
        .eq("matric_number", user!.matric_number!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const total = attendance.data?.length ?? 0;
  const synced = attendance.data?.filter((a: any) => a.time_synced).length ?? 0;

  return (
    <DashboardLayout>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name?.split(" ")[0]}</Text>
        <Text className="text-sm text-gray-500">{user?.matric_number}</Text>
      </View>

      <View className="flex-row justify-between mb-6">
        <StatCard icon={BookOpen} label="Courses" value={enrollments.data?.length ?? 0} />
        <StatCard icon={CheckCircle2} label="Check-ins" value={total} color="#16a34a" />
        <StatCard icon={Clock} label="Synced" value={synced} color="#2563eb" />
      </View>

      <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
        <Text className="text-lg font-bold text-gray-900 mb-4">How to check in</Text>
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-bold text-gray-800">Option A — Biometric (2FA)</Text>
            <Text className="text-xs text-gray-500">Tap RFID card on device, then place finger on sensor.</Text>
          </View>
          <View className="mt-2">
            <Text className="text-sm font-bold text-gray-800">Option B — QR + Bluetooth</Text>
            <Text className="text-xs text-gray-500">Scan QR on device OLED, then approve Bluetooth pairing.</Text>
          </View>
        </View>
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <Text className="text-lg font-bold text-gray-900 mb-4">Recent Attendance</Text>
        {attendance.isLoading ? (
          <ActivityIndicator color="#2563eb" />
        ) : (attendance.data?.length ?? 0) === 0 ? (
          <Text className="text-sm text-gray-500 text-center">No records yet. Check in at the device.</Text>
        ) : (
          <View className="space-y-4">
            {attendance.data!.map((a: any) => (
              <View key={a.id} className="flex-row items-center justify-between py-3 border-b border-gray-50">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-800">{a.course?.course_code || "Unmatched"}</Text>
                  <Text className="text-[10px] text-gray-400">{formatLoggedAt(a.logged_at, a.raw_time)}</Text>
                </View>
                <View className="flex-row items-center">
                  <View className={`px-2 py-1 rounded-full mr-2 ${a.method === "2FA" ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    <Text className={`text-[10px] font-bold ${a.method === "2FA" ? 'text-blue-700' : 'text-purple-700'}`}>{a.method}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${a.time_synced ? 'bg-green-100' : 'bg-amber-100'}`}>
                    <Text className={`text-[10px] font-bold ${a.time_synced ? 'text-green-700' : 'text-amber-700'}`}>
                      {a.time_synced ? "Present" : "Pending"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color = "#2563eb" }: any) {
  return (
    <View className="flex-1 mx-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 items-center">
      <Icon size={20} color={color} />
      <Text className="text-xl font-bold text-gray-900 mt-1">{value}</Text>
      <Text className="text-[10px] text-gray-500 uppercase font-bold">{label}</Text>
    </View>
  );
}
