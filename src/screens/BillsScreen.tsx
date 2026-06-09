import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator,
  Dimensions, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import { formatILS } from '../utils/currency';
import AddBillModal from '../modals/AddBillModal';
import FadeInView from '../components/FadeInView';
import { Bill } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');
const GAP = 10;
const BUBBLE = Math.floor((SCREEN_W - 32 - GAP * 2) / 3);

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function billIcon(title: string): IconName {
  const t = title.toLowerCase();
  if (/netflix|hulu|disney|prime|youtube|spotify|apple|music|stream/.test(t)) return 'musical-notes-outline';
  if (/rent|mortgage|apartment/.test(t))  return 'home-outline';
  if (/phone|mobile|cellular/.test(t))    return 'phone-portrait-outline';
  if (/gym|fitness|sport/.test(t))        return 'fitness-outline';
  if (/water|electric|gas|power/.test(t)) return 'flash-outline';
  if (/internet|wifi/.test(t))            return 'wifi-outline';
  if (/insurance/.test(t))               return 'shield-outline';
  return 'card-outline';
}

export default function BillsScreen() {
  const c = useColors();
  const { bills, toggleBillPaid, deleteBill, isLoading } = useData();
  const [showAdd, setShowAdd]     = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  useFocusEffect(useCallback(() => { setFocusTick(t => t + 1); }, []));

  const upcoming = bills.filter(b => !b.isPaid);
  const paid     = bills.filter(b =>  b.isPaid);

  function confirmDelete(bill: Bill) {
    Alert.alert(
      'Delete bill?',
      `${bill.title} · ${formatILS(bill.amount)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteBill(bill.id, bill.notificationId) },
      ]
    );
  }

  function renderGroup(title: string, data: Bill[]) {
    if (!data.length) return null;
    return (
      <View style={s.section}>
        <Text style={[s.sectionTitle, { color: c.secondaryText }]}>{title}</Text>
        <View style={s.grid}>
          {data.map((bill, i) => {
            const color = bill.isPaid ? c.green : c.primary;
            const icon  = billIcon(bill.title);
            return (
              <FadeInView key={`${bill.id}-${focusTick}`} delay={i * 150}
                style={{ width: BUBBLE, height: BUBBLE, opacity: bill.isPaid ? 0.55 : 1 }}>
                <TouchableOpacity
                  style={[s.bubble, { backgroundColor: c.card }]}
                  onPress={() => toggleBillPaid(bill.id, !bill.isPaid)}
                  onLongPress={() => confirmDelete(bill)}
                  activeOpacity={0.75}
                >
                  <View style={[s.iconCircle, { backgroundColor: color + '22' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                  </View>
                  <Text style={[s.bubbleName, { color: c.text }]} numberOfLines={1}>
                    {bill.title}
                  </Text>
                  <Text style={[s.bubbleAmt, { color: color }]} numberOfLines={1}>
                    {formatILS(bill.amount)}
                  </Text>
                </TouchableOpacity>
              </FadeInView>
            );
          })}
        </View>
      </View>
    );
  }

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={c.primary} />;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.background }]}>
      <Text style={[s.heading, { color: c.text }]}>Bills & Subscriptions</Text>

      {bills.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="calendar-outline" size={56} color={c.secondaryText} />
          <Text style={[s.emptyTitle, { color: c.text }]}>No Bills Yet</Text>
          <Text style={[s.emptySub, { color: c.secondaryText }]}>
            Track rent, Netflix, phone bills — tap the button below to add one.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {renderGroup('Upcoming', upcoming)}
          {renderGroup('Paid', paid)}
        </ScrollView>
      )}

      <View style={[s.bottomBar, { borderTopColor: c.separator }]}>
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: c.card, borderColor: c.primary }]}
          onPress={() => setShowAdd(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color={c.primary} />
          <Text style={[s.addBtnText, { color: c.primary }]}>New Bill</Text>
        </TouchableOpacity>
      </View>

      <AddBillModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1 },
  heading:     { fontSize: 24, fontWeight: '700', textAlign: 'center',
                 paddingTop: 12, paddingBottom: 8 },
  scroll:      { padding: 16, paddingBottom: 32, gap: 24 },
  section:     { gap: 10 },
  sectionTitle:{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  bubble:      { borderRadius: 20, padding: 10, alignItems: 'center',
                 justifyContent: 'center', gap: 6 },
  iconCircle:  { width: 38, height: 38, borderRadius: 12,
                 alignItems: 'center', justifyContent: 'center' },
  bubbleName:  { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  bubbleAmt:   { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle:  { fontSize: 20, fontWeight: '700' },
  emptySub:    { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  bottomBar:   { paddingHorizontal: 16, paddingVertical: 12,
                 borderTopWidth: StyleSheet.hairlineWidth },
  addBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                 gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  addBtnText:  { fontSize: 15, fontWeight: '600' },
});
