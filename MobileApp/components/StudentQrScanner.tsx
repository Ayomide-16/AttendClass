import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BleManager, Device } from 'react-native-ble-plx';
import { useAuth } from '../contexts/AuthContext';
import { ScanLine, Camera as CameraIcon, Bluetooth, CheckCircle2, XCircle, Loader2 } from 'lucide-react-native';
import { Buffer } from 'buffer';

const BLE_SERVICE_UUID = "4e67a100-1234-5678-abcd-0123456789ab";
const BLE_WRITE_CHAR_UUID = "4e67a101-1234-5678-abcd-0123456789ab";
const BLE_NOTIFY_CHAR_UUID = "4e67a102-1234-5678-abcd-0123456789ab";
const BLE_DEVICE_NAME_PREFIX = "AttendESP_";

type QrPayload = {
  t: string;
  sid: string;
  did: string;
  cc: string;
  tk: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "scanning" }
  | { kind: "decoding" }
  | { kind: "connecting"; payload: QrPayload }
  | { kind: "sending"; payload: QrPayload }
  | { kind: "waiting"; payload: QrPayload }
  | { kind: "success"; message: string; payload: QrPayload }
  | { kind: "error"; message: string };

const manager = new BleManager();

export function StudentQrScanner() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [permission, requestPermission] = useCameraPermissions();
  const scanningRef = useRef(false);

  useEffect(() => {
    return () => {
      manager.stopDeviceScan();
    };
  }, []);

  function decodeQr(raw: string): QrPayload | null {
    try {
      let token = raw.trim();
      const m = token.match(/[?&]payload=([^&]+)/);
      if (m) token = decodeURIComponent(m[1]);
      const json = Buffer.from(token, 'base64').toString();
      const obj = JSON.parse(json);
      if (obj && obj.t === "qr_static") return obj as QrPayload;
      return null;
    } catch {
      return null;
    }
  }

  function friendlyEspMessage(resp: string): { ok: boolean; message: string } {
    if (resp === "OK:BLE_NEAR") return { ok: true, message: "Attendance recorded." };
    if (resp === "ERROR:OUT_OF_RANGE") return { ok: false, message: "Move closer to the device." };
    if (resp === "ERROR:QR_TOKEN_INVALID") return { ok: false, message: "Invalid QR code." };
    return { ok: false, message: `Device error: ${resp}` };
  }

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanningRef.current || status.kind !== "scanning") return;
    scanningRef.current = true;
    
    const payload = decodeQr(data);
    if (!payload) {
      Alert.alert("Invalid QR", "That doesn't look like an AttendESP code.");
      scanningRef.current = false;
      return;
    }

    setStatus({ kind: "connecting", payload });
    connectAndSend(payload);
  }

  async function connectAndSend(payload: QrPayload) {
    let targetDevice: Device | null = null;

    manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        setStatus({ kind: "error", message: error.message });
        manager.stopDeviceScan();
        return;
      }

      if (device?.name?.startsWith(BLE_DEVICE_NAME_PREFIX)) {
        manager.stopDeviceScan();
        targetDevice = device;
        
        try {
          const connectedDevice = await device.connect();
          await connectedDevice.discoverAllServicesAndCharacteristics();
          
          setStatus({ kind: "sending", payload });
          
          const body = JSON.stringify({
            student_id: user!.matric_number,
            rssi: -60,
            qr_payload: payload,
          });
          
          const base64Body = Buffer.from(body).toString('base64');
          
          // Setup listener
          connectedDevice.monitorCharacteristicForService(
            BLE_SERVICE_UUID,
            BLE_NOTIFY_CHAR_UUID,
            (error, characteristic) => {
              if (error) {
                setStatus({ kind: "error", message: error.message });
                return;
              }
              if (characteristic?.value) {
                const resp = Buffer.from(characteristic.value, 'base64').toString();
                const { ok, message } = friendlyEspMessage(resp.trim());
                if (ok) setStatus({ kind: "success", message, payload });
                else setStatus({ kind: "error", message });
                connectedDevice.cancelConnection();
              }
            }
          );

          await connectedDevice.writeCharacteristicWithResponseForService(
            BLE_SERVICE_UUID,
            BLE_WRITE_CHAR_UUID,
            base64Body
          );
          
          setStatus({ kind: "waiting", payload });

        } catch (e: any) {
          setStatus({ kind: "error", message: e.message });
        }
      }
    });

    // Timeout if no device found
    setTimeout(() => {
      if (status.kind === "connecting") {
        manager.stopDeviceScan();
        setStatus({ kind: "error", message: "Device not found. Move closer." });
      }
    }, 15000);
  }

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View className="p-6 items-center">
        <Text className="text-center mb-4">We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-blue-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <View className="flex-row items-center mb-4">
        <ScanLine size={20} color="#2563eb" />
        <Text className="ml-2 text-lg font-bold">Check-in Scanner</Text>
      </View>

      {status.kind === "idle" && (
        <View className="items-center py-6">
          <CameraIcon size={48} color="#9ca3af" />
          <Text className="text-gray-500 text-center mt-4 mb-6">
            Scan the QR on the device OLED to verify your presence.
          </Text>
          <TouchableOpacity 
            onPress={() => setStatus({ kind: "scanning" })}
            className="bg-blue-600 px-8 py-4 rounded-2xl flex-row items-center"
          >
            <CameraIcon size={20} color="white" />
            <Text className="text-white font-bold ml-2">Start Scanner</Text>
          </TouchableOpacity>
        </View>
      )}

      {status.kind === "scanning" && (
        <View className="h-64 rounded-2xl overflow-hidden bg-black">
          <CameraView
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity 
            onPress={() => setStatus({ kind: "idle" })}
            className="absolute bottom-4 right-4 bg-white/20 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-bold">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {(status.kind === "connecting" || status.kind === "sending" || status.kind === "waiting") && (
        <View className="items-center py-10">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-gray-900 font-bold mt-4">
            {status.kind === "connecting" ? "Finding Device..." : 
             status.kind === "sending" ? "Sending Check-in..." : 
             "Waiting for Device..."}
          </Text>
          <Text className="text-gray-500 text-xs mt-2">Keep your phone close to the AttendESP</Text>
        </View>
      )}

      {status.kind === "success" && (
        <View className="bg-green-50 border border-green-100 rounded-2xl p-6 items-center">
          <CheckCircle2 size={48} color="#16a34a" />
          <Text className="text-green-800 font-bold mt-4 text-center">{status.message}</Text>
          <Text className="text-green-600 text-xs mt-1">{status.payload.cc} • {status.payload.did}</Text>
          <TouchableOpacity 
            onPress={() => setStatus({ kind: "idle" })}
            className="mt-6 bg-green-600 px-6 py-2 rounded-xl"
          >
            <Text className="text-white font-bold">Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {status.kind === "error" && (
        <View className="bg-red-50 border border-red-100 rounded-2xl p-6 items-center">
          <XCircle size={48} color="#dc2626" />
          <Text className="text-red-800 font-bold mt-4 text-center">{status.message}</Text>
          <TouchableOpacity 
            onPress={() => setStatus({ kind: "idle" })}
            className="mt-6 bg-red-600 px-6 py-2 rounded-xl"
          >
            <Text className="text-white font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
