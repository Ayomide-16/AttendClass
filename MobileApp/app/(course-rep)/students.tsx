import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../../components/DashboardLayout";
import { User, Search } from "lucide-react-native";
import { useState } from "react";

export default function CourseRepStudentsPage() {
  const [search, setSearch] = useState("");

  const students = useQuery({
    queryKey: ["all-students-list"],
    queryFn: async () => {
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");
      
      if (roleError) throw roleError;
      
      const ids = roles.map(r => r.user_id);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, matric_number, rfid_card_id, fingerprint_id")
        .in("id", ids)
        .order("full_name");
        
      if (error) throw error;
      return data ?? [];
    }
  });

  const filtered = (students.data ?? []).filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    s.matric_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Student Directory</Text>
        <Text className="text-sm text-gray-500">Manage all registered students.</Text>
      </View>

      <View className="flex-row items-center bg-white border border-gray-100 rounded-2xl px-4 py-2 mb-6 shadow-sm">
        <Search size={18} color="#9ca3af" />
        <TextInput 
          placeholder="Search by name or matric..."
          className="flex-1 ml-2 h-10 text-sm"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {students.isLoading ? (
        <ActivityIndicator color="#2563eb" />
      ) : (
        <View className="space-y-4">
          {filtered.length === 0 ? (
            <Text className="text-gray-400 text-center py-10">No students found.</Text>
          ) : (
            filtered.map((s) => (
              <View key={s.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row items-center">
                <View className="h-10 w-10 rounded-full bg-blue-100 items-center justify-center">
                  <User size={20} color="#2563eb" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="font-bold text-gray-900">{s.full_name}</Text>
                  <Text className="text-xs text-gray-500 font-mono">{s.matric_number}</Text>
                </View>
                <View className="items-end">
                  <View className={`px-2 py-0.5 rounded-full ${s.rfid_card_id ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Text className={`text-[8px] font-bold ${s.rfid_card_id ? 'text-green-700' : 'text-gray-400'}`}>
                      {s.rfid_card_id ? "RFID" : "NO RFID"}
                    </Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded-full mt-1 ${s.fingerprint_id ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Text className={`text-[8px] font-bold ${s.fingerprint_id ? 'text-green-700' : 'text-gray-400'}`}>
                      {s.fingerprint_id ? "FP" : "NO FP"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </DashboardLayout>
  );
}
