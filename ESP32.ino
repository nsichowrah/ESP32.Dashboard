#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

// ---------------- WiFi ----------------
#define WIFI_SSID     "Soumen"
#define WIFI_PASSWORD "rpeq2148"

// -------- Render Backend API --------
const char* BACKEND_BASE_URL = "https://esp32-backend-k9n9.onrender.com";
const char* DEVICE_TOKEN = "nsic_esp32_secure_ab2dfz54h1s5hbf3d4hb";

// ------------- Hardware --------------
#define DHTPIN   4
#define DHTTYPE  DHT11
#define LED_PIN  5

const unsigned long UPLOAD_INTERVAL_MS = 5000;
const unsigned long LED_POLL_INTERVAL_MS = 1000;

DHT dht(DHTPIN, DHTTYPE);
WiFiClientSecure secureClient;

unsigned long lastUploadMs = 0;
unsigned long lastLedPollMs = 0;

String buildUrl(const char* path) {
  String base = String(BACKEND_BASE_URL);
  while (base.endsWith("/")) {
    base.remove(base.length() - 1);
  }
  return base + String(path);
}

bool requestWithToken(const String& method, const String& url, const String& body, String& response, int& code) {
  HTTPClient https;
  https.begin(secureClient, url);
  https.addHeader("Content-Type", "application/json");
  https.addHeader("Authorization", "Bearer " + String(DEVICE_TOKEN));

  if (method == "GET") {
    code = https.GET();
  } else if (method == "POST") {
    code = https.POST(body);
  } else {
    https.end();
    return false;
  }

  response = https.getString();
  https.end();
  return code > 0;
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected.");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

long currentEpochSeconds() {
  time_t now = time(nullptr);
  if (now > 1700000000) return (long)now;
  return (long)(millis() / 1000UL + 1700000000UL);
}

bool postSensorData(float temperature, float humidity, long timestamp) {
  DynamicJsonDocument doc(256);
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["timestamp"] = timestamp;

  String payload;
  serializeJson(doc, payload);

  String response;
  int code = 0;

  if (!requestWithToken("POST", buildUrl("/api/ingest"), payload, response, code)) {
    Serial.println("[backend] ingest request failed");
    return false;
  }

  if (code < 200 || code >= 300) {
    Serial.printf("[backend] ingest HTTP %d\n", code);
    if (response.length() > 0) {
      Serial.println(response);
    }
    return false;
  }

  return true;
}

int fetchLedState() {
  String response;
  int code = 0;

  if (!requestWithToken("GET", buildUrl("/api/led"), "", response, code)) {
    Serial.println("[backend] led request failed");
    return -1;
  }

  if (code < 200 || code >= 300) {
    Serial.printf("[backend] led HTTP %d\n", code);
    if (response.length() > 0) {
      Serial.println(response);
    }
    return -1;
  }

  DynamicJsonDocument doc(256);
  DeserializationError err = deserializeJson(doc, response);
  if (err) {
    Serial.println("[backend] led JSON parse failed");
    return -1;
  }

  int state = (int)(doc["state"] | -1);
  if (!(state == 0 || state == 1)) {
    return -1;
  }

  return state;
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  dht.begin();
  connectWiFi();

  secureClient.setInsecure();
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");

  if (String(BACKEND_BASE_URL).indexOf("your-render-service") >= 0) {
    Serial.println("ERROR: Set BACKEND_BASE_URL before uploading.");
  }
  if (String(DEVICE_TOKEN).indexOf("replace_with") >= 0) {
    Serial.println("ERROR: Set DEVICE_TOKEN before uploading.");
  }
}

void loop() {
  unsigned long nowMs = millis();

  if (nowMs - lastLedPollMs >= LED_POLL_INTERVAL_MS) {
    lastLedPollMs = nowMs;
    int state = fetchLedState();
    if (state == 0 || state == 1) {
      digitalWrite(LED_PIN, state == 1 ? HIGH : LOW);
      Serial.printf("LED state: %d\n", state);
    }
  }

  if (nowMs - lastUploadMs >= UPLOAD_INTERVAL_MS) {
    lastUploadMs = nowMs;

    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("DHT read failed.");
      return;
    }

    long timestamp = currentEpochSeconds();
    bool ok = postSensorData(temperature, humidity, timestamp);

    Serial.printf("Temp: %.2f C, Hum: %.2f %% | ingest=%s\n",
                  temperature,
                  humidity,
                  ok ? "OK" : "FAIL");
  }
}
