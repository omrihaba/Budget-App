import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, SectionList,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import BillRow from '../components/BillRow';
import AddBillModal from '../modals/AddBillModal';
import { Bill } from '../types';

export default function BillsScreen() {
  const c = useColors();
  const { bills, isLoading } = useData();
  const [showAdd, setShowAdd] = useState(false);

  const upcoming = bills.filter(b => !b.isPaid);
  const paid     = bills.filter(b =>  b.isPaid);

  const sections: { title: string; data: Bill[] }[] = [];
  if (upcoming.length) sections.push({ title: 'Upcoming', data: upcoming });
  if (paid.length)     sections.push({ title: 'Paid',     data: paid     });

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={c.primary} />;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.background }]}>
      <View style={[s.topBar, { backgroundColor: c.card, borderBottomColor: c.separator }]}>
        <Text style={[s.heading, { color: c.text }]}>Bills & Subscriptions</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={s.addBtn}>
          <Ionicons name="add-circle" size={30} color={c.primary} />
        </TouchableOpacity>
      </View>

      {bills.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="calendar-outline" size={56} color={c.secondaryText} />
          <Text style={[s.emptyTitle, { color: c.text }]}>No Bills Yet</Text>
          <Text style={[s.emptySub, { color: c.secondaryText }]}>
            Track rent, Netflix, phone bills — tap + to add one.
          </Text>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={[s.emptyBtn, { backgroundColor: c.primary }]}
          >
            <Text style={s.emptyBtnText}>Add First Bill</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <BillRow bill={item} />}
          renderSectionHeader={({ section }) => (
            <Text style={[s.sectionHeader, { color: c.secondaryText, backgroundColor: c.background }]}>
              {section.title}
            </Text>
          )}
          ItemSeparatorComponent={() => (
            <View style={[s.sep, { backgroundColor: c.separator }]} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AddBillModal visible={showAdd} onClose={() => setShowAdd(false)} />
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
  sectionHeader:{ fontSize: 12, fontWeight: '600', paddingHorizontal: 16,
                  paddingTop: 16, paddingBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  sep:         { height: StyleSheet.hairlineWidth, marginLeft: 52 },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle:  { fontSize: 20, fontWeight: '700' },
  emptySub:    { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  emptyBtn:    { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 4 },
  emptyBtnText:{ color: '#fff', fontSize: 15, fontWeight: '600' },
});
