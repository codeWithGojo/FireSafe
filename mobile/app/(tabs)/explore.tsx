import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';

const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_PUBLIC_KEY';

type SensorReading = {
  id: number;
  temperature: number;
  gas_level: number;
  alert_status: string;
  timestamp: string;
};

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/sensor_readings?order=timestamp.desc&limit=50`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );
      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const getAlertColor = (status: string) => {
    if (status === 'critical') return '#ff3b30';
    if (status === 'warning') return '#ff9500';
    return '#34c759';
  };

  const getAlertIcon = (status: string) => {
    if (status === 'critical') return '🔴';
    if (status === 'warning') return '🟠';
    return '🟢';
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#ff6b35" />
      <Text style={styles.loadingText}>Loading alerts...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚠️ Alerts History</Text>
      <Text style={styles.subtitle}>{alerts.length} readings recorded</Text>

      <TouchableOpacity style={styles.refreshBtn} onPress={fetchAlerts}>
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>

      <FlatList
        data={alerts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.alertItem}>
            <View style={[styles.statusBar, { backgroundColor: getAlertColor(item.alert_status) }]} />
            <View style={styles.alertContent}>
              <Text style={styles.alertHeader}>
                {getAlertIcon(item.alert_status)} {item.alert_status?.toUpperCase()}
              </Text>
              <Text style={styles.alertDetails}>
                🌡️ {item.temperature}°C  |  💨 {item.gas_level} ppm
              </Text>
              <Text style={styles.alertTime}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', padding: 20, paddingTop: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 16 },
  refreshBtn: { backgroundColor: '#1c1c1e', padding: 10, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  refreshText: { color: '#ff6b35', fontWeight: '600' },
  loadingText: { color: '#888', marginTop: 10 },
  alertItem: { flexDirection: 'row', backgroundColor: '#1c1c1e', borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  statusBar: { width: 5 },
  alertContent: { padding: 14, flex: 1 },
  alertHeader: { color: '#ffffff', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  alertDetails: { color: '#aaa', fontSize: 14, marginBottom: 4 },
  alertTime: { color: '#555', fontSize: 12 },
});
