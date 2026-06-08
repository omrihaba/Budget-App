import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, SectionList, StyleSheet,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import MonthPicker from '../components/MonthPicker';
import TransactionRow from '../components/TransactionRow';
import AddTransactionModal from '../modals/AddTransactionModal';
import { Transaction } from '../types';

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function TransactionsScreen() {
  const c = useColors();
  const { transactions, isLoading } = useData();
  const [month, setMonth] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
    });
  }, [transactions, month]);

  // Group by day, newest first
  const sections = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    filtered.forEach(t => {
      const key = dayLabel(t.date);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    // Sort sections by the actual date string descending
    const dayKeys = [...new Set(filtered.map(t => t.date))].sort().reverse();
    return dayKeys.map(d => ({
      title: dayLabel(d),
      data: filtered.filter(t => t.date === d),
    }));
  }, [filtered]);

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={c.primary} />;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.background }]}>
      {/* Top bar */}
      <View style={[s.topBar, { backgroundColor: c.card, borderBottomColor: c.separator }]}>
        <Text style={[s.heading, { color: c.text }]}>Transactions</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={s.addBtn}>
          <Ionicons name="add-circle" size={30} color={c.primary} />
        </TouchableOpacity>
      </View>

      <MonthPicker selected={month} onChange={setMonth} />

      {filtered.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="receipt-outline" size={56} color={c.secondaryText} />
          <Text style={[s.emptyText, { color: c.secondaryText }]}>No transactions this month</Text>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={[s.emptyBtn, { backgroundColor: c.primary }]}
          >
            <Text style={s.emptyBtnText}>Add First Transaction</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TransactionRow transaction={item} showDelete />}
          renderSectionHeader={({ section }) => (
            <Text style={[s.sectionHeader, { color: c.secondaryText, backgroundColor: c.background }]}>
              {section.title}
            </Text>
          )}
          ItemSeparatorComponent={() => (
            <View style={[s.sep, { backgroundColor: c.separator }]} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AddTransactionModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1 },
  topBar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  paddingHorizontal: 16, paddingVertical: 12,
                  borderBottomWidth: StyleSheet.hairlineWidth },
  heading:      { fontSize: 22, fontWeight: '700' },
  addBtn:       { padding: 2 },
  sectionHeader:{ fontSize: 12, fontWeight: '600', paddingHorizontal: 16,
                  paddingTop: 16, paddingBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  sep:          { height: StyleSheet.hairlineWidth, marginLeft: 68 },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyText:    { fontSize: 16 },
  emptyBtn:     { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
