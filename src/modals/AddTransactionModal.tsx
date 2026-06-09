import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, SafeAreaView, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import { INCOME_CATEGORIES } from '../constants/categories';
import { parseAmount, toLocalDateString } from '../utils/currency';

interface Props { visible: boolean; onClose: () => void; }

type IconName = keyof typeof Ionicons.glyphMap;

const BLANK = { title: '', amount: '', isIncome: false, category: '', notes: '' };

export default function AddTransactionModal({ visible, onClose }: Props) {
  const c = useColors();
  const { addTransaction, customCategories } = useData();

  const [form, setForm] = useState(BLANK);
  const [date, setDate] = useState(new Date());

  const expenseCats = customCategories;
  const incomeCats  = INCOME_CATEGORIES;
  const cats        = form.isIncome ? incomeCats : expenseCats;

  // Keep selected category valid whenever the list or isIncome changes
  useEffect(() => {
    if (cats.length > 0 && !cats.find(c => c.key === form.category)) {
      setForm(prev => ({ ...prev, category: cats[0].key }));
    }
  }, [form.isIncome, customCategories]);

  const amountVal = parseAmount(form.amount);
  const hasCategories = cats.length > 0;
  const isValid = form.title.trim().length > 0 && amountVal > 0 && hasCategories;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, delay: 80, useNativeDriver: true }).start();
    }
  }, [visible]);

  const reset = () => { setForm(BLANK); setDate(new Date()); };
  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    if (!isValid) return;
    await addTransaction({
      title:    form.title.trim(),
      amount:   amountVal,
      isIncome: form.isIncome,
      category: form.category,
      date:     toLocalDateString(date),
      notes:    form.notes,
    });
    reset();
    onClose();
  };

  const setField = (key: keyof typeof BLANK, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={[st.safe, { backgroundColor: c.background }]}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

          <View style={[st.header, { borderBottomColor: c.separator }]}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[st.cancel, { color: c.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[st.title, { color: c.text }]}>New Transaction</Text>
            <TouchableOpacity onPress={handleSave} disabled={!isValid}>
              <Text style={[st.save, { color: isValid ? c.primary : c.secondaryText }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={st.form} keyboardShouldPersistTaps="handled">

            {/* Income / Expense toggle */}
            <View style={[st.toggle, { backgroundColor: c.separator }]}>
              {[false, true].map(val => (
                <TouchableOpacity
                  key={String(val)}
                  style={[st.toggleBtn, form.isIncome === val && { backgroundColor: c.card }]}
                  onPress={() => setField('isIncome', val)}
                >
                  <Text style={[st.toggleText, {
                    color: form.isIncome === val ? (val ? c.green : c.red) : c.secondaryText,
                  }]}>
                    {val ? 'Income' : 'Expense'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Title</Text>
              <TextInput
                style={[st.input, { color: c.text }]}
                placeholder="e.g. Groceries"
                placeholderTextColor={c.secondaryText}
                value={form.title}
                onChangeText={v => setField('title', v)}
              />
            </View>

            {/* Amount */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Amount</Text>
              <View style={st.amtRow}>
                <Text style={[st.shekel, { color: c.secondaryText }]}>₪</Text>
                <TextInput
                  style={[st.amtInput, { color: c.text }]}
                  placeholder="0"
                  placeholderTextColor={c.secondaryText}
                  value={form.amount}
                  onChangeText={v => setField('amount', v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Date */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Date</Text>
              <DateTimePicker
                value={date}
                mode="date"
                display="compact"
                maximumDate={new Date()}
                onChange={(_, d) => { if (d) setDate(d); }}
              />
            </View>

            {/* Category */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Category</Text>
              {!form.isIncome && expenseCats.length === 0 ? (
                <View style={st.noCatsWrap}>
                  <Ionicons name="bar-chart-outline" size={20} color={c.secondaryText} />
                  <Text style={[st.noCatsText, { color: c.secondaryText }]}>
                    No categories yet — create some in the Budget tab first.
                  </Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                  <View style={st.chips}>
                    {cats.map(cat => {
                      const sel = form.category === cat.key;
                      return (
                        <TouchableOpacity
                          key={cat.key}
                          onPress={() => setField('category', cat.key)}
                          style={[st.chip, {
                            borderColor: cat.color,
                            backgroundColor: sel ? cat.color + '22' : 'transparent',
                          }]}
                        >
                          <Ionicons name={cat.icon as IconName} size={13} color={cat.color} />
                          <Text style={[st.chipText, { color: cat.color }]}>{cat.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>

            {/* Notes */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Notes (optional)</Text>
              <TextInput
                style={[st.input, { color: c.text }]}
                placeholder="Add a note…"
                placeholderTextColor={c.secondaryText}
                value={form.notes}
                onChangeText={v => setField('notes', v)}
                multiline
              />
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}

const st = StyleSheet.create({
  safe:       { flex: 1 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  cancel:     { fontSize: 16 },
  title:      { fontSize: 17, fontWeight: '600' },
  save:       { fontSize: 16, fontWeight: '600' },
  form:       { padding: 16, gap: 12 },
  toggle:     { flexDirection: 'row', borderRadius: 10, padding: 3 },
  toggleBtn:  { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  toggleText: { fontSize: 15, fontWeight: '600' },
  field:      { borderRadius: 12, padding: 14, gap: 8 },
  label:      { fontSize: 12, fontWeight: '500' },
  input:      { fontSize: 16 },
  amtRow:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shekel:     { fontSize: 22, fontWeight: '500' },
  amtInput:   { flex: 1, fontSize: 22, fontWeight: '500' },
  chips:      { flexDirection: 'row', gap: 8, paddingHorizontal: 4 },
  chip:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 11,
                paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  chipText:   { fontSize: 12, fontWeight: '500' },
  noCatsWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  noCatsText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
