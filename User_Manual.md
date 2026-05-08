# AttendClass User Manual

This guide explains how to set up and use the AttendClass system. AttendClass is a modern attendance solution using ESP32 hardware and a Supabase-powered web application.

---

## 1. System Components

### Hardware (AttendESP)
- **ESP32 Unit**: The brain of the hardware, featuring an RFID reader, Fingerprint sensor, and OLED display.
- **SD Card**: Stores attendance and enrollment logs locally.
- **Admin Menu**: Controlled via a "Master Card" (RFID) using a tap-count system.

### Software (AttendClass Web)
- **Dashboard**: View live attendance, manage courses, and register students.
- **Cloud Backend**: Supabase handles the database, authentication, and hardware synchronization.

---

## 2. Quick Start

### Step 1: Set Up the Web Application
1. Open the `WebApp` folder in your terminal.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file with your Supabase credentials (see `.env.example`).
4. Start the development server:
   ```bash
   npm run dev
   ```

### Step 2: Prepare the ESP32 Hardware
1. Open `ESP32_Firmware/ESP32_Firmware.ino` in your Arduino IDE or VS Code (with PlatformIO).
2. Configure your Wi-Fi credentials and `CLOUD_BASE_URL` in the code.
3. Flash the firmware to your ESP32.
4. Ensure an SD card (formatted as FAT32) is inserted into the device.

---

## 3. Daily Operation

### Taking Attendance (2FA Mode)
1. Ensure the device is in **ATTENDANCE** mode (default).
2. The student taps their registered **RFID card**.
3. The student places their finger on the **fingerprint sensor**.
4. A success beep and green LED confirm the attendance is recorded to the SD card.

### Registering Students (Enrollment Mode)
1. Tap the **Master Card** twice to enter **ENROLLMENT** mode.
2. The OLED will show the name of the next student to be enrolled.
3. Tap the student's new **RFID card**.
4. Place the student's finger on the sensor twice when prompted.
5. The device saves the link to the SD card.

### Large Class Check-in (QR + BLE Mode)
1. Tap the **Master Card** three times to enter **QR+BLE** mode.
2. The OLED displays a unique QR code.
3. Students open the web app's QR Check-in page, scan the QR, and verify their proximity via Bluetooth.

### Syncing to the Cloud (Cloud Sync Mode)
1. Tap the **Master Card** four times to enter **CLOUD SYNC** mode.
2. The device connects to Wi-Fi and uploads all saved logs from the SD card to Supabase.
3. Once the sync is complete, the local logs are cleared to save space.

---

## 4. Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Wi-Fi Connection Failed** | Check SSID/Password in the firmware and ensure the router is in range. |
| **Sync Failed** | Ensure the `DEVICE_KEY` in the firmware matches the Supabase Edge Function secret. |
| **Fingerprint Not Recognized** | Ensure the sensor is clean and the student's finger is placed firmly. |
| **SD Card Error** | Ensure the card is FAT32 formatted and properly seated in the slot. |

---

## 5. Master Card Navigation
| Taps | Action |
| :--- | :--- |
| 1 Tap | **Attendance Mode** (Default) |
| 2 Taps | **Enrollment Mode** |
| 3 Taps | **QR + BLE Mode** |
| 4 Taps | **Cloud Sync Mode** |
| 5 Taps | **System Reset** (Warning: Erases local data) |
