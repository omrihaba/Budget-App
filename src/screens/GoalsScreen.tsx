import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import FadeInView from '../components/FadeInView';
import { SavingsGoal } from '../types';

export default function GoalsScreen() {
  const c = useColors();
  const { goals, isLoading } = useData();
  const [showAdd, setShowAdd]     = useState(false);
  const [fundGoal, setFundGoal]   = useState<SavingsGoal | null>(null);
  const [focusTick, setFocusTick] = useState(0);
  useFocusEffect(useCallback(() => { setFocusTick(t => t + 1); }, []));

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={c.primary} />;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.background }]}>
      <Text style={[s.heading, { color: c.text }]}>Savings Goals</Text>

      {goals.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="flag-outline" size={56} color={c.secondaryText} />
          <Text style={[s.emptyTitle, { color: c.text }]}>No Goals Yet</Text>
          <Text style={[s.emptySub, { color: c.secondaryText }]}>
            Set a target — emergency fund, vacation, new gadget — and track your progress.
          </Text>
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <FadeInView key={`${item.id}-${focusTick}`} delay={index * 150}>
              <GoalCard goal={item} onAddFunds={g => setFundGoal(g)} />
            </FadeInView>
          )}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      <View style={[s.bottomBar, { borderTopColor: c.separator }]}>
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: c.card, borderColor: c.primary }]}
          onPress={() => setShowAdd(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color={c.primary} />
          <Text style={[s.addBtnText, { color: c.primary }]}>New Goal</Text>
        </TouchableOpacity>
      </View>

      <AddGoalModal visible={showAdd} onClose={() => setShowAdd(false)} />
      <AddFundsModal goal={fundGoal} onClose={() => setFundGoal(null)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1 },
  heading:    { fontSize: 24, fontWeight: '700', textAlign: 'center',
                paddingTop: 12, paddingBottom: 8 },
  list:       { padding: 16, paddingBottom: 8 },
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySub:   { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  bottomBar:  { paddingHorizontal: 16, paddingVertical: 12,
                borderTopWidth: StyleSheet.hairlineWidth },
  addBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  addBtnText: { fontSize: 15, fontWeight: '600' },
});
