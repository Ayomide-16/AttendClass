# AttendClass User Manual

This guide explains how to set up, start, and use the AttendClass system without needing deep technical knowledge.

AttendClass has two parts:

- The ESP32 hardware unit that reads RFID cards, fingerprints, and stores attendance on an SD card.
- The web app and backend that manage students, courses, attendance records, and cloud sync.

If you only read one section, read the Quick Start first.

## 1. What You Need

### Hardware

- ESP32 development board
- RFID reader module
- Fingerprint sensor
- OLED display
- SD card module with SD card
- Buzzer
- Green and red LEDs
- RFID card or tag for the admin/master flow

### Software

- VS Code
- PlatformIO extension for flashing the ESP32
- Node.js and pnpm for the web app
- A browser for the dashboard
- A Supabase account if you want cloud storage

### Network

- A Wi-Fi network that both the laptop and ESP32 can join
- For local testing, the laptop running the backend must stay on the same network as the ESP32

## 2. How the System Works

The system uses this flow:

1. A student taps a card or scans a QR code.
2. The ESP32 checks identity using RFID and fingerprint or QR plus BLE.
3. The ESP32 saves the record to the SD card.
4. Later, the ESP32 uploads the CSV log to the backend.
5. The backend stores the data in Supabase or local storage depending on mode.

The system supports four main modes on the ESP32:

- Attendance mode: normal RFID plus fingerprint check-in
- Enrollment mode: link a student to an RFID card and fingerprint
- QR plus BLE mode: proximity-based QR check-in for fast classroom attendance
- Cloud Sync mode: upload the SD card CSV files to the backend

## 3. Quick Start

Follow these steps in order.

### Step 1: Prepare the backend

1. Open a terminal in the `WEBAPP` folder.
2. Install dependencies if needed:

```bash
pnpm i
```

3. Make sure `WEBAPP/.env` is set the way you want:
   - `MODE=online` for Supabase
   - `MODE=offline` for local storage

4. Start the backend:

```bash
npm run dev
```

This starts the backend on port `3002` and the frontend on port `5173`.

### Step 2: Prepare the ESP32 firmware

1. Open `ESP_CODE/` in VS Code with PlatformIO installed.
2. Confirm the board is `esp32dev`.
3. Confirm the build flags in `ESP_CODE/platformio.ini`.
4. Flash the ESP32.
5. Open the serial monitor at `115200` baud.

### Step 3: Put the ESP32 and laptop on the same Wi-Fi network

The ESP32 and the laptop running the backend must be on the same network for local testing.

### Step 4: Test the hardware

1. Wait for the ESP32 to boot.
2. Check the OLED for startup messages.
3. Tap the master card to open the admin menu.
4. Use the tap counts to choose a mode.

## 4. Hardware Wiring

Use the pin mapping below.

| Component | ESP32 Pin |
|---|---|
| OLED SDA | GPIO 21 |
| OLED SCL | GPIO 22 |
| RFID SCK | GPIO 18 |
| RFID MISO | GPIO 19 |
| RFID MOSI | GPIO 23 |
| RFID CS | GPIO 5 |
| SD SCK | GPIO 14 |
| SD MISO | GPIO 35 |
| SD MOSI | GPIO 13 |
| SD CS | GPIO 27 |
| Fingerprint RX | GPIO 32 |
| Fingerprint TX | GPIO 33 |
| Green LED | GPIO 4 |
| Red LED | GPIO 26 |
| Buzzer | GPIO 16 |

### Wiring Tips

- Check power carefully. Most module problems are caused by wrong power or ground connections.
- Keep the RFID reader wiring short if possible.
- Make sure the SD card module is inserted correctly and formatted as FAT32.
- If the display stays blank, check the I2C wiring first.

## 5. ESP32 Setup

The firmware is in:

- [ESP_CODE/AttendanceSystem/AttendanceSystem.ino](ESP_CODE/AttendanceSystem/AttendanceSystem.ino)

The build settings are in:

- [ESP_CODE/platformio.ini](ESP_CODE/platformio.ini)

### Current build values

The project is currently configured for local testing with:

- Wi-Fi name: TECNO SPARK 40 Pro
- Wi-Fi password: 12345678
- Backend URL: http://10.1.1.254:3002

If you later move to a hosted server, change the backend URL in `ESP_CODE/platformio.ini` and flash the ESP32 again.

### What the ESP32 stores on the SD card

- `/attendance.csv`
- `/enrollment.csv`
- `/TestingGroup8StudentDatabase.json`

## 6. How to Flash the ESP32

### PlatformIO

1. Open the `ESP_CODE` folder.
2. Wait for PlatformIO to finish loading libraries.
3. Connect the ESP32 by USB.
4. Click Upload.
5. Open the serial monitor.

### What to look for after flashing

- The board should boot normally.
- The OLED should show a boot or ready message.
- The SD card should initialize.
- The fingerprint sensor should be detected.
- The Wi-Fi task should attempt to connect in the background.

## 7. Web App Setup

The web app lives in:

- `WEBAPP/`

### Install dependencies

```bash
cd WEBAPP
pnpm i
```

### Environment mode

Open `WEBAPP/.env` and confirm the mode you want:

- `MODE=online` means the backend uses Supabase
- `MODE=offline` means the backend uses local storage

### Starting the app

```bash
npm run dev
```

This starts:

- Backend API on `http://localhost:3002`
- Frontend on `http://localhost:5173`

## 8. Supabase Setup

If you are using online mode:

1. Open Supabase Dashboard.
2. Go to SQL Editor.
3. Run [WEBAPP/server/db/supabase_schema.sql](WEBAPP/server/db/supabase_schema.sql).
4. If you see a warning about Row Level Security, choose the option that enables RLS.
5. Wait for the query to finish successfully.

If the schema has already been run, do not worry. The file has been made rerunnable.

## 9. Daily Use

This section explains how to use the system during normal operation.

### A. Attendance Mode

This is the normal classroom mode.

What the student does:

1. Tap RFID card.
2. Place finger on the sensor.
3. Wait for the success message.

What the system does:

- Checks card ownership
- Checks fingerprint match
- Saves the attendance to SD card
- Later uploads it during sync

### B. Enrollment Mode

Use this when registering a student card and fingerprint.

What to do:

1. Tap the master card twice to open Enrollment mode.
2. The OLED shows the next student to enroll.
3. Tap a new RFID card for that student.
4. Place the finger when prompted.
5. The system saves the RFID and fingerprint link.

If you want to skip a student and move to the next one, follow the on-screen prompt.

### C. QR plus BLE Mode

Use this for fast attendance in a large classroom.

What happens:

1. Tap the master card three times.
2. The ESP32 shows a QR code.
3. The student opens the web app QR check-in page.
4. The student scans the QR and accepts Bluetooth pairing if prompted.
5. The backend validates proximity and records attendance.

### D. Cloud Sync Mode

Use this to upload saved SD card logs to the backend.

What to do:

1. Tap the master card four times.
2. The ESP32 connects to Wi-Fi.
3. It uploads attendance and enrollment CSV files.
4. On success, the files are removed from the SD card.

## 10. Master Card Menu

The master card is the admin card that controls the ESP32 modes.

| Taps | Result |
|---|---|
| 1 tap or timeout | Attendance mode |
| 2 taps | Enrollment mode |
| 3 taps | QR plus BLE mode |
| 4 taps | Cloud Sync mode |
| 5 or more taps | Wipe system confirmation |

### Wipe System Warning

The wipe option is dangerous. It can clear stored links and fingerprint data. Only use it if you are sure.

## 11. OLED Messages You May See

| Message | Meaning |
|---|---|
| SYSTEM READY | The board is ready for normal use |
| ENROLL | The board is waiting for a card and fingerprint |
| CLOUD SYNC | The board is connecting to Wi-Fi or uploading files |
| UPLOADING LOGS | A CSV file is being sent to the backend |
| SYNC COMPLETE | Upload succeeded |
| SYNC FAILED | Upload failed and should be checked |
| ACCESS DENIED | A card or fingerprint did not match |
| RADIO BUSY | The board is still switching wireless modes |

## 12. What Happens Behind the Scenes

You do not need to manage this during normal use, but it helps to know:

- Attendance records are written to the SD card first.
- The ESP32 later uploads the CSV files to the backend.
- The backend writes data into Supabase or local storage.
- The web dashboard reads from the same backend data.

This design means attendance is not lost just because the network drops for a moment.

## 13. How to Switch From Local Testing to Hosting Later

When you are ready to host the backend online:

1. Deploy the Node backend to a public server.
2. Get the final backend domain or API URL.
3. Update `CLOUD_URL_VALUE` in `ESP_CODE/platformio.ini`.
4. Rebuild and flash the ESP32 once.

After that, the ESP32 will use the hosted backend instead of the local laptop.

## 14. Troubleshooting

### The ESP32 will not connect to Wi-Fi

Check these first:

- The Wi-Fi name is correct.
- The password is correct.
- The ESP32 is within range of the router or hotspot.
- The network is not blocking local devices from talking to each other.

### The backend does not receive uploads

Check these first:

- The backend is running on the laptop.
- The backend URL in the ESP32 build is correct.
- The laptop and ESP32 are on the same network.
- The device key matches on both sides.

### The OLED stays blank

Check:

- OLED power and ground
- SDA and SCL wiring
- The display address in the firmware

### The fingerprint sensor is not found

Check:

- Power and ground
- RX and TX wiring
- Sensor baud rate and wiring orientation

### The SD card is not detected

Check:

- FAT32 format
- Card seated correctly
- CS/SCK/MISO/MOSI wiring

### Upload works, but data does not appear in the dashboard

Check:

- The backend is using the correct database mode
- Supabase schema was run successfully
- The dashboard is pointed at the same backend

## 15. Safe Usage Notes

- Do not remove power while the ESP32 is writing to the SD card.
- Do not use the wipe mode unless you are intentionally resetting the device.
- Keep backups of your student list and database configuration.
- If you change network settings, reflash the ESP32.

## 16. Files to Know

- [ESP_CODE/AttendanceSystem/AttendanceSystem.ino](ESP_CODE/AttendanceSystem/AttendanceSystem.ino)
- [ESP_CODE/platformio.ini](ESP_CODE/platformio.ini)
- [WEBAPP/.env](WEBAPP/.env)
- [WEBAPP/server/db/supabase_schema.sql](WEBAPP/server/db/supabase_schema.sql)
- [README_SYSTEM.md](README_SYSTEM.md)

## 17. Short Version

If you only remember five things:

1. Start the backend first.
2. Put the ESP32 and laptop on the same Wi-Fi.
3. Flash the ESP32.
4. Use the master card taps to choose a mode.
5. Tap 4 times for cloud sync when you want to upload SD card logs.

## 18. Support Checklist

Before asking for help, note:

- What mode the ESP32 was in
- What the OLED displayed
- Whether the serial monitor showed an error
- Whether the laptop backend was running
- Whether the Wi-Fi network name and password were correct
