import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { getCategoryByKey } from '../constants/categories';
import { formatILS } from '../utils/currency';
import { Transaction } from '../types';
import { useData } from '../contexts/DataContext';

interface Props {
  transaction: Transaction;
  showDelete?: boolean;
}

export default function TransactionRow({ transaction: tx, showDelete = false }: Props) {
  const c = useColors();
  const { deleteTransaction } = useData();
  const cat = getCategoryByKey(tx.category);

  const confirmDelete = () =>
    Alert.alert('Delete Transaction', `Delete "${tx.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(tx.id) },
    ]);

  return (
    <View style={[s.row, { backgroundColor: c.card }]}>
      <View style={[s.icon, { backgroundColor: cat.color + '22' }]}>
        <Ionicons name={cat.icon} size={20} color={cat.color} />
      </View>

      <View style={s.info}>
        <Text style={[s.title, { color: c.text }]} numberOfLines={1}>{tx.title}</Text>
        <Text style={[s.sub,   { color: c.secondaryText }]}>{cat.label}</Text>
      </View>

      <Text style={[s.amount, { color: tx.isIncome ? c.green : c.red }]}>
        {tx.isIncome ? '+' : '-'}{formatILS(tx.amount)}
      </Text>

      {showDelete && (
        <TouchableOpacity onPress={confirmDelete} hitSlop={8} style={{ marginLeft: 6 }}>
          <Ionicons name="trash-outline" size={18} color={c.red} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
            paddingHorizontal: 16, gap: 12 },
  icon:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  info:   { flex: 1 },
  title:  { fontSize: 15, fontWeight: '600' },
  sub:    { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700' },
});
