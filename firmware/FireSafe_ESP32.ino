/*
 * IoT-Based Smart Fire and Gas Detection System
 * ESP32 Firmware
 *
 * Reads MQ-2 gas sensor and DHT11 temperature/humidity sensor,
 * evaluates against thresholds, controls local buzzer + LED alerts,
 * and sends sensor data to the Flask backend over WiFi (HTTP POST).
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ============== WIFI ==============
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// ============== FLASK SERVER ==============
const char* serverURL = "http://YOUR_PC_IP:5000/sensor-data";

// ============== PIN DEFINITIONS ==============
#define DHT_PIN 16
#define DHT_TYPE DHT11
#define MQ2_PIN 34
#define BUZZER_PIN 25
#define LED_PIN 12

// ============== BUZZER MODE ==============
// If buzzer makes noise when HIGH -> set to true
// If buzzer makes noise when LOW  -> set to false
#define BUZZER_ON_HIGH true

// ============== THRESHOLDS ==============
#define GAS_WARNING 300
#define GAS_URGENT 500
#define GAS_CRITICAL 700
#define TEMP_WARNING 40

// ============== OBJECTS ==============
DHT dht(DHT_PIN, DHT_TYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
bool lcdWorking = false;

// ============== BUZZER CONTROL ==============
void buzzerOn() {
  digitalWrite(BUZZER_PIN, BUZZER_ON_HIGH ? HIGH : LOW);
}

void buzzerOff() {
  digitalWrite(BUZZER_PIN, BUZZER_ON_HIGH ? LOW : HIGH);
}

// ============== SETUP ==============
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  buzzerOff();
  digitalWrite(LED_PIN, LOW);

  // LCD setup
  Wire.begin(4, 5); // SDA=D4, SCL=D5
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("FireSafe Monitor");
  lcdWorking = true;

  // Connect WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.println(WiFi.localIP());
    if (lcdWorking) {
      lcd.setCursor(0, 1);
      lcd.print("WiFi Connected!");
    }
  } else {
    Serial.println("\nWiFi FAILED!");
  }

  dht.begin();
  delay(2000);
  Serial.println("System Ready!");
}

// ============== ALERT STATUS ==============
String getAlertStatus(float temperature, int gasLevel) {
  if (gasLevel >= GAS_CRITICAL) return "critical";
  if (!isnan(temperature) && temperature >= TEMP_WARNING) return "critical";
  if (gasLevel >= GAS_URGENT) return "urgent";
  if (gasLevel >= GAS_WARNING) return "warning";
  return "safe";
}

// ============== LOCAL ALERTS ==============
void updateLocalAlerts(String status) {
  if (status == "critical") {
    digitalWrite(LED_PIN, HIGH);
    buzzerOn();
  } else if (status == "urgent" || status == "warning") {
    digitalWrite(LED_PIN, HIGH);
    buzzerOff();
  } else {
    digitalWrite(LED_PIN, LOW);
    buzzerOff();
  }
}

// ============== UPDATE LCD ==============
void updateLCD(float temperature, int gasLevel, String status) {
  if (!lcdWorking) return;
  lcd.clear();
  lcd.setCursor(0, 0);
  if (isnan(temperature)) {
    lcd.print("T:-- G:");
  } else {
    lcd.print("T:");
    lcd.print(temperature, 1);
    lcd.print("C G:");
  }
  lcd.print(gasLevel);
  lcd.setCursor(0, 1);
  lcd.print("Status: ");
  lcd.print(status);
}

// ============== SEND TO FLASK ==============
void sendToFlask(float temperature, float humidity, int gasLevel, String alertStatus) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    WiFi.begin(ssid, password);
    return;
  }

  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["temperature"] = isnan(temperature) ? 0 : temperature;
  doc["humidity"] = isnan(humidity) ? 0 : humidity;
  doc["gas_level"] = gasLevel;
  doc["alert_status"] = alertStatus;

  String payload;
  serializeJson(doc, payload);

  int responseCode = http.POST(payload);
  Serial.print("Server response: ");
  Serial.println(responseCode);
  http.end();
}

// ============== MAIN LOOP ==============
void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int gasLevel = analogRead(MQ2_PIN);

  float safeTemp = isnan(temperature) ? 0 : temperature;
  String alertStatus = getAlertStatus(safeTemp, gasLevel);

  Serial.print("Temp: ");
  if (isnan(temperature)) Serial.print("FAILED");
  else Serial.print(temperature);
  Serial.print("C | Humidity: ");
  if (isnan(humidity)) Serial.print("FAILED");
  else Serial.print(humidity);
  Serial.print("% | Gas: ");
  Serial.print(gasLevel);
  Serial.print(" | Alert: ");
  Serial.println(alertStatus);

  updateLocalAlerts(alertStatus);
  updateLCD(temperature, gasLevel, alertStatus);
  sendToFlask(temperature, humidity, gasLevel, alertStatus);

  delay(5000);
}
