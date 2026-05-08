import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../../components/DashboardLayout";
import { formatLoggedAt } from "../../lib/time";

type CourseRow = {
  id: string;
  course_code: string;
  course_name: string;
};

type AttendanceRow = {
  id: string;
  method: string | null;
  logged_at: string | null;
  raw_time: string | null;
  time_synced: boolean;
  course_id: string | null;
};

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const enrollments = useQuery({
    queryKey: ["student-enrollments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("course:courses(id, course_code, course_name)")
        .eq("student_id", user!.id);
      if (error) throw error;
      const rows = (data ?? [])
        .map((entry: any) => entry.course as CourseRow | null)
        .filter((course: CourseRow | null): course is CourseRow => !!course)
        .sort((left, right) => left.course_code.localeCompare(right.course_code));
      return rows;
    },
  });

  const attendance = useQuery({
    queryKey: ["student-attendance", user?.matric_number],
    enabled: !!user?.matric_number,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_logs")
        .select("id, method, logged_at, raw_time, time_synced, course_id")
        .eq("matric_number", user!.matric_number!)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as AttendanceRow[];
    },
  });

  useEffect(() => {
    if (selectedCourseId) return;
    const firstCourseId = enrollments.data?.[0]?.id ?? null;
    if (firstCourseId) setSelectedCourseId(firstCourseId);
  }, [enrollments.data, selectedCourseId]);

  const totalsByCourse = useMemo(() => {
    const map = new Map<string, { total: number; latest: string | null }>();
    for (const row of attendance.data ?? []) {
      if (!row.course_id) continue;
      const current = map.get(row.course_id) ?? { total: 0, latest: null };
      current.total += 1;
      const stamp = row.logged_at ?? row.raw_time ?? null;
      if (stamp && (!current.latest || new Date(stamp).getTime() > new Date(current.latest).getTime())) {
        current.latest = stamp;
      }
      map.set(row.course_id, current);
    }
    return map;
  }, [attendance.data]);

  const selectedCourse = useMemo(
    () => (enrollments.data ?? []).find((course) => course.id === selectedCourseId) ?? null,
    [enrollments.data, selectedCourseId],
  );

  const selectedRows = useMemo(
    () => (attendance.data ?? []).filter((row) => row.course_id === selectedCourseId),
    [attendance.data, selectedCourseId],
  );

  const selectedStats = useMemo(() => {
    let twoFactor = 0;
    let qrBle = 0;
    for (const row of selectedRows) {
      const normalized = (row.method ?? "").toUpperCase();
      if (normalized === "2FA") twoFactor += 1;
      if (normalized === "QR_BLE") qrBle += 1;
    }
    const latest = selectedRows[0]?.logged_at ?? selectedRows[0]?.raw_time ?? null;
    return {
      total: selectedRows.length,
      twoFactor,
      qrBle,
      latest,
      synced: selectedRows.filter((row) => !!row.time_synced).length,
    };
  }, [selectedRows]);

  const loading = enrollments.isLoading || attendance.isLoading;

  return (
    <DashboardLayout>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">My Courses</Text>
        <Text className="text-sm text-gray-500">Detailed attendance per course.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#2563eb" />
      ) : (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {(enrollments.data ?? []).map((course) => {
              const active = selectedCourseId === course.id;
              return (
                <TouchableOpacity
                  key={course.id}
                  onPress={() => setSelectedCourseId(course.id)}
                  className={`mr-3 px-6 py-3 rounded-2xl border ${active ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-100 shadow-sm'}`}
                >
                  <Text className={`font-bold ${active ? 'text-white' : 'text-gray-900'}`}>{course.course_code}</Text>
                  <Text className={`text-[10px] ${active ? 'text-blue-100' : 'text-gray-400'}`}>{course.course_name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedCourse && (
            <View className="space-y-6">
              <View className="flex-row flex-wrap justify-between gap-2">
                <StatPill label="Total" value={selectedStats.total} />
                <StatPill label="2FA" value={selectedStats.twoFactor} />
                <StatPill label="QR+BLE" value={selectedStats.qrBle} />
                <StatPill label="Synced" value={selectedStats.synced} />
              </View>

              <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Text className="text-lg font-bold text-gray-900 mb-4">Records</Text>
                {selectedRows.length === 0 ? (
                  <Text className="text-xs text-gray-400 text-center py-4">No records for this course.</Text>
                ) : (
                  <View className="space-y-4">
                    {selectedRows.map((row) => (
                      <View key={row.id} className="flex-row justify-between items-center py-3 border-b border-gray-50">
                        <View>
                          <Text className="text-[10px] font-mono text-gray-500">{formatLoggedAt(row.logged_at, row.raw_time)}</Text>
                          <View className={`mt-1 px-2 py-0.5 rounded-full self-start ${row.method === "2FA" ? 'bg-blue-100' : 'bg-purple-100'}`}>
                            <Text className={`text-[8px] font-bold ${row.method === "2FA" ? 'text-blue-700' : 'text-purple-700'}`}>{row.method}</Text>
                          </View>
                        </View>
                        <View className={`px-2 py-1 rounded-full ${row.time_synced ? 'bg-green-100' : 'bg-amber-100'}`}>
                          <Text className={`text-[10px] font-bold ${row.time_synced ? 'text-green-700' : 'text-amber-700'}`}>
                            {row.time_synced ? "Present" : "Pending"}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      )}
    </DashboardLayout>
  );
}

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <View className="flex-1 min-w-[80px] bg-white border border-gray-100 rounded-xl p-3 shadow-sm items-center">
      <Text className="text-[8px] text-gray-400 uppercase font-bold">{label}</Text>
      <Text className="text-sm font-bold text-gray-900 mt-1">{value}</Text>
    </View>
  );
}
