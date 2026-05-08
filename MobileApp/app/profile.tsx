import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { DashboardLayout } from "../components/DashboardLayout";

export default function Profile() {
  const { user, signOut } = useAuth();

  return (
    <DashboardLayout>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
        <Text className="text-sm text-gray-500">Manage your account.</Text>
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <Text className="text-lg font-bold text-gray-900 mb-4">Account Information</Text>
        <View className="space-y-4">
          <Field label="Full Name" value={user?.full_name || "—"} />
          <Field label="Matric Number" value={user?.matric_number || "—"} mono />
          <Field label="Role" value={user?.role?.replace("_", " ").toUpperCase() || "—"} />
          <Field label="RFID Card" value={user?.rfid_card_id || "Not enrolled"} mono />
          <Field label="Fingerprint ID" value={user?.fingerprint_id?.toString() || "Not enrolled"} />
        </View>
      </View>

      <TouchableOpacity 
        onPress={signOut}
        className="bg-red-50 border border-red-100 p-4 rounded-2xl items-center"
      >
        <Text className="text-red-600 font-bold">Sign Out</Text>
      </TouchableOpacity>
    </DashboardLayout>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View className="flex-row justify-between py-3 border-b border-gray-50 last:border-0">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className={`text-sm font-bold text-gray-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</Text>
    </View>
  );
}
