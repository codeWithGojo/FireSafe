import { useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function SettingsScreen() {
  const [gasWarning, setGasWarning] = useState('300');
  const [gasUrgent, setGasUrgent] = useState('500');
  const [gasCritical, setGasCritical] = useState('700');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const saveSettings = () => {
    Alert.alert('Settings Saved', 'Your threshold settings have been updated.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>

      <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ true: '#ff6b35' }}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Sound Alerts</Text>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ true: '#ff6b35' }}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>GAS THRESHOLDS (ppm)</Text>
      <View style={styles.card}>
        <Text style={styles.label}>⚠️ Warning Level</Text>
        <TextInput
          style={styles.input}
          value={gasWarning}
          onChangeText={setGasWarning}
          keyboardType="numeric"
          placeholderTextColor="#555"
        />
        <View style={styles.divider} />
        <Text style={styles.label}>🟠 Urgent Level</Text>
        <TextInput
          style={styles.input}
          value={gasUrgent}
          onChangeText={setGasUrgent}
          keyboardType="numeric"
          placeholderTextColor="#555"
        />
        <View style={styles.divider} />
        <Text style={styles.label}>🔴 Critical Level</Text>
        <TextInput
          style={styles.input}
          value={gasCritical}
          onChangeText={setGasCritical}
          keyboardType="numeric"
          placeholderTextColor="#555"
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
        <Text style={styles.saveBtnText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 24 },
  sectionTitle: { color: '#555', fontSize: 12, fontWeight: '600', letterSpacing: 2, marginBottom: 8, marginTop: 8 },
  card: { backgroundColor: '#1c1c1e', borderRadius: 16, padding: 16, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { color: '#ffffff', fontSize: 15, marginBottom: 8 },
  input: { backgroundColor: '#2c2c2e', color: '#ffffff', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#2c2c2e', marginVertical: 8 },
  saveBtn: { backgroundColor: '#ff6b35', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 40 },
  saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});
