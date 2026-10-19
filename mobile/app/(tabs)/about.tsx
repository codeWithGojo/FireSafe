import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ℹ️ About</Text>

      <Text style={styles.sectionTitle}>PROJECT</Text>
      <View style={styles.card}>
        <Text style={styles.projectName}>IoT-Based Smart Fire & Gas Detection System</Text>
        <Text style={styles.detail}>A real-time monitoring system that detects fire and gas hazards using IoT sensors and sends instant alerts to your mobile device.</Text>
      </View>

      <Text style={styles.sectionTitle}>TEAM</Text>
      <View style={styles.card}>
        <View style={styles.member}>
          <Text style={styles.memberName}>Raji Ibrahim Ajibola</Text>
          <Text style={styles.memberId}>BU22SEN1033</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.member}>
          <Text style={styles.memberName}>Imegu Favour</Text>
          <Text style={styles.memberId}>BU22CSC1127</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>TECH STACK</Text>
      <View style={styles.card}>
        {[
          { label: 'Hardware', value: 'ESP32 + MQ-2 + DHT11' },
          { label: 'Backend', value: 'Python Flask' },
          { label: 'Database', value: 'Supabase (PostgreSQL)' },
          { label: 'Mobile', value: 'React Native (Expo)' },
          { label: 'Notifications', value: 'Expo Push Notifications' },
        ].map((item, index) => (
          <View key={index}>
            <View style={styles.stackRow}>
              <Text style={styles.stackLabel}>{item.label}</Text>
              <Text style={styles.stackValue}>{item.value}</Text>
            </View>
            {index < 4 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>VERSION</Text>
      <View style={styles.card}>
        <Text style={styles.detail}>FireSafe Monitor v1.0.0</Text>
        <Text style={styles.detail}>Final Year Project — 2026</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 24 },
  sectionTitle: { color: '#555', fontSize: 12, fontWeight: '600', letterSpacing: 2, marginBottom: 8, marginTop: 8 },
  card: { backgroundColor: '#1c1c1e', borderRadius: 16, padding: 16, marginBottom: 24 },
  projectName: { color: '#ff6b35', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  detail: { color: '#aaa', fontSize: 14, lineHeight: 22 },
  member: { paddingVertical: 8 },
  memberName: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  memberId: { color: '#888', fontSize: 13, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#2c2c2e', marginVertical: 8 },
  stackRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  stackLabel: { color: '#888', fontSize: 14 },
  stackValue: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
});
