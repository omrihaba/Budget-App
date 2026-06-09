import React, { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, Dimensions, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import { getCategoryByKey } from '../constants/categories';
import { formatILS } from '../utils/currency';
import MonthPicker from '../components/MonthPicker';
import AddTransactionModal from '../modals/AddTransactionModal';
import FadeInView from '../components/FadeInView';
import { Transaction } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');
const GAP = 10;
const BUBBLE = Math.floor((SCREEN_W - 32 - GAP * 2) / 3);

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function TransactionsScreen() {
  const c = useColors();
  const { transactions, customCategories, deleteTransaction, isLoading } = useData();
  const [month, setMonth]     = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  useFocusEffect(useCallback(() => { setFocusTick(t => t + 1); }, []));

  const filtered = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
  }), [transactions, month]);

  const sections = useMemo(() => {
    const dayKeys = [...new Set(filtered.map(t => t.date))].sort().reverse();
    return dayKeys.map(d => ({
      title: dayLabel(d),
      data:  filtered.filter(t => t.date === d),
    }));
  }, [filtered]);

  function confirmDelete(tx: Transaction) {
    const cat = getCategoryByKey(tx.category, customCategories);
    Alert.alert(
      'Delete transaction?',
      `${cat.label} · ${formatILS(tx.amount)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(tx.id) },
      ]
    );
  }

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={c.primary} />;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.background }]}>
      <View style={[s.topBar, { backgroundColor: c.background }]}>
        <Text style={[s.heading, { color: c.text }]} numberOfLines={1}>Transactions</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={[s.addBtn, { backgroundColor: c.primary }]}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <MonthPicker selected={month} onChange={setMonth} />

      {filtered.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="receipt-outline" size={56} color={c.secondaryText} />
          <Text style={[s.emptyTitle, { color: c.secondaryText }]}>No transactions this month</Text>
          <TouchableOpacity onPress={() => setShowAdd(true)} style={[s.emptyBtn, { backgroundColor: c.primary }]}>
            <Text style={s.emptyBtnText}>Add First Transaction</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {(() => {
            let idx = 0;
            return sections.map(section => (
              <View key={section.title} style={s.section}>
                <Text style={[s.sectionTitle, { color: c.secondaryText }]}>{section.title}</Text>
                <View style={s.grid}>
                  {section.data.map(tx => {
                    const delay = idx++ * 150;
                    const cat = getCategoryByKey(tx.category, customCategories);
                    return (
                      <FadeInView key={`${tx.id}-${focusTick}`} delay={delay}
                        style={{ width: BUBBLE, height: BUBBLE }}>
                        <TouchableOpacity
                          style={[s.bubble, { backgroundColor: c.card }]}
                          onLongPress={() => confirmDelete(tx)}
                          activeOpacity={0.75}
                        >
                          <View style={[s.iconCircle, { backgroundColor: cat.color + '22' }]}>
                            <Ionicons name={cat.icon} size={20} color={cat.color} />
                          </View>
                          <Text
                            style={[s.bubbleAmt, { color: tx.isIncome ? c.green : c.red }]}
                            numberOfLines={1}
                          >
                            {tx.isIncome ? '+' : '−'}{formatILS(tx.amount)}
                          </Text>
                          <Text style={[s.bubbleCat, { color: c.secondaryText }]} numberOfLines={1}>
                            {tx.title}
                          </Text>
                        </TouchableOpacity>
                      </FadeInView>
                    );
                  })}
                </View>
              </View>
            ));
          })()}
        </ScrollView>
      )}

      <AddTransactionModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1 },
  topBar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
                 paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  heading:     { position: 'absolute', left: 0, right: 0,
                 textAlign: 'center', fontSize: 24, fontWeight: '700' },
  addBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5,
                 paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  addBtnText:  { color: '#fff', fontSize: 14, fontWeight: '600' },
  scroll:      { padding: 16, paddingBottom: 40, gap: 24 },
  section:     { gap: 10 },
  sectionTitle:{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  bubble:      { borderRadius: 20, padding: 10, alignItems: 'center',
                 justifyContent: 'center', gap: 6 },
  iconCircle:  { width: 38, height: 38, borderRadius: 12,
                 alignItems: 'center', justifyContent: 'center' },
  bubbleAmt:   { fontSize: 13, fontWeight: '700' },
  bubbleCat:   { fontSize: 11, fontWeight: '500' },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  emptyTitle:  { fontSize: 16 },
  emptyBtn:    { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText:{ color: '#fff', fontSize: 15, fontWeight: '600' },
});
