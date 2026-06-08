import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';

export default function WalletScreen() {
  const c = useColors();

  const openWallet = () => {
    // "shoebox://" is Apple Wallet's URL scheme
    Linking.openURL('shoebox://').catch(() => {
      // Wallet not available (e.g. on simulator or Android)
    });
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={[s.heading, { color: c.text }]}>Wallet</Text>

        {/* Main info card */}
        <View style={[s.card, { backgroundColor: c.card }]}>
          <Ionicons name="wallet" size={48} color={c.primary} style={{ alignSelf: 'center' }} />
          <Text style={[s.cardTitle, { color: c.text }]}>Apple Wallet</Text>
          <Text style={[s.cardBody, { color: c.secondaryText }]}>
            React Native apps cannot access Apple Wallet cards, passes, or Apple Pay
            transaction history. This is enforced by Apple's privacy framework and
            applies to all third-party apps regardless of technology.
          </Text>
          <TouchableOpacity
            onPress={openWallet}
            style={[s.btn, { backgroundColor: c.primary }]}
          >
            <Ionicons name="wallet-outline" size={18} color="#fff" />
            <Text style={s.btnText}>Open Wallet App</Text>
          </TouchableOpacity>
        </View>

        {/* Tip card */}
        <View style={[s.card, { backgroundColor: c.card }]}>
          <Text style={[s.tipTitle, { color: c.text }]}>💡 Tip: Track manually</Text>
          <Text style={[s.cardBody, { color: c.secondaryText }]}>
            After paying with Apple Pay, come back to the Transactions tab and add
            the expense manually. You'll build an accurate spending picture while
            keeping your card data private.
          </Text>
          <TouchableOpacity
            style={[s.outlineBtn, { borderColor: c.primary }]}
          >
            <Ionicons name="add-circle-outline" size={18} color={c.primary} />
            <Text style={[s.outlineBtnText, { color: c.primary }]}>Log a Transaction</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy note */}
        <View style={[s.noteRow, { backgroundColor: c.card }]}>
          <Ionicons name="lock-closed" size={16} color={c.secondaryText} />
          <Text style={[s.noteText, { color: c.secondaryText }]}>
            All your BudgetApp data is stored only on this device. Nothing is uploaded
            to any server or cloud.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1 },
  scroll:       { padding: 16, gap: 16 },
  heading:      { fontSize: 28, fontWeight: '700' },
  card:         { borderRadius: 16, padding: 20, gap: 14 },
  cardTitle:    { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  cardBody:     { fontSize: 14, lineHeight: 22 },
  btn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  gap: 8, paddingVertical: 12, borderRadius: 12 },
  btnText:      { color: '#fff', fontSize: 15, fontWeight: '600' },
  outlineBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
  outlineBtnText:{ fontSize: 15, fontWeight: '600' },
  tipTitle:     { fontSize: 16, fontWeight: '700' },
  noteRow:      { flexDirection: 'row', gap: 10, padding: 16, borderRadius: 12, alignItems: 'flex-start' },
  noteText:     { flex: 1, fontSize: 13, lineHeight: 19 },
});
