import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import { parseAmount } from '../utils/currency';

interface Props { visible: boolean; onClose: () => void; }

function threeMonthsFromNow(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d;
}

export default function AddGoalModal({ visible, onClose }: Props) {
  const c = useColors();
  const { addGoal } = useData();

  const [title, setTitle]     = useState('');
  const [target, setTarget]   = useState('');
  const [saved, setSaved]     = useState('');
  const [deadline, setDeadline] = useState(threeMonthsFromNow());
  const [notes, setNotes]     = useState('');

  const targetVal = parseAmount(target);
  const savedVal  = parseAmount(saved);
  const isValid   = title.trim().length > 0 && targetVal > 0;

  const reset = () => {
    setTitle(''); setTarget(''); setSaved('');
    setDeadline(threeMonthsFromNow()); setNotes('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    if (!isValid) return;
    await addGoal({
      title:        title.trim(),
      targetAmount: targetVal,
      savedAmount:  Math.min(savedVal, targetVal),
      deadline:     deadline.toISOString().split('T')[0],
      notes,
    });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={[st.safe, { backgroundColor: c.background }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

          <View style={[st.header, { borderBottomColor: c.separator }]}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[st.cancel, { color: c.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[st.title, { color: c.text }]}>New Goal</Text>
            <TouchableOpacity onPress={handleSave} disabled={!isValid}>
              <Text style={[st.save, { color: isValid ? c.primary : c.secondaryText }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={st.form} keyboardShouldPersistTaps="handled">

            {/* Goal name */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Goal Name</Text>
              <TextInput
                style={[st.input, { color: c.text }]}
                placeholder="e.g. Emergency Fund, Vacation"
                placeholderTextColor={c.secondaryText}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Target amount */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Target Amount</Text>
              <View style={st.amtRow}>
                <Text style={[st.shekel, { color: c.secondaryText }]}>₪</Text>
                <TextInput
                  style={[st.amtInput, { color: c.text }]}
                  placeholder="0"
                  placeholderTextColor={c.secondaryText}
                  value={target}
                  onChangeText={setTarget}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Already saved */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Already Saved (optional)</Text>
              <View style={st.amtRow}>
                <Text style={[st.shekel, { color: c.secondaryText }]}>₪</Text>
                <TextInput
                  style={[st.amtInput, { color: c.text }]}
                  placeholder="0"
                  placeholderTextColor={c.secondaryText}
                  value={saved}
                  onChangeText={setSaved}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Deadline */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Target Date</Text>
              <DateTimePicker
                value={deadline}
                mode="date"
                display="compact"
                minimumDate={new Date()}
                onChange={(_, d) => { if (d) setDeadline(d); }}
              />
            </View>

            {/* Notes */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Notes (optional)</Text>
              <TextInput
                style={[st.input, { color: c.text }]}
                placeholder="Add a note…"
                placeholderTextColor={c.secondaryText}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const st = StyleSheet.create({
  safe:     { flex: 1 },
  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  cancel:   { fontSize: 16 },
  title:    { fontSize: 17, fontWeight: '600' },
  save:     { fontSize: 16, fontWeight: '600' },
  form:     { padding: 16, gap: 12 },
  field:    { borderRadius: 12, padding: 14, gap: 8 },
  label:    { fontSize: 12, fontWeight: '500' },
  input:    { fontSize: 16 },
  amtRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shekel:   { fontSize: 22, fontWeight: '500' },
  amtInput: { flex: 1, fontSize: 22, fontWeight: '500' },
});
