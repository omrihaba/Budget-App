import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { formatILS } from '../utils/currency';
import { SavingsGoal } from '../types';
import { useData } from '../contexts/DataContext';

interface Props {
  goal: SavingsGoal;
  onAddFunds: (goal: SavingsGoal) => void;
}

function daysLeft(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((d.getTime() - now.getTime()) / 86_400_000));
}

export default function GoalCard({ goal, onAddFunds }: Props) {
  const c = useColors();
  const { deleteGoal } = useData();

  const progress = goal.targetAmount > 0
    ? Math.min(goal.savedAmount / goal.targetAmount, 1)
    : 0;
  const done = progress >= 1;
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);

  const confirmDelete = () =>
    Alert.alert('Delete Goal', `Delete "${goal.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(goal.id) },
    ]);

  return (
    <View style={[s.card, { backgroundColor: c.card }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: c.text }]} numberOfLines={1}>{goal.title}</Text>
          {done
            ? <Text style={[s.sub, { color: c.green }]}>Goal reached! 🎉</Text>
            : <Text style={[s.sub, { color: c.secondaryText }]}>{daysLeft(goal.deadline)} days remaining</Text>
          }
        </View>
        <View style={s.headerRight}>
          <Text style={[s.pct, { color: done ? c.green : c.primary }]}>
            {Math.round(progress * 100)}%
          </Text>
          <TouchableOpacity onPress={confirmDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color={c.red} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[s.track, { backgroundColor: c.separator }]}>
        <View style={[s.fill, {
          width: `${Math.round(progress * 100)}%` as any,
          backgroundColor: done ? c.green : c.primary,
        }]} />
      </View>

      {/* Amounts */}
      <View style={s.amounts}>
        <View>
          <Text style={[s.amtLabel, { color: c.secondaryText }]}>Saved</Text>
          <Text style={[s.amtVal, { color: c.text }]}>{formatILS(goal.savedAmount)}</Text>
        </View>
        {!done && (
          <View style={{ alignItems: 'center' }}>
            <Text style={[s.amtLabel, { color: c.secondaryText }]}>Remaining</Text>
            <Text style={[s.amtVal, { color: c.orange }]}>{formatILS(remaining)}</Text>
          </View>
        )}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[s.amtLabel, { color: c.secondaryText }]}>Target</Text>
          <Text style={[s.amtVal, { color: c.text }]}>{formatILS(goal.targetAmount)}</Text>
        </View>
      </View>

      {/* Add funds button */}
      {!done && (
        <TouchableOpacity
          onPress={() => onAddFunds(goal)}
          style={[s.addBtn, { backgroundColor: c.primary + '18' }]}
        >
          <Ionicons name="add-circle-outline" size={18} color={c.primary} />
          <Text style={[s.addBtnText, { color: c.primary }]}>Add Funds</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card:      { borderRadius: 14, padding: 16, gap: 14 },
  header:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  headerRight: { alignItems: 'flex-end', gap: 4 },
  title:     { fontSize: 16, fontWeight: '700' },
  sub:       { fontSize: 12, marginTop: 2 },
  pct:       { fontSize: 22, fontWeight: '700' },
  track:     { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill:      { height: '100%', borderRadius: 4 },
  amounts:   { flexDirection: 'row', justifyContent: 'space-between' },
  amtLabel:  { fontSize: 11 },
  amtVal:    { fontSize: 14, fontWeight: '600' },
  addBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
               gap: 6, paddingVertical: 10, borderRadius: 10 },
  addBtnText:{ fontSize: 14, fontWeight: '600' },
});
