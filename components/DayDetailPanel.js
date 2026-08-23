import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { dayLabel, parseKey } from '../utils/date';
import EventListItem from './EventListItem';

// 달력에서 날짜를 선택하면 그 날짜의 일정을 브랜드/프로젝트 하위메뉴로 나누지 않고
// 한 줄(브랜드(프로젝트) 제목)로 합쳐 보여준다.
export default function DayDetailPanel({ dateKey, events, onOpenEvent }) {
  const sorted = useMemo(
    () => [...events].sort((a, b) => (a.brand?.name || '').localeCompare(b.brand?.name || '') || (a.createdAt || 0) - (b.createdAt || 0)),
    [events]
  );

  if (!dateKey) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.date}>{dayLabel(parseKey(dateKey))}</Text>
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
  date: { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 4 },
  empty: { fontSize: 13, color: theme.textFaint, paddingVertical: 12, textAlign: 'center' },
});
