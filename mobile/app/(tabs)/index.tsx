import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_PUBLIC_KEY';
const FLASK_URL = 'http://YOUR_PC_IP:5000';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotifications() {
  if (!Device.isDevice) {
    alert('Push notifications only work on a real device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permission for notifications was denied');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  console.log('Push token:', token);
  return token;
}

type SensorReading = {
  temperature: number;
  gas_level: number;
  alert_status: string;
  timestamp: string;
};

export default function HomeScreen() {
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/sensor_readings?order=timestamp.desc&limit=10`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setLatest(data[0]);
        setHistory(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    registerForPushNotifications().then(token => {
      if (token) {
        setPushToken(token);
        fetch(`${FLASK_URL}/register-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        }).catch(err => console.log('Token registration error:', err));
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => {
      clearInterval(interval);
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const getAlertColor = (status: string) => {
    if (status === 'critical') return '#ff3b30';
    if (status === 'warning') return '#ff9500';
    return '#34c759';
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#ff6b35" />
      <Text style={styles.loadingText}>Connecting to sensors...</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔥 FireSafe Monitor</Text>

      {latest && (
        <>
          <View style={[styles.alertCard, { backgroundColor: getAlertColor(latest.alert_status) }]}>
            <Text style={styles.alertLabel}>ALERT STATUS</Text>
            <Text style={styles.alertValue}>{latest.alert_status?.toUpperCase()}</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>🌡️</Text>
              <Text style={styles.cardLabel}>Temperature</Text>
              <Text style={styles.cardValue}>{latest.temperature}°C</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>💨</Text>
              <Text style={styles.cardLabel}>Gas Level</Text>
              <Text style={styles.cardValue}>{latest.gas_level} ppm</Text>
            </View>
          </View>

          <Text style={styles.updated}>
            Last updated: {new Date(latest.timestamp).toLocaleTimeString()}
          </Text>
        </>
      )}

      <Text style={styles.historyTitle}>Recent Readings</Text>
      {history.map((item, index) => (
        <View key={index} style={styles.historyItem}>
          <View style={[styles.dot, { backgroundColor: getAlertColor(item.alert_status) }]} />
          <Text style={styles.historyText}>
            {new Date(item.timestamp).toLocaleTimeString()} — {item.temperature}°C | {item.gas_level} ppm | {item.alert_status}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', padding: 20, paddingTop: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 20 },
  loadingText: { color: '#888', marginTop: 10 },
  alertCard: { borderRadius: 16, padding: 20, marginBottom: 20, alignItems: 'center' },
  alertLabel: { color: '#ffffff', fontSize: 12, fontWeight: '600', letterSpacing: 2 },
  alertValue: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { flex: 1, backgroundColor: '#1c1c1e', borderRadius: 16, padding: 20, alignItems: 'center' },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardLabel: { color: '#888', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  cardValue: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  updated: { color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 24 },
  historyTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  historyItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  historyText: { color: '#aaa', fontSize: 13, flex: 1 },
});
