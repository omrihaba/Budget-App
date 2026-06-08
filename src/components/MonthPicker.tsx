import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';

interface Props {
  selected: Date;
  onChange: (d: Date) => void;
}

function isCurrentMonth(d: Date) {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export default function MonthPicker({ selected, onChange }: Props) {
  const c = useColors();
  const atCurrent = isCurrentMonth(selected);

  const prev = () => {
    const d = new Date(selected);
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    onChange(d);
  };

  const next = () => {
    if (atCurrent) return;
    const d = new Date(selected);
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    onChange(d);
  };

  const label = selected.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={[s.bar, { backgroundColor: c.card, borderBottomColor: c.separator }]}>
      <TouchableOpacity onPress={prev} style={s.btn} hitSlop={8}>
        <Ionicons name="chevron-back" size={20} color={c.primary} />
      </TouchableOpacity>
      <Text style={[s.label, { color: c.text }]}>{label}</Text>
      <TouchableOpacity onPress={next} style={s.btn} hitSlop={8} disabled={atCurrent}>
        <Ionicons name="chevron-forward" size={20} color={atCurrent ? c.secondaryText : c.primary} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  bar:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
           paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  btn:   { padding: 4 },
  label: { fontSize: 15, fontWeight: '600' },
});
