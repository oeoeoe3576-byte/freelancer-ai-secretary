import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ModalOverlay from './ModalOverlay';
import { theme } from '../utils/theme';
import { WEEK, keyOf, parseKey, addDays, monthLabel } from '../utils/date';

// 날짜 입력칸(YYYY-MM-DD 직접 타이핑) 대신 쓰는 달력 선택 팝업.
// 연/월 이동 후 날짜 칸을 누르면 바로 선택된다(선택과 동시에 호출부에서 닫음).
export default function DatePickerModal({ visible, value, onSelect, onClose }) {
  const [cursor, setCursor] = useState(() => (value ? parseKey(value) : new Date()));

  useEffect(() => {
    if (visible) setCursor(value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseKey(value) : new Date());
  }, [visible, value]);

  if (!visible) return null;

  const moveMonth = (n) => setCursor(c => { const d = new Date(c); d.setMonth(d.getMonth() + n); return d; });
  const moveYear = (n) => setCursor(c => { const d = new Date(c); d.setFullYear(d.getFullYear() + n); return d; });

  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = addDays(first, -first.getDay());
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const todayKey = keyOf(new Date());

  return (
    <ModalOverlay visible={visible} onClose={onClose} align="center">
      <View style={styles.header}>
        <View style={styles.navGroup}>
          <TouchableOpacity onPress={() => moveYear(-1)} style={styles.nav}><Text style={styles.navText}>«</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => moveMonth(-1)} style={styles.nav}><Text style={styles.navText}>‹</Text></TouchableOpacity>
        </View>
        <Text style={styles.title}>{monthLabel(cursor)}</Text>
        <View style={styles.navGroup}>
          <TouchableOpacity onPress={() => moveMonth(1)} style={styles.nav}><Text style={styles.navText}>›</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => moveYear(1)} style={styles.nav}><Text style={styles.navText}>»</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekHeader}>{WEEK.map(w => <Text key={w} style={styles.weekHeadText}>{w}</Text>)}</View>
      <View style={styles.grid}>
        {cells.map(d => {
          const k = keyOf(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const isSelected = k === value;
          const isToday = k === todayKey;
          return (
            <TouchableOpacity key={k} onPress={() => onSelect(k)} style={[styles.cell, isSelected && styles.cellSelected]}>
              <Text style={[
                styles.cellText,
                !inMonth && styles.cellTextMuted,
                isToday && !isSelected && styles.cellTextToday,
                isSelected && styles.cellTextSelected,
              ]}>{d.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.todayBtn} onPress={() => onSelect(todayKey)}>
        <Text style={styles.todayBtnText}>오늘로 선택</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>취소</Text></TouchableOpacity>
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navGroup: { flexDirection: 'row', gap: 4 },
  nav: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 14, color: theme.text, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '800', color: theme.text },
  weekHeader: { flexDirection: 'row', marginBottom: 4 },
  weekHeadText: { width: '14.2857%', textAlign: 'center', fontSize: 11, color: theme.textSub },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm },
  cellSelected: { backgroundColor: theme.primary },
  cellText: { fontSize: 13, fontWeight: '700', color: theme.text },
  cellTextMuted: { color: '#C6CBD3' },
  cellTextToday: { color: '#4F46E5' },
  cellTextSelected: { color: '#fff' },
  todayBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 10, backgroundColor: '#F3F4F6', borderRadius: theme.radius.md },
  todayBtnText: { fontSize: 13, fontWeight: '700', color: theme.text },
  cancel: { alignItems: 'center', padding: 12, marginTop: 2 },
  cancelText: { color: theme.textSub, fontWeight: '700' },
});
