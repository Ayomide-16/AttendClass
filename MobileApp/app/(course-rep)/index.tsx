import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../../components/DashboardLayout";
import { BookOpen, Users, Calendar, Plus } from "lucide-react-native";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function CourseRepDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const courses = useQuery({
    queryKey: ["all-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, course_code, course_name, lecturer_id, schedules(id, day_of_week, start_time, end_time, venue, device_id), course_enrollments(id)")
        .order("course_code");
      if (error) throw error;
      
      const courseRows = data as any[];
      const lecturerIds = Array.from(new Set(courseRows.map((course) => course.lecturer_id).filter(Boolean))) as string[];
      
      const { data: lecturersResult, error: lecturersError } = lecturerIds.length
        ? await supabase
            .from("profiles")
            .select("id, full_name, matric_number")
            .in("id", lecturerIds)
        : { data: [], error: null };

      if (lecturersError) throw lecturersError;

      const lecturerMap = new Map((lecturersResult ?? []).map((lecturer) => [lecturer.id, lecturer]));

      return courseRows.map((course) => ({
        ...course,
        lecturer: course.lecturer_id ? lecturerMap.get(course.lecturer_id) ?? null : null,
      }));
    },
  });

  const studentsCount = useQuery({
    queryKey: ["students-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student");
      return count ?? 0;
    },
  });

  const totalSchedules = (courses.data ?? []).reduce(
    (n: number, c: any) => n + (c.schedules?.length ?? 0),
    0,
  );

  return (
    <DashboardLayout>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Course Rep Dashboard</Text>
        <Text className="text-sm text-gray-500">Manage courses and schedules.</Text>
      </View>

      <View className="flex-row justify-between mb-6">
        <StatCard icon={BookOpen} label="Courses" value={courses.data?.length ?? 0} />
        <StatCard icon={Users} label="Students" value={studentsCount.data ?? 0} color="#16a34a" />
        <StatCard icon={Calendar} label="Schedules" value={totalSchedules} color="#2563eb" />
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-lg font-bold text-gray-900">Courses</Text>
          <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-xl flex-row items-center">
            <Plus size={16} color="white" />
            <Text className="text-white font-bold ml-1">New</Text>
          </TouchableOpacity>
        </View>

        {courses.isLoading ? (
          <ActivityIndicator color="#2563eb" />
        ) : (
          <View className="space-y-4">
            {courses.data!.map((c: any) => (
              <View key={c.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="font-bold text-gray-900">{c.course_code}</Text>
                    <Text className="text-xs text-gray-500">{c.course_name}</Text>
                  </View>
                  <TouchableOpacity className="bg-white border border-gray-100 px-3 py-1 rounded-lg">
                    <Text className="text-[10px] font-bold text-gray-700">Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-[10px] text-gray-400 mb-2">
                  Lecturer: {c.lecturer?.full_name || "Unassigned"} • {c.course_enrollments?.length || 0} Students
                </Text>
                
                <View className="mt-2 border-t border-gray-100 pt-2">
                  {c.schedules?.map((s: any) => (
                    <View key={s.id} className="flex-row justify-between py-1">
                      <Text className="text-[10px] text-gray-500">{DAYS[s.day_of_week]} {s.start_time.slice(0, 5)}-{s.end_time.slice(0, 5)}</Text>
                      <Text className="text-[10px] text-gray-400">{s.venue}</Text>
                    </View>
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

function StatCard({ icon: Icon, label, value, color = "#2563eb" }: any) {
  return (
    <View className="flex-1 mx-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 items-center">
      <Icon size={20} color={color} />
      <Text className="text-xl font-bold text-gray-900 mt-1">{value}</Text>
      <Text className="text-[10px] text-gray-500 uppercase font-bold">{label}</Text>
    </View>
  );
}
