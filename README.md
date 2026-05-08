# 🏫 AttendClass / AttendESP

<!-- ![AttendClass Banner](docs/banner.png) -->

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React-blue.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green.svg)](https://supabase.com/)
[![ESP32](https://img.shields.io/badge/Hardware-ESP32-red.svg)](https://www.espressif.com/en/products/socs/esp32)

**AttendClass** is a state-of-the-art dual-architecture attendance system designed for modern university classrooms. It bridges the gap between physical classroom presence and digital record-keeping through custom ESP32 hardware and a robust web application ecosystem.

---

## 🚀 Key Features

### 🛠️ Hardware (AttendESP)
- **Biometric Security**: Strict 2FA check-in using **RFID** and **Fingerprint** verification.
- **Proximity Detection**: Proximity-aware entry via **BLE** and **QR Codes**.
- **Offline Resilience**: Automatic logging to **SD Card** ensures data integrity even during network outages.
- **OLED Interface**: Real-time feedback and menu navigation on a SH1106 display.

### 🌐 Web Ecosystem (WebApp)
- **Real-time Dashboard**: Live monitoring of classroom attendance for students, lecturers, and reps.
- **Hybrid Backend**: Supports both local storage (JSON/SQLite) and cloud integration (**Supabase**).
- **Secure Sync**: Proprietary HTTPS-based CSV streaming from hardware to cloud.
- **Role-Based Access**: Specialized interfaces for Students, Lecturers, and Course Representatives.

## 🛠️ Technology Stack

### 📱 Frontend & Web
- **React 18** + **TypeScript**
- **TanStack Router** (File-based routing)
- **Tailwind CSS** + **Shadcn UI** (Modern styling)
- **Vite** (Next-gen frontend tooling)

### ⚙️ Backend & Database
- **Supabase** (Auth, Database, Storage)
- **Node.js** + **Express** (Middleware sync API)
- **JWT** (Secure authentication)

### 📟 Embedded Systems (Hardware)
- **ESP32** (Core microcontroller)
- **FreeRTOS** (Dual-core task management)
- **MFRC522** (RFID interface)
- **Adafruit Fingerprint Sensor**
- **SH1106** (OLED display controller)

---

## 📂 Repository Structure

| Directory | Description |
| :--- | :--- |
| `ESP32_Firmware/` | ESP32 C++/Arduino firmware and libraries. |
| `WebApp/` | TanStack-powered React frontend & Express backend. |
| `MobileApp/` | (Work in Progress) Mobile companion application. |

---

## 🛠️ Getting Started

### 🔌 Hardware Setup
1. **Components**: ESP32, MFRC522 RFID, Adafruit Fingerprint Sensor, SD Module, SH1106 OLED.
2. **Firmware**: Open `ESP32_Firmware/sketch_may3a.ino` in Arduino IDE or PlatformIO.
3. **Libraries**: Install `MFRC522`, `Adafruit_Fingerprint`, `ArduinoJson`, `Adafruit_SH110X`.
4. **Flash**: Update Wi-Fi/API credentials in the code and upload to your ESP32.

### 💻 Web Application
1. **Install**:
   ```bash
   cd WebApp
   npm install
   ```
2. **Environment**: Configure `.env` with your Supabase credentials (see `.env.example`).
3. **Run**:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3002`

---

## 🔄 Cloud Synchronization Architecture

The system uses a custom streaming protocol to upload logs from the ESP32 to the cloud without exhausting the device's limited RAM:
1. **Collection**: Attendance is logged locally to `/attendance.csv` on the SD Card.
2. **Authorization**: Device authenticates via a unique `x-device-key` header.
3. **Streaming**: Files are streamed directly from SD to the `/api/sync/hardware` endpoint.
4. **Validation**: Upon successful 200 OK, the device clears the local cache to prevent duplicates.

---

## 📄 Documentation
- [User Manual](User_Manual.md)
- [System Architecture](README_SYSTEM.md) (if available)

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
