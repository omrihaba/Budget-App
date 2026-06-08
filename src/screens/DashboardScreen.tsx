import React, { useMemo } from 'react';
import {
  ScrollView, View, Text, ActivityIndicator,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useColors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import { formatILS } from '../utils/currency';
import { getCategoryByKey } from '../constants/categories';
import BalanceCard from '../components/BalanceCard';
import DonutChart from '../components/DonutChart';
import TransactionRow from '../components/TransactionRow';

function sameMonth(dateStr: string, ref: Date) {
  const d = new Date(dateStr);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export default function DashboardScreen() {
  const c = useColors();
  const { transactions, goals, isLoading } = useData();
  const now = new Date();

  const monthTxs = useMemo(
    () => transactions.filter(t => sameMonth(t.date, now)),
    [transactions]
  );
  const income   = useMemo(() => monthTxs.filter(t =>  t.isIncome).reduce((s, t) => s + t.amount, 0), [monthTxs]);
  const expenses = useMemo(() => monthTxs.filter(t => !t.isIncome).reduce((s, t) => s + t.amount, 0), [monthTxs]);
  const balance  = useMemo(() => transactions.reduce((s, t) => s + (t.isIncome ? t.amount : -t.amount), 0), [transactions]);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxs.filter(t => !t.isIncome).forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map)
      .map(([k, v]) => { const cat = getCategoryByKey(k); return { label: cat.label, value: v, color: cat.color }; })
      .sort((a, b) => b.value - a.value);
  }, [monthTxs]);

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={c.primary} />;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[s.heading, { color: c.text }]}>Dashboard</Text>

        {/* Balance */}
        <BalanceCard balance={balance} income={income} expenses={expenses} />

        {/* Spending chart */}
        {chartData.length > 0 && (
          <View style={[s.card, { backgroundColor: c.card }]}>
            <Text style={[s.cardTitle, { color: c.text }]}>This Month's Spending</Text>
            <DonutChart data={chartData} />
          </View>
        )}

        {/* Goals summary */}
        {goals.length > 0 && (
          <View style={[s.card, { backgroundColor: c.card }]}>
            <Text style={[s.cardTitle, { color: c.text }]}>Savings Goals</Text>
            {goals.slice(0, 3).map(goal => {
              const p = goal.targetAmount > 0 ? Math.min(goal.savedAmount / goal.targetAmount, 1) : 0;
              return (
                <View key={goal.id} style={s.miniGoal}>
                  <View style={s.miniRow}>
                    <Text style={[s.miniTitle, { color: c.text }]} numberOfLines={1}>{goal.title}</Text>
                    <Text style={[s.miniPct, { color: c.secondaryText }]}>{Math.round(p * 100)}%</Text>
                  </View>
                  <View style={[s.track, { backgroundColor: c.separator }]}>
                    <View style={[s.fill, { width: `${Math.round(p * 100)}%` as any, backgroundColor: p >= 1 ? c.green : c.primary }]} />
                  </View>
                  <View style={s.miniRow}>
                    <Text style={[s.miniSub, { color: c.secondaryText }]}>{formatILS(goal.savedAmount)}</Text>
                    <Text style={[s.miniSub, { color: c.secondaryText }]}>{formatILS(goal.targetAmount)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent transactions */}
        {transactions.length > 0 && (
          <View style={[s.card, { backgroundColor: c.card }]}>
            <Text style={[s.cardTitle, { color: c.text }]}>Recent Transactions</Text>
            {transactions.slice(0, 5).map((tx, i) => (
              <View key={tx.id}>
                <TransactionRow transaction={tx} />
                {i < Math.min(transactions.length, 5) - 1 && (
                  <View style={[s.sep, { backgroundColor: c.separator }]} />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Empty state */}
        {transactions.length === 0 && goals.length === 0 && (
          <View style={[s.card, s.empty, { backgroundColor: c.card }]}>
            <Text style={{ fontSize: 48 }}>💰</Text>
            <Text style={[s.emptyTitle, { color: c.text }]}>Welcome to BudgetApp</Text>
            <Text style={[s.emptySub, { color: c.secondaryText }]}>
              Tap the Transactions tab to add your first income or expense entry.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1 },
  scroll:     { padding: 16, gap: 16 },
  heading:    { fontSize: 28, fontWeight: '700' },
  card:       { borderRadius: 16, padding: 16, gap: 12 },
  cardTitle:  { fontSize: 16, fontWeight: '700' },
  sep:        { height: StyleSheet.hairlineWidth, marginLeft: 68 },
  miniGoal:   { gap: 6 },
  miniRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  miniTitle:  { fontSize: 14, fontWeight: '600', flex: 1 },
  miniPct:    { fontSize: 13 },
  miniSub:    { fontSize: 11 },
  track:      { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill:       { height: '100%', borderRadius: 3 },
  empty:      { alignItems: 'center', paddingVertical: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptySub:   { fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
