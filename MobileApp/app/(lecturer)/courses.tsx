import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../../components/DashboardLayout";
import { formatLoggedAt } from "../../lib/time";
import { ChevronRight, ChevronLeft } from "lucide-react-native";

type CourseRow = {
  id: string;
  course_code: string;
  course_name: string;
};

export default function LecturerCoursesPage() {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const coursesQuery = useQuery({
    queryKey: ["lecturer-courses-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, course_code, course_name")
        .eq("lecturer_id", user!.id)
        .order("course_code");
      if (error) throw error;
      return (data ?? []) as CourseRow[];
    },
  });

  useEffect(() => {
    if (!selectedCourseId && coursesQuery.data?.length) {
      setSelectedCourseId(coursesQuery.data[0].id);
    }
  }, [coursesQuery.data, selectedCourseId]);

  const attendanceQuery = useQuery({
    queryKey: ["lecturer-attendance-sheet", selectedCourseId],
    enabled: !!selectedCourseId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_logs")
        .select("id, student_id, matric_number, student_name, method, logged_at, raw_time, time_synced")
        .eq("course_id", selectedCourseId!)
        .order("logged_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const loading = coursesQuery.isLoading || attendanceQuery.isLoading;

  return (
    <DashboardLayout>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Course Records</Text>
        <Text className="text-sm text-gray-500">View and manage student attendance.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        {(coursesQuery.data ?? []).map((course) => {
          const active = selectedCourseId === course.id;
          return (
            <TouchableOpacity
              key={course.id}
              onPress={() => setSelectedCourseId(course.id)}
              className={`mr-3 px-6 py-3 rounded-2xl border ${active ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-100 shadow-sm'}`}
            >
              <Text className={`font-bold ${active ? 'text-white' : 'text-gray-900'}`}>{course.course_code}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color="#2563eb" />
      ) : (
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">Attendance Log</Text>
          {(attendanceQuery.data?.length ?? 0) === 0 ? (
            <Text className="text-xs text-gray-400 text-center py-4">No records found for this course.</Text>
          ) : (
            <View className="space-y-4">
              {attendanceQuery.data!.map((row: any) => (
                <View key={row.id} className="py-3 border-b border-gray-50">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-sm font-bold text-gray-800">{row.student_name}</Text>
                    <Text className="text-[10px] font-mono text-gray-400">{row.matric_number}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] text-gray-500">{formatLoggedAt(row.logged_at, row.raw_time)}</Text>
                    <View className={`px-2 py-0.5 rounded-full ${row.method === "2FA" ? 'bg-blue-100' : 'bg-purple-100'}`}>
                      <Text className={`text-[8px] font-bold ${row.method === "2FA" ? 'text-blue-700' : 'text-purple-700'}`}>{row.method}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </DashboardLayout>
  );
}
