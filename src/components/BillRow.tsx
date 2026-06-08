import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { formatILS } from '../utils/currency';
import { Bill } from '../types';
import { useData } from '../contexts/DataContext';

const RECURRENCE_LABEL: Record<string, string> = {
  weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly',
};

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr + 'T00:00:00');
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / 86_400_000);
}

export default function BillRow({ bill }: { bill: Bill }) {
  const c = useColors();
  const { toggleBillPaid, deleteBill } = useData();
  const days = daysUntil(bill.dueDate);

  const dueText = bill.isPaid       ? 'Paid'
    : days < 0                      ? `Overdue ${Math.abs(days)}d`
    : days === 0                    ? 'Due today'
    : days === 1                    ? 'Due tomorrow'
    :                                 `Due in ${days}d`;

  const dueColor = bill.isPaid ? c.green
    : days <= 0                ? c.red
    : days <= 3                ? c.orange
    :                            c.secondaryText;

  const confirmDelete = () =>
    Alert.alert('Delete Bill', `Delete "${bill.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive',
        onPress: () => deleteBill(bill.id, bill.notificationId) },
    ]);

  return (
    <View style={[s.row, { backgroundColor: c.card }]}>
      <TouchableOpacity
        onPress={() => toggleBillPaid(bill.id, !bill.isPaid)}
        style={[s.check, { borderColor: bill.isPaid ? c.green : c.separator }]}
        hitSlop={8}
      >
        {bill.isPaid && <Ionicons name="checkmark" size={14} color={c.green} />}
      </TouchableOpacity>

      <View style={s.info}>
        <Text
          style={[s.title, { color: c.text, opacity: bill.isPaid ? 0.45 : 1 }]}
          numberOfLines={1}
        >
          {bill.title}
        </Text>
        <View style={s.meta}>
          <Text style={[s.small, { color: c.secondaryText }]}>
            {RECURRENCE_LABEL[bill.recurrence] ?? 'Monthly'}
          </Text>
          <Text style={[s.small, { color: c.secondaryText }]}> · </Text>
          <Text style={[s.small, { color: dueColor, fontWeight: '600' }]}>{dueText}</Text>
        </View>
      </View>

      <Text style={[s.amount, { color: c.text, opacity: bill.isPaid ? 0.45 : 1 }]}>
        {formatILS(bill.amount)}
      </Text>

      <TouchableOpacity onPress={confirmDelete} hitSlop={8} style={{ marginLeft: 6 }}>
        <Ionicons name="trash-outline" size={18} color={c.red} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
            paddingHorizontal: 16, gap: 12 },
  check:  { width: 24, height: 24, borderRadius: 12, borderWidth: 2,
            alignItems: 'center', justifyContent: 'center' },
  info:   { flex: 1 },
  title:  { fontSize: 15, fontWeight: '600' },
  meta:   { flexDirection: 'row', marginTop: 2 },
  small:  { fontSize: 12 },
  amount: { fontSize: 15, fontWeight: '700' },
});
