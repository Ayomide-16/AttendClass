import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import { QrCode, Maximize2, X } from "lucide-react-native";

export function EspQrPanel({
  scheduleId,
  deviceId,
  courseCode,
}: {
  scheduleId: string;
  deviceId: string;
  courseCode: string;
}) {
  const [fullScreen, setFullScreen] = useState(false);

  const payloadB64 = useMemo(() => {
    const obj = {
      t: "qr_static",
      sid: scheduleId,
      did: deviceId,
      cc: courseCode,
      tk: `${scheduleId}:${deviceId}:${courseCode}`,
    };
    // Using global btoa (from polyfill)
    return btoa(JSON.stringify(obj));
  }, [scheduleId, deviceId, courseCode]);

  return (
    <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <QrCode size={20} color="#2563eb" />
          <Text className="ml-2 text-lg font-bold text-gray-900">Class QR</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setFullScreen(true)}
          className="p-2 bg-gray-50 rounded-lg"
        >
          <Maximize2 size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>
      
      <Text className="text-xs text-gray-500 mb-6">
        Project this QR so students can scan from their seats.
      </Text>

      <View className="items-center mb-6">
        <View className="p-4 bg-white border border-gray-50 rounded-2xl shadow-inner">
          <QRCode
            value={payloadB64}
            size={200}
            backgroundColor="white"
            color="black"
          />
        </View>
      </View>

      <View className="flex-row flex-wrap justify-between gap-2">
        <Badge label={`did: ${deviceId}`} />
        <Badge label={`cc: ${courseCode}`} />
        <Badge label={`sid: ${scheduleId}`} />
      </View>

      <Modal visible={fullScreen} animationType="slide">
        <View className="flex-1 bg-white items-center justify-center p-6">
          <TouchableOpacity 
            onPress={() => setFullScreen(false)}
            className="absolute top-12 right-6 p-2 bg-gray-100 rounded-full"
          >
            <X size={24} color="#000" />
          </TouchableOpacity>
          
          <Text className="text-xl font-bold mb-10 text-center">{courseCode} — Scan to check in</Text>
          
          <View className="p-6 bg-white border border-gray-50 rounded-3xl shadow-xl">
            <QRCode
              value={payloadB64}
              size={300}
              backgroundColor="white"
              color="black"
            />
          </View>
          
          <View className="mt-10">
            <Text className="text-gray-400 text-sm font-mono text-center">
              Device: {deviceId} · Schedule: {scheduleId}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md">
      <Text className="text-[10px] text-gray-500 font-mono text-center">{label}</Text>
    </View>
  );
}
