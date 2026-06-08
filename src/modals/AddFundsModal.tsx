import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import { useColors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import { formatILS, parseAmount } from '../utils/currency';
import { SavingsGoal } from '../types';

interface Props {
  goal: SavingsGoal | null;
  onClose: () => void;
}

export default function AddFundsModal({ goal, onClose }: Props) {
  const c = useColors();
  const { addFunds } = useData();
  const [amount, setAmount] = useState('');

  if (!goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const amountVal = parseAmount(amount);
  const isValid   = amountVal > 0;

  const handleClose = () => { setAmount(''); onClose(); };

  const handleSave = async () => {
    if (!isValid) return;
    await addFunds(goal.id, amountVal, goal.savedAmount, goal.targetAmount);
    setAmount('');
    onClose();
  };

  return (
    <Modal visible={!!goal} animationType="slide" presentationStyle="formSheet" onRequestClose={handleClose}>
      <SafeAreaView style={[st.safe, { backgroundColor: c.background }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

          <View style={[st.header, { borderBottomColor: c.separator }]}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[st.cancel, { color: c.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[st.title, { color: c.text }]}>Add Funds</Text>
            <TouchableOpacity onPress={handleSave} disabled={!isValid}>
              <Text style={[st.save, { color: isValid ? c.primary : c.secondaryText }]}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={st.body}>
            {/* Goal info */}
            <View style={[st.infoCard, { backgroundColor: c.card }]}>
              <Text style={[st.goalName, { color: c.text }]}>{goal.title}</Text>
              <View style={st.infoRow}>
                <Text style={[st.infoLabel, { color: c.secondaryText }]}>Saved</Text>
                <Text style={[st.infoVal, { color: c.text }]}>{formatILS(goal.savedAmount)}</Text>
              </View>
              <View style={st.infoRow}>
                <Text style={[st.infoLabel, { color: c.secondaryText }]}>Still needed</Text>
                <Text style={[st.infoVal, { color: c.orange }]}>{formatILS(remaining)}</Text>
              </View>
              <View style={st.infoRow}>
                <Text style={[st.infoLabel, { color: c.secondaryText }]}>Target</Text>
                <Text style={[st.infoVal, { color: c.text }]}>{formatILS(goal.targetAmount)}</Text>
              </View>
            </View>

            {/* Amount input */}
            <View style={[st.field, { backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.secondaryText }]}>Amount to Add</Text>
              <View style={st.amtRow}>
                <Text style={[st.shekel, { color: c.secondaryText }]}>₪</Text>
                <TextInput
                  style={[st.amtInput, { color: c.text }]}
                  placeholder="0"
                  placeholderTextColor={c.secondaryText}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
            </View>

            {/* Fill remaining shortcut */}
            {remaining > 0 && (
              <TouchableOpacity
                onPress={() => setAmount(remaining.toFixed(2))}
                style={[st.fillBtn, { borderColor: c.primary }]}
              >
                <Text style={[st.fillBtnText, { color: c.primary }]}>
                  Fill Remaining ({formatILS(remaining)})
                </Text>
              </TouchableOpacity>
            )}
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const st = StyleSheet.create({
  safe:        { flex: 1 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                 paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  cancel:      { fontSize: 16 },
  title:       { fontSize: 17, fontWeight: '600' },
  save:        { fontSize: 16, fontWeight: '600' },
  body:        { padding: 16, gap: 12 },
  infoCard:    { borderRadius: 14, padding: 16, gap: 10 },
  goalName:    { fontSize: 18, fontWeight: '700' },
  infoRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel:   { fontSize: 14 },
  infoVal:     { fontSize: 14, fontWeight: '600' },
  field:       { borderRadius: 12, padding: 14, gap: 8 },
  label:       { fontSize: 12, fontWeight: '500' },
  amtRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shekel:      { fontSize: 26, fontWeight: '500' },
  amtInput:    { flex: 1, fontSize: 26, fontWeight: '500' },
  fillBtn:     { borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  fillBtnText: { fontSize: 15, fontWeight: '600' },
});
