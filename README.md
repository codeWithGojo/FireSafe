# IoT-Based Smart Fire and Gas Detection System — Source Code

**Team:**
- Raji Ibrahim Ajibola (BU22SEN1033)
- Imegu Favour (BU22CSC1127)

**Supervisor:** Mr. Oyebade

---

## Project Structure

```
FireSafeApp_Source/
├── backend/            Python Flask REST API server
│   ├── app.py
│   └── requirements.txt
├── mobile/             React Native (Expo) mobile application
│   └── app/tabs/
│       ├── index.tsx       Dashboard screen
│       ├── explore.tsx     Alerts History screen
│       ├── settings.tsx    Settings screen
│       ├── about.tsx       About screen
│       └── _layout.tsx     Tab navigation
└── firmware/           ESP32 Arduino firmware
    └── FireSafe_ESP32.ino
```

---

## System Architecture

```
ESP32 (sensors) → Flask Backend → Supabase Database → React Native App
```

The ESP32 reads temperature (DHT11) and gas level (MQ-2) every 5 seconds and
sends the data via WiFi (HTTP POST) to the Flask backend. Flask stores each
reading in the Supabase cloud database and dispatches push notifications when
gas thresholds are exceeded. The React Native mobile application reads the
latest data from Supabase and displays it on a live dashboard.

---

## Setup Instructions

### 1. Backend (Flask)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python app.py
```

Update `SUPABASE_URL` and `SUPABASE_KEY` in `app.py` with your Supabase project
credentials.

### 2. Mobile App (React Native / Expo)

```bash
cd mobile
npm install
npx expo start
```

Update `SUPABASE_URL`, `SUPABASE_KEY`, and `FLASK_URL` in each screen file with
your own values. Scan the QR code with Expo Go (or install the built APK).

### 3. ESP32 Firmware

Open `firmware/FireSafe_ESP32.ino` in the Arduino IDE.

Required libraries:
- DHT sensor library (Adafruit)
- Adafruit Unified Sensor
- ArduinoJson (Benoit Blanchon)
- LiquidCrystal I2C

Update the WiFi credentials and `serverURL` (your PC's IP address) at the top
of the file, then upload to the ESP32.

---

## Hardware Pin Connections

| Component | ESP32 Pin |
|-----------|-----------|
| DHT11 Data | GPIO 16 |
| MQ-2 Analog Out | GPIO 34 |
| Buzzer | GPIO 25 |
| LED (gas status) | GPIO 12 |
| LCD SDA | GPIO 4 |
| LCD SCL | GPIO 5 |

---

## Notes

- The backend uses Supabase (PostgreSQL) as the cloud database.
- Placeholder values (YOUR_PROJECT, YOUR_ANON_PUBLIC_KEY, YOUR_PC_IP,
  YOUR_WIFI_NAME, YOUR_WIFI_PASSWORD) must be replaced with real values
  before running.
- Push notifications require the app to run as a development/production build
  (Expo Go on SDK 53+ has limited push notification support).
