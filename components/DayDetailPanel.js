import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { dayLabel, parseKey } from '../utils/date';
import EventListItem from './EventListItem';

// 달력에서 날짜를 선택하면 그 날짜의 일정을 브랜드/프로젝트 하위메뉴로 나누지 않고
// 한 줄(브랜드(프로젝트) 제목)로 합쳐 보여준다. 상단 "+ 일정 추가"로 그 날짜에 바로 수동 등록도 가능.
export default function DayDetailPanel({ dateKey, events, onOpenEvent, onAddEvent }) {
  const sorted = useMemo(
    () => [...events].sort((a, b) => (a.brand?.name || '').localeCompare(b.brand?.name || '') || (a.createdAt || 0) - (b.createdAt || 0)),
    [events]
  );

  if (!dateKey) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        <Text style={styles.date}>{dayLabel(parseKey(dateKey))}</Text>
        <TouchableOpacity onPress={() => onAddEvent(dateKey)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ 일정 추가</Text>
        </TouchableOpacity>
      </View>
      {sorted.length === 0 ? (
        <Text style={styles.empty}>등록된 일정이 없습니다.</Text>
      ) : (
        sorted.map(e => (
          <EventListItem key={e.id} event={e} brand={e.brand} project={e.project} combined onPress={() => onOpenEvent(e.id)} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 14, borderTopWidth: 1, borderColor: theme.border, paddingTop: 14 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  date: { fontSize: 15, fontWeight: '800', color: theme.text },
  addBtn: { backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: theme.radius.pill },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  empty: { fontSize: 13, color: theme.textFaint, paddingVertical: 12, textAlign: 'center' },
});
