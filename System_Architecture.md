# AttendClass — Biometric Attendance System

## Architecture Overview

```
┌─────────────┐       WiFi / HTTPS        ┌──────────────────┐      ┌─────────────┐
│   ESP32      │ ────────────────────────▶│ Supabase Edge    │ ────▶│  Supabase   │
│  (Hardware)  │   POST /hardware-sync    │ Function (Deno)  │      │  Postgres   │
│              │   (CSV Streaming)        └──────────────────┘      └─────────────┘
│ RFID RC522   │                                  ▲                        │
│ R307 FP Sens │                                  │                        │
│ SH1106 OLED  │                                  │                        │
│ SD Card      │                                  │                        │
└─────────────┘                                  │ Realtime / Auth        │
                                                  │                        │
                                          ┌────────────────┐               │
                                          │  React Frontend│◀──────────────┘
                                          │ (TanStack Start)│
                                          └────────────────┘
```

## System Components

### 1. Hardware (AttendESP)
- **Role**: Capture biometric and RFID data offline, store locally on SD card, and sync to the cloud on demand.
- **Microcontroller**: ESP32 (Dual-Core).
- **Core 1 (Main)**: Handles UI (OLED), RFID reading, Fingerprint verification, and the Master Admin menu.
- **Core 0 (Background)**: Manages SD card logging (via FreeRTOS Queue) and NTP time synchronization.
- **Modes**:
    - `ATTENDANCE`: 2FA (RFID + Fingerprint) verification.
    - `ENROLLMENT`: Assigning hardware IDs to students.
    - `QR+BLE`: Proximity-based check-in using Bluetooth Low Energy.
    - `CLOUD SYNC`: Batch upload of offline CSV logs to Supabase.

### 2. Backend (Supabase)
- **Database**: PostgreSQL with tables for `profiles`, `courses`, `schedules`, `attendance_logs`, and `enrollment_records`.
- **Edge Functions**: 
    - `hardware-sync`: Specialized Deno function that parses raw CSV data from the ESP32, resolves student matrics, matches timestamps to active schedules (WAT UTC+1), and persists records.
- **Authentication**: Supabase Auth (Email/Matric based).

### 3. Frontend (AttendClass Web)
- **Framework**: TanStack Start (React + TypeScript).
- **Features**: 
    - Real-time dashboards for students and lecturers.
    - Role-based access control (RBAC).
    - Course and schedule management.
    - QR-BLE check-in interface for proximity verification.

---

## Data Flow: Cloud Sync

1. **Capture**: The ESP32 logs attendance to `/attendance.csv` on the SD card.
2. **Trigger**: Admin taps the master card 4 times to enter `CLOUD SYNC` mode.
3. **Transmit**: ESP32 connects to Wi-Fi and sends the CSV via `POST` to the Supabase Edge Function.
4. **Process**: The Edge Function:
   - Validates the `x-device-key`.
   - Parses the CSV.
   - Converts WAT timestamps to ISO.
   - Matches the entry to a student `profile` and an active `schedule`.
   - Inserts into `attendance_logs`.
5. **Clean**: On successful response (200 OK), the ESP32 deletes the local CSV to prevent duplicates.

---

## Setup Instructions

### Environment Configuration
Create a `.env` file in the `WebApp` directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
# Secret keys for Edge Functions (if running locally)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Running the Web App
```bash
cd WebApp
npm install
npm run dev
```

### Hardware Configuration
Update the following constants in `ESP32_Firmware/ESP32_Firmware.ino`:
- `WIFI_SSID` / `WIFI_PASSWORD`
- `CLOUD_BASE_URL` (Your Supabase Project URL)
- `DEVICE_KEY` (Must match the Edge Function secret)
