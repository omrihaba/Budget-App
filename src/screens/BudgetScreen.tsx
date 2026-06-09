import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  Modal, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import { useData } from '../contexts/DataContext';
import { formatILS } from '../utils/currency';
import { inBudgetPeriod, getBudgetPeriodLabel } from '../utils/budgetPeriod';
import { CustomCategory } from '../types';

type IconName = keyof typeof Ionicons.glyphMap;

const ICON_OPTIONS: IconName[] = [
  'restaurant', 'cafe', 'beer', 'pizza', 'ice-cream',
  'car', 'bicycle', 'train', 'airplane', 'boat',
  'home', 'build', 'hammer', 'bed',
  'flash', 'water', 'leaf', 'partly-sunny',
  'tv', 'game-controller', 'musical-notes', 'camera', 'headset',
  'heart', 'fitness', 'medkit', 'bandage',
  'bag', 'shirt', 'diamond', 'glasses',
  'book', 'school', 'library',
  'briefcase', 'business', 'people',
  'phone-portrait', 'laptop-outline', 'desktop',
  'paw', 'flower', 'star', 'trophy',
  'cash', 'card', 'gift', 'cut',
];

const COLOR_OPTIONS = [
  '#FF3B30', '#FF6B35', '#FF9500', '#FFD60A',
  '#34C759', '#00C7BE', '#32ADE6', '#007AFF',
  '#5856D6', '#AF52DE', '#FF2D55', '#A2845E',
];

function uid() {
  return 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}


const TOTAL_KEY = '__total__';

export default function BudgetScreen() {
  const c = useColors();
  const { transactions, bills, budgets, setBudget, deleteBudget, customCategories, addCustomCategory, deleteCustomCategory } = useData();
  const now = new Date();

  const [limitModal, setLimitModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');
  const [limitInput, setLimitInput] = useState('');

  const [createModal, setCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[7]);
  const [newIcon, setNewIcon] = useState<IconName>('star');

  const spendingByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => !t.isIncome && inBudgetPeriod(t.date, now))
      .forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return map;
  }, [transactions]);

  const budgetMap = useMemo(() => {
    const map: Record<string, number> = {};
    budgets.forEach(b => { map[b.category] = b.monthlyLimit; });
    return map;
  }, [budgets]);

  const monthlyIncome = useMemo(
    () => transactions.filter(t => t.isIncome && inBudgetPeriod(t.date, now)).reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const monthlyBillsTotal = useMemo(
    () => bills.filter(b => inBudgetPeriod(b.dueDate, now)).reduce((s, b) => s + b.amount, 0),
    [bills]
  );

  const totalExpenses = useMemo(
    () => Object.values(spendingByCategory).reduce((s, v) => s + v, 0),
    [spendingByCategory]
  );

  const totalBase      = budgetMap[TOTAL_KEY] ?? 0;
  const totalAvailable = totalBase + monthlyIncome;
  const totalSpent     = totalExpenses + monthlyBillsTotal;
  const totalRemaining = totalAvailable - totalSpent;
  const hasTotal       = budgetMap[TOTAL_KEY] != null;

  function openLimitModal(key: string) {
    setSelectedKey(key);
    setLimitInput(budgetMap[key] ? String(budgetMap[key]) : '');
    setLimitModal(true);
  }

  async function handleSaveLimit() {
    const val = parseFloat(limitInput.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid amount', 'Please enter a positive number.');
      return;
    }
    await setBudget(selectedKey, val);
    setLimitModal(false);
  }

  async function handleRemoveLimit() {
    await deleteBudget(selectedKey);
    setLimitModal(false);
  }

  async function handleDeleteCategory() {
    Alert.alert(
      'Delete Category',
      'This will remove the category. Existing transactions using it will still show as "Other".',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            await deleteBudget(selectedKey);
            await deleteCustomCategory(selectedKey);
            setLimitModal(false);
          },
        },
      ]
    );
  }

  async function handleCreateCategory() {
    if (!newName.trim()) {
      Alert.alert('Name required', 'Please enter a category name.');
      return;
    }
    const cat: CustomCategory = {
      key: uid(),
      label: newName.trim(),
      icon: newIcon,
      color: newColor,
      isIncome: false,
    };
    await addCustomCategory(cat);
    setCreateModal(false);
    setNewName('');
    setNewColor(COLOR_OPTIONS[7]);
    setNewIcon('star');
  }

  const monthLabel = getBudgetPeriodLabel(now);
  const selectedLabel = selectedKey === TOTAL_KEY
    ? 'Monthly Total'
    : customCategories.find(c => c.key === selectedKey)?.label ?? '';

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[s.heading, { color: c.text }]}>Budget</Text>
        <Text style={[s.subheading, { color: c.secondaryText }]}>{monthLabel}</Text>

        {/* ── Monthly Total card ── */}
        <TouchableOpacity
          style={[s.totalCard, { backgroundColor: c.card }]}
          onPress={() => openLimitModal(TOTAL_KEY)}
          activeOpacity={0.7}
        >
          <View style={s.totalHeader}>
            <View style={s.totalLeft}>
              <Ionicons name="wallet-outline" size={18} color={c.primary} />
              <Text style={[s.totalTitle, { color: c.text }]}>Monthly Total</Text>
            </View>
            {hasTotal ? (
              <Text style={[s.totalRemaining, { color: totalRemaining < 0 ? c.red : c.green }]}>
                {totalRemaining < 0 ? '-' : ''}{formatILS(Math.abs(totalRemaining))} left
              </Text>
            ) : (
              <Text style={[s.totalSetHint, { color: c.primary }]}>Tap to set</Text>
            )}
          </View>

          {hasTotal ? (
            <>
              <View style={[s.barTrack, { backgroundColor: c.separator }]}>
                <View style={[s.barFill, {
                  width: `${totalAvailable > 0 ? Math.round(Math.min(totalSpent / totalAvailable, 1) * 100) : 0}%` as any,
                  backgroundColor: totalRemaining < 0 ? c.red
                    : totalAvailable > 0 && totalSpent / totalAvailable >= 0.8 ? c.orange : c.primary,
                }]} />
              </View>
              <View style={s.totalFooter}>
                <Text style={[s.totalSub, { color: c.secondaryText }]}>
                  {formatILS(totalSpent)} spent · {formatILS(totalAvailable)} available
                </Text>
                {monthlyIncome > 0 && (
                  <Text style={[s.totalSub, { color: c.secondaryText }]}>
                    +{formatILS(monthlyIncome)} income
                  </Text>
                )}
              </View>
            </>
          ) : (
            <Text style={[s.totalSub, { color: c.secondaryText }]}>
              Set your monthly base amount to track your budget
            </Text>
          )}
        </TouchableOpacity>

        {customCategories.length === 0 ? (
          <View style={[s.empty, { backgroundColor: c.card }]}>
            <Ionicons name="bar-chart-outline" size={48} color={c.secondaryText} />
            <Text style={[s.emptyTitle, { color: c.text }]}>No categories yet</Text>
            <Text style={[s.emptySub, { color: c.secondaryText }]}>
              Create a category to start tracking your spending against a monthly limit.
            </Text>
          </View>
        ) : (
          <View style={[s.card, { backgroundColor: c.card }]}>
            {customCategories.map((cat, i) => {
              const spent = spendingByCategory[cat.key] ?? 0;
              const limit = budgetMap[cat.key];
              const hasLimit = limit != null && limit > 0;
              const ratio = hasLimit ? Math.min(spent / limit, 1) : 0;
              const pct = hasLimit ? Math.round(ratio * 100) : null;
              const isOver = hasLimit && spent > limit;
              const isWarning = hasLimit && !isOver && ratio >= 0.8;
              const barColor = isOver ? c.red : isWarning ? c.orange : cat.color;

              return (
                <View key={cat.key}>
                  {i > 0 && <View style={[s.sep, { backgroundColor: c.separator }]} />}
                  <TouchableOpacity style={s.row} onPress={() => openLimitModal(cat.key)} activeOpacity={0.7}>
                    <View style={[s.iconWrap, { backgroundColor: cat.color + '22' }]}>
                      <Ionicons name={cat.icon as IconName} size={20} color={cat.color} />
                    </View>

                    <View style={s.info}>
                      <View style={s.topRow}>
                        <Text style={[s.catName, { color: c.text }]}>{cat.label}</Text>
                        <View style={s.amounts}>
                          {hasLimit ? (
                            <Text style={[s.amountText, { color: isOver ? c.red : c.text }]}>
                              {formatILS(spent)}
                              <Text style={[s.limitText, { color: c.secondaryText }]}> / {formatILS(limit)}</Text>
                            </Text>
                          ) : (
                            <Text style={[s.noLimit, { color: c.secondaryText }]}>
                              {spent > 0 ? formatILS(spent) : 'No limit'}
                            </Text>
                          )}
                          {isOver && <Ionicons name="warning" size={14} color={c.red} style={{ marginLeft: 4 }} />}
                        </View>
                      </View>

                      {hasLimit ? (
                        <View style={s.barWrap}>
                          <View style={[s.barTrack, { backgroundColor: c.separator }]}>
                            <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
                          </View>
                          <Text style={[s.pctText, { color: isOver ? c.red : c.secondaryText }]}>{pct}%</Text>
                        </View>
                      ) : (
                        <Text style={[s.hintText, { color: c.primary }]}>Tap to set monthly limit</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: c.card, borderColor: c.primary }]}
          onPress={() => setCreateModal(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color={c.primary} />
          <Text style={[s.addBtnText, { color: c.primary }]}>Add Category</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Set / Edit Limit Modal ── */}
      <Modal visible={limitModal} transparent animationType="slide" onRequestClose={() => setLimitModal(false)}>
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[s.sheet, { backgroundColor: c.card }]}>
            <Text style={[s.sheetTitle, { color: c.text }]}>
              {budgetMap[selectedKey] ? 'Edit' : 'Set'} limit for {selectedLabel}
            </Text>

            <TextInput
              style={[s.input, { backgroundColor: c.background, color: c.text, borderColor: c.separator }]}
              placeholder={selectedKey === TOTAL_KEY ? 'Base amount for this month (₪)' : 'Monthly limit (₪)'}
              placeholderTextColor={c.secondaryText}
              keyboardType="decimal-pad"
              value={limitInput}
              onChangeText={setLimitInput}
              autoFocus
            />

            <TouchableOpacity style={[s.btn, { backgroundColor: c.primary }]} onPress={handleSaveLimit}>
              <Text style={s.btnText}>Save Limit</Text>
            </TouchableOpacity>

            {budgetMap[selectedKey] != null && (
              <TouchableOpacity style={[s.btn, s.outlineBtn, { borderColor: c.red }]} onPress={handleRemoveLimit}>
                <Text style={[s.btnText, { color: c.red }]}>Remove Limit</Text>
              </TouchableOpacity>
            )}

            {selectedKey !== TOTAL_KEY && (
              <TouchableOpacity style={[s.btn, s.outlineBtn, { borderColor: c.red }]} onPress={handleDeleteCategory}>
                <Text style={[s.btnText, { color: c.red }]}>Delete Category</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={s.cancelBtn} onPress={() => setLimitModal(false)}>
              <Text style={[s.cancelText, { color: c.secondaryText }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Create Category Modal ── */}
      <Modal visible={createModal} transparent animationType="slide" onRequestClose={() => setCreateModal(false)}>
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[s.sheet, { backgroundColor: c.card }]}>
            <Text style={[s.sheetTitle, { color: c.text }]}>New Category</Text>

            <View style={s.previewRow}>
              <View style={[s.iconWrap, { backgroundColor: newColor + '22' }]}>
                <Ionicons name={newIcon} size={20} color={newColor} />
              </View>
              <TextInput
                style={[s.nameInput, { backgroundColor: c.background, color: c.text, borderColor: c.separator }]}
                placeholder="Category name"
                placeholderTextColor={c.secondaryText}
                value={newName}
                onChangeText={setNewName}
                maxLength={20}
              />
            </View>

            <Text style={[s.pickerLabel, { color: c.secondaryText }]}>COLOR</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.colorRow}>
                {COLOR_OPTIONS.map(col => (
                  <TouchableOpacity key={col} onPress={() => setNewColor(col)} style={s.colorDotWrap}>
                    <View style={[s.colorDot, { backgroundColor: col }]}>
                      {newColor === col && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={[s.pickerLabel, { color: c.secondaryText }]}>ICON</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.iconRow}>
                {ICON_OPTIONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setNewIcon(icon)}
                    style={[s.iconOption, {
                      backgroundColor: newIcon === icon ? newColor + '33' : c.background,
                      borderColor: newIcon === icon ? newColor : 'transparent',
                    }]}
                  >
                    <Ionicons name={icon} size={22} color={newIcon === icon ? newColor : c.secondaryText} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={[s.btn, { backgroundColor: c.primary }]} onPress={handleCreateCategory}>
              <Text style={s.btnText}>Create Category</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.cancelBtn} onPress={() => setCreateModal(false)}>
              <Text style={[s.cancelText, { color: c.secondaryText }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1 },
  scroll:       { padding: 16, gap: 12, paddingBottom: 32 },
  heading:      { fontSize: 28, fontWeight: '700' },
  subheading:   { fontSize: 14 },
  totalCard:    { borderRadius: 16, padding: 16, gap: 10 },
  totalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLeft:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  totalTitle:   { fontSize: 16, fontWeight: '700' },
  totalRemaining: { fontSize: 15, fontWeight: '700' },
  totalSetHint:   { fontSize: 14, fontWeight: '600' },
  totalFooter:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalSub:       { fontSize: 12 },
  empty:        { borderRadius: 16, padding: 32, alignItems: 'center', gap: 12 },
  emptyTitle:   { fontSize: 18, fontWeight: '700' },
  emptySub:     { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  card:         { borderRadius: 16, overflow: 'hidden' },
  sep:          { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  row:          { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  iconWrap:     { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  info:         { flex: 1, gap: 6 },
  topRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catName:      { fontSize: 15, fontWeight: '600' },
  amounts:      { flexDirection: 'row', alignItems: 'center' },
  amountText:   { fontSize: 14, fontWeight: '600' },
  limitText:    { fontSize: 13, fontWeight: '400' },
  noLimit:      { fontSize: 13 },
  barWrap:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barTrack:     { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 3 },
  pctText:      { fontSize: 11, fontWeight: '600', width: 30, textAlign: 'right' },
  hintText:     { fontSize: 12 },
  addBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                  paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  addBtnText:   { fontSize: 15, fontWeight: '600' },
  // Modal shared
  overlay:      { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet:        { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  sheetTitle:   { fontSize: 18, fontWeight: '700' },
  input:        { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  btn:          { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnText:      { color: '#fff', fontSize: 16, fontWeight: '600' },
  outlineBtn:   { backgroundColor: 'transparent', borderWidth: 1.5 },
  cancelBtn:    { alignItems: 'center', paddingVertical: 8 },
  cancelText:   { fontSize: 15 },
  // Create modal
  previewRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameInput:    { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  pickerLabel:  { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  colorRow:     { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  colorDotWrap: {},
  colorDot:     { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconRow:      { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  iconOption:   { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
});
