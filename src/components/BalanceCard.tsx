import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { formatILS } from '../utils/currency';

interface Props {
  balance: number;
  income: number;
  expenses: number;
  label?: string;
}

export default function BalanceCard({ balance, income, expenses, label = 'Total Balance' }: Props) {
  const c = useColors();
  return (
    <View style={[s.card, { backgroundColor: c.card }]}>
      <Text style={[s.label, { color: c.secondaryText }]}>{label}</Text>
      <Text style={[s.balance, { color: balance >= 0 ? c.text : c.red }]}>
        {formatILS(balance)}
      </Text>

      <View style={[s.divider, { backgroundColor: c.separator }]} />

      <View style={s.row}>
        <View style={s.stat}>
          <Ionicons name="arrow-down-circle" size={15} color={c.green} />
          <Text style={[s.statLabel, { color: c.secondaryText }]}>Income</Text>
          <Text style={[s.statAmt, { color: c.green }]}>{formatILS(income)}</Text>
        </View>

        <Text style={[s.period, { color: c.secondaryText }]}>This Month</Text>

        <View style={[s.stat, s.right]}>
          <Ionicons name="arrow-up-circle" size={15} color={c.red} />
          <Text style={[s.statLabel, { color: c.secondaryText }]}>Expenses</Text>
          <Text style={[s.statAmt, { color: c.red }]}>{formatILS(expenses)}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card:     { borderRadius: 16, padding: 20, gap: 12 },
  label:    { fontSize: 14, textAlign: 'center' },
  balance:  { fontSize: 42, fontWeight: '700', textAlign: 'center' },
  divider:  { height: StyleSheet.hairlineWidth },
  row:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stat:     { alignItems: 'flex-start', gap: 3 },
  right:    { alignItems: 'flex-end' },
  statLabel:{ fontSize: 12 },
  statAmt:  { fontSize: 15, fontWeight: '600' },
  period:   { fontSize: 11 },
});
