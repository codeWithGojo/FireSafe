from flask import Flask, request, jsonify
import requests as http
from datetime import datetime, timezone

app = Flask(__name__)

# ============== SUPABASE CREDENTIALS ==============
SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"
SUPABASE_KEY = "YOUR_ANON_PUBLIC_KEY"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

# ============== PUSH TOKENS (in memory) ==============
push_tokens = []

# ============== THRESHOLDS ==============
GAS_WARNING = 300
GAS_URGENT = 500
GAS_CRITICAL = 700


def send_push_notification(title, body):
    if not push_tokens:
        print("No push tokens registered yet")
        return

    messages = [
        {"to": token, "title": title, "body": body, "sound": "default"}
        for token in push_tokens
    ]

    response = http.post(
        "https://exp.host/--/api/v2/push/send",
        json=messages,
        headers={"Content-Type": "application/json"}
    )
    print(f"Notification sent: {response.status_code} - {response.text}")


def check_gas_threshold(gas_level):
    if gas_level >= GAS_CRITICAL:
        send_push_notification(
            "CRITICAL GAS ALERT",
            f"Gas level is dangerously high: {gas_level} ppm! Evacuate immediately!"
        )
    elif gas_level >= GAS_URGENT:
        send_push_notification(
            "URGENT GAS WARNING",
            f"Gas level is very high: {gas_level} ppm! Take action now."
        )
    elif gas_level >= GAS_WARNING:
        send_push_notification(
            "Gas Warning",
            f"Gas level elevated: {gas_level} ppm. Monitor closely."
        )


@app.route('/')
def home():
    return jsonify({"message": "FireSafe backend is running!"})


@app.route('/register-token', methods=['POST'])
def register_token():
    data = request.get_json()
    token = data.get('token')

    if token and token not in push_tokens:
        push_tokens.append(token)
        print(f"New push token registered: {token}")

    return jsonify({"status": "token registered"}), 200


@app.route('/sensor-data', methods=['POST'])
def receive_sensor_data():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400

    temperature = data.get('temperature')
    gas_level = data.get('gas_level')
    alert_status = data.get('alert_status')

    entry = {
        "temperature": temperature,
        "gas_level": gas_level,
        "alert_status": alert_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    # Save to Supabase
    response = http.post(
        f"{SUPABASE_URL}/rest/v1/sensor_readings",
        json=entry,
        headers=HEADERS
    )

    # Check if gas level needs a notification
    if gas_level is not None:
        check_gas_threshold(gas_level)

    if response.status_code == 201:
        print(f"Saved -> Temp: {temperature}C | Gas: {gas_level} ppm | Alert: {alert_status}")
        return jsonify({"status": "success", "saved": entry}), 200
    else:
        print(f"Supabase error: {response.text}")
        return jsonify({"error": response.text}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
