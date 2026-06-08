import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import GoalCard from '../components/GoalCard';
import AddGoalModal from '../modals/AddGoalModal';
import AddFundsModal from '../modals/AddFundsModal';
import { SavingsGoal } from '../types';

export default function GoalsScreen() {
  const c = useColors();
  const { goals, isLoading } = useData();
  const [showAdd, setShowAdd]         = useState(false);
  const [fundGoal, setFundGoal]       = useState<SavingsGoal | null>(null);

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={c.primary} />;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.background }]}>
      <View style={[s.topBar, { backgroundColor: c.card, borderBottomColor: c.separator }]}>
        <Text style={[s.heading, { color: c.text }]}>Savings Goals</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={s.addBtn}>
          <Ionicons name="add-circle" size={30} color={c.primary} />
        </TouchableOpacity>
      </View>

      {goals.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="flag-outline" size={56} color={c.secondaryText} />
          <Text style={[s.emptyTitle, { color: c.text }]}>No Goals Yet</Text>
          <Text style={[s.emptySub, { color: c.secondaryText }]}>
            Set a target — emergency fund, vacation, new gadget — and track your progress.
          </Text>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={[s.emptyBtn, { backgroundColor: c.primary }]}
          >
            <Text style={s.emptyBtnText}>Create First Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <GoalCard goal={item} onAddFunds={g => setFundGoal(g)} />
          )}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      <AddGoalModal visible={showAdd} onClose={() => setShowAdd(false)} />
      <AddFundsModal
        goal={fundGoal}
        onClose={() => setFundGoal(null)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1 },
  topBar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                 paddingHorizontal: 16, paddingVertical: 12,
                 borderBottomWidth: StyleSheet.hairlineWidth },
  heading:     { fontSize: 22, fontWeight: '700' },
  addBtn:      { padding: 2 },
  list:        { padding: 16, paddingBottom: 32 },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle:  { fontSize: 20, fontWeight: '700' },
  emptySub:    { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  emptyBtn:    { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 4 },
  emptyBtnText:{ color: '#fff', fontSize: 15, fontWeight: '600' },
});
