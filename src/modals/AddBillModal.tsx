import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, SafeAreaView, Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import { scheduleBillReminder } from '../utils/notifications';
import { parseAmount } from '../utils/currency';

interface Props { visible: boolean; onClose: () => void; }

type Recurrence = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
const RECURRENCES: { key: Recurrence; label: string }[] = [
  { key: 'weekly',    label: 'Weekly'    },
  { key: 'monthly',   label: 'Monthly'   },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly',    label: 'Yearly'    },
];

export default function AddBillModal({ visible, onClose }: Props) {
  const c = useColors();
  const { addBill } = useData();

  const [title, setTitle]           = useState('');
  const [amount, setAmount]         = useState('');
  const [dueDate, setDueDate]       = useState(new Date());
  const [recurrence, setRecurrence] = useState<Recurrence>('monthly');
  const [remind, setRemind]         = useState(true);
  const [notes, setNotes]           = useState('');

  const amountVal = parseAmount(amount);
  const isValid   = title.trim().length > 0 && amountVal > 0;

  const reset = () => {
    setTitle(''); setAmount(''); setDueDate(new Date());
    setRecurrence('monthly'); setRemind(true); setNotes('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    if (!isValid) return;
    let notificationId = '';
    if (remind) {
      notificationId = await scheduleBillReminder(title.trim(), amountVal, dueDate) ?? '';
    }
    await addBill({
      title:          title.trim(),
      amount:         amountVal,
      dueDate:        dueDate.toISOString().split('T')[0],
      recurrence,
      isPaid:         false,
      notes,
      notificationId: notificationId ?? '',
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
            <Text style={[st.title, { color: c.text }]}>New Bill</Text>
            <TouchableOpacity onPress={handleSave} disabled={!isValid}>
              <Text style={[st.save, { color: isValid ? c.primary : c.secondaryText }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={st.form} keyboardShouldPersistTaps="handled">

            {/* Name */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Bill Name</Text>
              <TextInput
                style={[st.input, { color: c.text }]}
                placeholder="e.g. Netflix, Rent"
                placeholderTextColor={c.secondaryText}
                value={title}
                onChangeText={setTitle}
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
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Due Date */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Due Date</Text>
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="compact"
                onChange={(_, d) => { if (d) setDueDate(d); }}
              />
            </View>

            {/* Recurrence */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Recurrence</Text>
              <View style={st.chips}>
                {RECURRENCES.map(r => (
                  <TouchableOpacity
                    key={r.key}
                    onPress={() => setRecurrence(r.key)}
                    style={[st.chip, {
                      backgroundColor: recurrence === r.key ? c.primary : 'transparent',
                      borderColor: c.primary,
                    }]}
                  >
                    <Text style={{ color: recurrence === r.key ? '#fff' : c.primary, fontSize: 13, fontWeight: '500' }}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reminder toggle */}
            <View style={[st.field, { backgroundColor: c.card, flexDirection: 'row', alignItems: 'center' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[st.label, { color: c.text, fontSize: 15 }]}>Remind me 3 days before</Text>
                <Text style={[st.label, { color: c.secondaryText }]}>Local notification at 9 AM</Text>
              </View>
              <Switch
                value={remind}
                onValueChange={setRemind}
                trackColor={{ true: c.primary }}
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
  chips:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
});
