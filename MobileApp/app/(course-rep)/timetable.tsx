import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Calendar, Clock, MapPin } from "lucide-react-native";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function CourseRepTimetablePage() {
  const schedules = useQuery({
    queryKey: ["all-schedules-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select("*, course:courses(course_code, course_name)")
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });
        
      if (error) throw error;
      return data ?? [];
    }
  });

  return (
    <DashboardLayout>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Weekly Timetable</Text>
        <Text className="text-sm text-gray-500">Manage all class sessions.</Text>
      </View>

      {schedules.isLoading ? (
        <ActivityIndicator color="#2563eb" />
      ) : (
        <View className="space-y-6">
          {DAYS.map((dayName, dayIndex) => {
            const daySchedules = (schedules.data ?? []).filter(s => s.day_of_week === dayIndex);
            if (daySchedules.length === 0) return null;
            
            return (
              <View key={dayName}>
                <Text className="text-sm font-bold text-gray-400 uppercase mb-3 ml-1">{dayName}</Text>
                <View className="space-y-3">
                  {daySchedules.map((s) => (
                    <View key={s.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                          <Text className="font-bold text-gray-900">{s.course?.course_code}</Text>
                          <Text className="text-xs text-gray-500">{s.course?.course_name}</Text>
                        </View>
                        <View className="bg-blue-50 px-2 py-1 rounded-lg">
                          <Text className="text-[10px] font-bold text-blue-600">{s.device_id}</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center mt-2">
                        <Clock size={12} color="#9ca3af" />
                        <Text className="text-[10px] text-gray-500 ml-1">
                          {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                        </Text>
                        <View className="w-4" />
                        <MapPin size={12} color="#9ca3af" />
                        <Text className="text-[10px] text-gray-500 ml-1">{s.venue}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
          {(schedules.data?.length ?? 0) === 0 && (
            <Text className="text-gray-400 text-center py-10">No schedules configured.</Text>
          )}
        </View>
      )}
    </DashboardLayout>
  );
}
