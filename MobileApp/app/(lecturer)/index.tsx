import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Radio, MapPin, Smartphone } from "lucide-react-native";
import { formatLoggedAt } from "../../lib/time";
import { EspQrPanel } from "../../components/EspQrPanel";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function LecturerDashboard() {
  const { user } = useAuth();

  const active = useQuery({
    queryKey: ["active-schedule", user?.id],
    enabled: !!user,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_active_schedule_for_lecturer", {
        _lecturer_id: user!.id,
      });
      if (error) throw error;
      return (data && data.length > 0) ? data[0] : null;
    },
  });

  const activeSchedId = active.data?.schedule_id;

  const liveRoster = useQuery({
    queryKey: ["live-roster", activeSchedId],
    enabled: !!activeSchedId,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_logs")
        .select("id, matric_number, student_name, method, logged_at, raw_time, time_synced")
        .eq("schedule_id", activeSchedId!)
        .order("logged_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const courses = useQuery({
    queryKey: ["lecturer-courses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, course_code, course_name, schedules(id, day_of_week, start_time, end_time, venue, device_id)")
        .eq("lecturer_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <DashboardLayout>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Lecturer Dashboard</Text>
        <Text className="text-sm text-gray-500">Welcome, {user?.full_name}</Text>
      </View>

      <View className={`bg-white rounded-2xl p-6 mb-6 shadow-sm border ${active.data ? 'border-green-200 bg-green-50/20' : 'border-gray-100'}`}>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Radio size={20} color={active.data ? "#16a34a" : "#6b7280"} />
            <Text className={`ml-2 text-lg font-bold ${active.data ? 'text-green-700' : 'text-gray-900'}`}>
              {active.data ? "Class in session" : "No active class"}
            </Text>
          </View>
          {active.data && (
            <View className="px-2 py-1 bg-green-600 rounded-md">
              <Text className="text-white text-[10px] font-bold">LIVE</Text>
            </View>
          )}
        </View>

        {active.isLoading ? (
          <ActivityIndicator color="#2563eb" />
        ) : active.data ? (
          <View className="space-y-4">
            <View className="flex-row flex-wrap gap-x-4 gap-y-2">
              <View>
                <Text className="text-lg font-bold text-gray-900">{active.data.course_code}</Text>
                <Text className="text-xs text-gray-500">{active.data.course_name}</Text>
              </View>
              <View className="flex-row items-center">
                <MapPin size={14} color="#6b7280" />
                <Text className="ml-1 text-xs text-gray-500">{active.data.venue || "—"}</Text>
              </View>
              <View className="flex-row items-center">
                <Smartphone size={14} color="#6b7280" />
                <Text className="ml-1 text-xs text-gray-500">{active.data.device_id || "—"}</Text>
              </View>
            </View>

            <EspQrPanel 
              scheduleId={active.data.schedule_id}
              deviceId={active.data.device_id || "ESP32-LT101"}
              courseCode={active.data.course_code}
            />

            <View className="mt-4">
              <Text className="text-sm font-bold text-gray-800 mb-2">Live Attendance ({liveRoster.data?.length ?? 0})</Text>
              {liveRoster.isLoading ? (
                <ActivityIndicator color="#2563eb" />
              ) : (liveRoster.data?.length ?? 0) === 0 ? (
                <Text className="text-xs text-gray-500 italic">No one has checked in yet.</Text>
              ) : (
                <View className="space-y-2">
                  {liveRoster.data!.slice(0, 5).map((r: any) => (
                    <View key={r.id} className="flex-row justify-between py-2 border-b border-gray-50">
                      <View>
                        <Text className="text-xs font-bold text-gray-800">{r.student_name}</Text>
                        <Text className="text-[10px] text-gray-400">{r.matric_number}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-[10px] text-gray-400 font-mono">{formatLoggedAt(r.logged_at, r.raw_time)}</Text>
                        <View className={`px-2 py-0.5 rounded-full mt-1 ${r.method === "2FA" ? 'bg-blue-100' : 'bg-purple-100'}`}>
                          <Text className={`text-[8px] font-bold ${r.method === "2FA" ? 'text-blue-700' : 'text-purple-700'}`}>{r.method}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ) : (
          <Text className="text-sm text-gray-500">No class currently scheduled for this time.</Text>
        )}
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <Text className="text-lg font-bold text-gray-900 mb-4">My Courses</Text>
        {courses.isLoading ? (
          <ActivityIndicator color="#2563eb" />
        ) : (
          <View className="space-y-3">
            {courses.data!.map((c: any) => (
              <View key={c.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                <Text className="font-bold text-gray-900">{c.course_code}</Text>
                <Text className="text-xs text-gray-500 mb-2">{c.course_name}</Text>
                <View className="space-y-1">
                  {c.schedules?.map((s: any) => (
                    <Text key={s.id} className="text-[10px] text-gray-400">
                      {DAYS[s.day_of_week]} {String(s.start_time).slice(0, 5)} - {String(s.end_time).slice(0, 5)} · {s.venue}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </DashboardLayout>
  );
}
