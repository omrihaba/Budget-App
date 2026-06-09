import React, { useMemo } from 'react';
import {
  ScrollView, View, Text, ActivityIndicator,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import { formatILS } from '../utils/currency';
import { getCategoryByKey } from '../constants/categories';
import { inBudgetPeriod, billInBudgetPeriod } from '../utils/budgetPeriod';
import BalanceCard from '../components/BalanceCard';
import DonutChart from '../components/DonutChart';
import TransactionRow from '../components/TransactionRow';

const TOTAL_KEY = '__total__';

export default function DashboardScreen() {
  const c = useColors();
  const { transactions, bills, goals, budgets, isLoading, customCategories } = useData();
  const now = new Date();

  const periodTxs = useMemo(
    () => transactions.filter(t => inBudgetPeriod(t.date, now)),
    [transactions]
  );
  const income   = useMemo(() => periodTxs.filter(t =>  t.isIncome).reduce((s, t) => s + t.amount, 0), [periodTxs]);
  const expenses = useMemo(() => periodTxs.filter(t => !t.isIncome).reduce((s, t) => s + t.amount, 0), [periodTxs]);
  const balance  = useMemo(() => transactions.reduce((s, t) => s + (t.isIncome ? t.amount : -t.amount), 0), [transactions]);

  const monthlyBillsTotal = useMemo(
    () => bills.filter(b => billInBudgetPeriod(b, now)).reduce((s, b) => s + b.amount, 0),
    [bills]
  );

  const totalBase = useMemo(
    () => budgets.find(b => b.category === TOTAL_KEY)?.monthlyLimit ?? 0,
    [budgets]
  );
  const hasTotal       = totalBase > 0;
  const totalAvailable = totalBase + income;
  const totalSpent     = expenses + monthlyBillsTotal;
  const totalRemaining = totalAvailable - totalSpent;

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    periodTxs.filter(t => !t.isIncome).forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map)
      .map(([k, v]) => { const cat = getCategoryByKey(k, customCategories); return { label: cat.label, value: v, color: cat.color }; })
      .sort((a, b) => b.value - a.value);
  }, [periodTxs, customCategories]);

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={c.primary} />;

  const spentRatio = hasTotal && totalAvailable > 0 ? Math.min(totalSpent / totalAvailable, 1) : 0;
  const spentPct   = Math.round(spentRatio * 100);
  const isOver     = hasTotal && totalRemaining < 0;
  const isWarn     = hasTotal && !isOver && spentRatio >= 0.8;
  const barColor   = isOver ? c.red : isWarn ? c.orange : c.primary;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[s.heading, { color: c.text, textAlign: 'center' }]}>Dashboard</Text>

        {/* Balance */}
        <BalanceCard
          balance={hasTotal ? totalRemaining : balance}
          income={income}
          expenses={expenses}
          label={hasTotal ? 'Remaining This Month' : 'Total Balance'}
        />

        {/* Monthly budget card — only shown when a monthly total is set */}
        {hasTotal && (
          <View style={[s.card, { backgroundColor: c.card }]}>
            <View style={s.budgetHeader}>
              <View style={s.budgetLeft}>
                <Ionicons name="wallet-outline" size={16} color={c.primary} />
                <Text style={[s.cardTitle, { color: c.text }]}>Monthly Budget</Text>
              </View>
              <Text style={[s.budgetPct, { color: isOver ? c.red : c.secondaryText }]}>{spentPct}% spent</Text>
            </View>

            <View style={[s.track, { backgroundColor: c.separator }]}>
              <View style={[s.fill, { width: `${spentPct}%` as any, backgroundColor: barColor }]} />
            </View>

            <View style={s.budgetRow}>
              <View>
                <Text style={[s.budgetAmt, { color: c.text }]}>{formatILS(totalAvailable)}</Text>
                <Text style={[s.budgetSub, { color: c.secondaryText }]}>
                  available{income > 0 ? ` (incl. ${formatILS(income)} income)` : ''}
                </Text>
              </View>
              <View style={s.budgetRight}>
                <Text style={[s.budgetAmt, { color: isOver ? c.red : c.green, textAlign: 'right' }]}>
                  {isOver ? '-' : ''}{formatILS(Math.abs(totalRemaining))}
                </Text>
                <Text style={[s.budgetSub, { color: c.secondaryText, textAlign: 'right' }]}>
                  {isOver ? 'over budget' : 'remaining'}
                </Text>
              </View>
            </View>

            {monthlyBillsTotal > 0 && (
              <View style={[s.billsNote, { backgroundColor: c.separator + '66' }]}>
                <Ionicons name="calendar-outline" size={13} color={c.secondaryText} />
                <Text style={[s.billsNoteText, { color: c.secondaryText }]}>
                  {formatILS(totalSpent)} spent · {formatILS(monthlyBillsTotal)} from bills
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Spending chart */}
        {chartData.length > 0 && (
          <View style={[s.card, { backgroundColor: c.card }]}>
            <Text style={[s.cardTitle, { color: c.text }]}>This Period's Spending</Text>
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
  safe:        { flex: 1 },
  scroll:      { padding: 16, gap: 16 },
  heading:     { fontSize: 28, fontWeight: '700' },
  card:        { borderRadius: 16, padding: 16, gap: 12 },
  cardTitle:   { fontSize: 16, fontWeight: '700' },
  sep:         { height: StyleSheet.hairlineWidth, marginLeft: 68 },
  track:       { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill:        { height: '100%', borderRadius: 3 },
  // Budget card
  budgetHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetLeft:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  budgetPct:   { fontSize: 13, fontWeight: '600' },
  budgetRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  budgetRight: { alignItems: 'flex-end' },
  budgetAmt:   { fontSize: 17, fontWeight: '700' },
  budgetSub:   { fontSize: 12, marginTop: 2 },
  billsNote:   { flexDirection: 'row', alignItems: 'center', gap: 6,
                 paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  billsNoteText: { fontSize: 12 },
  // Goals
  miniGoal:    { gap: 6 },
  miniRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  miniTitle:   { fontSize: 14, fontWeight: '600', flex: 1 },
  miniPct:     { fontSize: 13 },
  miniSub:     { fontSize: 11 },
  // Empty
  empty:       { alignItems: 'center', paddingVertical: 32 },
  emptyTitle:  { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptySub:    { fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
