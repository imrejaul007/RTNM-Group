/**
 * REE Admin Dashboard
 *
 * Complete control panel for ReZ Economic Engine
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';

const REE_URL = 'http://localhost:4000/api';

export default function REEDashboard() {
  // State
  const [activeTab, setActiveTab] = useState('tiers');
  const [userTiers, setUserTiers] = useState<any[]>([]);
  const [merchantTiers, setMerchantTiers] = useState<any[]>([]);
  const [coinConfigs, setCoinConfigs] = useState<any>({});
  const [fraudRules, setFraudRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cashbackPreview, setCashbackPreview] = useState({ amount: 500, result: null });

  // Tabs
  const tabs = ['Tiers', 'Coins', 'Fraud', 'Simulate', 'Analytics'];

  // Fetch user tiers
  const fetchUserTiers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${REE_URL}/features/tiers/user`);
      const data = await res.json();
      setUserTiers(data.tiers || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Fetch merchant tiers
  const fetchMerchantTiers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${REE_URL}/features/tiers/merchant`);
      const data = await res.json();
      setMerchantTiers(data.tiers || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Test cashback calculator
  const testCashback = async () => {
    try {
      const res = await fetch(`${REE_URL}/query/cashback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cashbackPreview.amount })
      });
      const data = await res.json();
      setCashbackPreview(prev => ({ ...prev, result: data.data }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUserTiers();
    fetchMerchantTiers();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>REE Admin Dashboard</Text>
      <Text style={styles.subheader}>ReZ Economic Engine Controls</Text>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab.toLowerCase() && styles.tabActive]}
            onPress={() => setActiveTab(tab.toLowerCase())}>
            <Text style={[styles.tabText, activeTab === tab.toLowerCase() && styles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
        ))}
      </View>

      {/* Tiers Tab */}
      {activeTab === 'tiers' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>User Tiers</Text>
          {userTiers.map((tier: any) => (
            <View key={tier.name} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.tierName}>{tier.name.toUpperCase()}</Text>
                <Text style={styles.tierSpend}>Min: ₹{tier.minSpend?.toLocaleString()}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <Text>Cashback:</Text>
                  <Text style={styles.value}>{tier.benefits?.maxCashbackPercent}%</Text>
                </View>
                <View style={styles.row}>
                  <Text>Social Shares:</Text>
                  <Text style={styles.value}>
                    {tier.benefits?.maxSocialSharesPerDay === -1 ? 'Unlimited' : tier.benefits?.maxSocialSharesPerDay + '/day'}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text>Prive Coins:</Text>
                  <Text style={[styles.value, tier.benefits?.canEarnPrive ? styles.green : styles.red]}>
                    {tier.benefits?.canEarnPrive ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Coins Tab */}
      {activeTab === 'coins' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Coin Economics</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cashback Calculator</Text>
            <TextInput
              style={styles.input}
              placeholder="Order amount"
              keyboardType="numeric"
              value={cashbackPreview.amount.toString()}
              onChangeText={(text) => setCashbackPreview({ amount: parseInt(text) || 0, result: null })}
            />
            <TouchableOpacity style={styles.button} onPress={testCashback}>
              <Text style={styles.buttonText}>Calculate</Text>
            </TouchableOpacity>
            {cashbackPreview.result && (
              <View style={styles.result}>
                <Text>Cashback: {cashbackPreview.result.cashbackPercent}% = ₹{cashbackPreview.result.cashbackAmount}</Text>
                <Text>Social: ₹{cashbackPreview.result.socialAmount}</Text>
                <Text>Total: ₹{cashbackPreview.result.cashbackAmount + cashbackPreview.result.socialAmount}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Fraud Tab */}
      {activeTab === 'fraud' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Fraud Rules</Text>
          <Text style={styles.info}>
            Fraud rules are managed in REE configuration files.
            Rules include:
          </Text>
          <View style={styles.card}>
            <Text>• Rapid Click Detection (30s window)</Text>
            <Text>• IP Flooding (10/hour limit)</Text>
            <Text>• Impossible Travel (500km/hour)</Text>
            <Text>• Duplicate Bill Detection</Text>
            <Text>• Social Share Abuse Prevention</Text>
          </View>
        </View>
      )}

      {/* Simulate Tab */}
      {activeTab === 'simulate' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>What-If Simulator</Text>
          <Text style={styles.info}>
            Test rule changes before deploying. See projected impact on revenue and costs.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Open Simulation Panel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <Text style={styles.info}>
            Coming soon: Real-time dashboards for:
          </Text>
          <View style={styles.card}>
            <Text>• Revenue & Cost tracking</Text>
            <Text>• Karma distribution</Text>
            <Text>• Coin utilization rates</Text>
            <Text>• Fraud detection stats</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  subheader: { fontSize: 14, color: '#666', marginBottom: 16 },
  tabBar: { flexDirection: 'row', marginBottom: 16 },
  tab: { paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: '#e0e0e0' },
  tabActive: { backgroundColor: '#007AFF' },
  tabText: { fontSize: 14, color: '#666' },
  tabTextActive: { color: '#fff' },
  content: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  tierName: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  tierSpend: { fontSize: 12, color: '#666' },
  cardBody: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  value: { fontWeight: '500' },
  green: { color: 'green' },
  red: { color: 'red' },
  info: { fontSize: 14, color: '#666', marginBottom: 16 },
  input: { border: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  result: { marginTop: 16, padding: 12, backgroundColor: '#f0f8ff', borderRadius: 8, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
});
</parameter>
