# 🏫 AttendClass / AttendESP

<!-- ![AttendClass Banner](docs/banner.png) -->

[![React](https://img.shields.io/badge/Frontend-TanStack_Start-blue.svg)](https://tanstack.com/start)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green.svg)](https://supabase.com/)
[![ESP32](https://img.shields.io/badge/Hardware-ESP32-red.svg)](https://www.espressif.com/en/products/socs/esp32)
[![Build Android APK](https://github.com/Ayomide-16/AttendClass/actions/workflows/build-apk.yml/badge.svg)](https://github.com/Ayomide-16/AttendClass/actions/workflows/build-apk.yml)

**AttendClass** is a modern, full-stack attendance solution that combines biometric hardware with a cloud-native web ecosystem. Designed for university environments, it ensures high-integrity attendance tracking via 2FA (RFID + Fingerprint) and proximity-aware QR/BLE flows.

---

## 🚀 System Architecture

### 📟 AttendESP (Hardware)
- **Offline-First**: Reliable attendance capture to SD Card via FreeRTOS background tasks.
- **Biometric 2FA**: Strict verification using **MFRC522 RFID** and **Optical Fingerprint Sensors**.
- **Cloud Sync**: Proprietary CSV streaming from ESP32 to Supabase Edge Functions.
- **Smart UI**: Interactive SH1106 OLED display with an admin-driven menu system.

### 🌐 AttendClass Web (Software)
- **TanStack Start**: Next-generation React framework for type-safe routing and SSR.
- **Serverless Backend**: Powered entirely by **Supabase** (Postgres, Auth, and Deno Edge Functions).
- **Real-time Engine**: Live updates for lecturers and students as attendance is marked.
- **BLE Proximity**: Web-Bluetooth integration for secure, in-person check-ins.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, TanStack Router/Start, Tailwind CSS |
| **Backend** | Supabase Edge Functions (Deno), Supabase Auth |
| **Database** | PostgreSQL (Supabase) |
| **Hardware** | ESP32, C++/Arduino, FreeRTOS |
| **Connectivity** | Wi-Fi (HTTPS Sync), BLE (Proximity Check-in) |

---

## 📂 Repository Structure

- `ESP32_Firmware/`: Core firmware and specialized libraries for the AttendESP device.
- `WebApp/`: Modern TanStack Start web application and Supabase Edge Functions.
- `MobileApp/`: Expo-based React Native application for Android/iOS.

---

## 🛠️ Getting Started

### 💻 Web App Setup
1. **Clone & Install**:
   ```bash
   cd WebApp
   npm install
   ```
2. **Environment**: Configure `WebApp/.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. **Run**:
   ```bash
   npm run dev
   ```

### 📱 Mobile App Setup
1. **Environment**:
   ```bash
   cd MobileApp
   npm install
   ```
2. **Build APK**: The app is configured to build automatically on GitHub Actions. You can download the latest `.apk` from the **Actions** tab.
3. **Local Dev**:
   ```bash
   npx expo start
   ```

### 🔌 Hardware Setup
1. **Firmware**: Open `ESP32_Firmware/ESP32_Firmware.ino` in Arduino IDE or VS Code (PlatformIO).
2. **Dependencies**: Install `MFRC522`, `Adafruit_Fingerprint`, `ArduinoJson`, `Adafruit_SH110X`.
3. **Config**: Update `WIFI_SSID`, `WIFI_PASSWORD`, and `CLOUD_BASE_URL` in the source.
4. **Flash**: Upload to your ESP32 Dev Module.

---

## 🔄 Cloud Synchronization Workflow

AttendClass uses an efficient, low-RAM streaming protocol for hardware-to-cloud sync:
1. **Logging**: Hardware writes attendance entries to `attendance.csv` on the SD Card.
2. **Sync Mode**: Triggered via the Master Card admin menu (4 taps).
3. **Ingestion**: The ESP32 posts the raw CSV to the `/hardware-sync` Edge Function.
4. **Processing**: The cloud function parses data, validates the device key, and matches students to active course schedules based on WAT (UTC+1) time.
5. **Confirmation**: Local logs are purged only after a successful 200 OK from the cloud.

---

## 📄 Documentation
- [System Architecture](System_Architecture.md) - Deep dive into data flows and wiring.
- [User Manual](User_Manual.md) - Guide for lecturers and course representatives.

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
