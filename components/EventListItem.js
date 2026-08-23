import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

// 오늘 일정 / 날짜별 목록 / 프로젝트 상세 목록에서 공용으로 쓰는 한 줄짜리 일정 아이템.
// 탭하면 항상 상세화면으로 이동한다(완료 처리는 여기서 하지 않음).
// combined=true면 "브랜드(프로젝트) 제목"을 한 줄로 합쳐서 보여준다(날짜별 상세 패널용).
export default function EventListItem({ event, brand, project, showProject = true, combined = false, onPress }) {
  const color = brand?.color || theme.primary;
  const label = combined
    ? `${brand?.name || ''}${project ? `(${project.name})` : ''} ${event.title}`.trim()
    : event.title;
  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.body}>
        <Text style={[styles.title, event.done && styles.doneText]} numberOfLines={1}>{event.done ? '✓ ' : ''}{label}</Text>
        {!combined && (
          <Text style={styles.meta} numberOfLines={1}>
            {brand?.name || ''}{showProject && project ? ` · ${project.name}` : ''} · {event.type}
          </Text>
        )}
      </View>
      <Text style={styles.date}>{event.date?.slice(5)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderColor: theme.border },
  dot: { width: 9, height: 9, borderRadius: 4.5, marginRight: 10 },
  body: { flex: 1, marginRight: 8 },
  title: { fontSize: 14.5, fontWeight: '700', color: theme.text },
  doneText: { textDecorationLine: 'line-through', color: theme.textFaint },
  meta: { fontSize: 11.5, color: theme.textSub, marginTop: 3 },
  date: { fontSize: 12, color: theme.textFaint, fontWeight: '600' },
});
