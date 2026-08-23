import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { dayLabel, parseKey } from '../utils/date';
import EventListItem from './EventListItem';

// 달력에서 날짜를 선택하면 그 날짜의 일정을 브랜드 > 프로젝트로 묶어 보여준다.
export default function DayDetailPanel({ dateKey, events, onOpenEvent }) {
  const groups = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      const bId = e.brandId || 'none';
      if (!map.has(bId)) map.set(bId, { brand: e.brand, projects: new Map() });
      const g = map.get(bId);
      const pId = e.projectId || 'none';
      if (!g.projects.has(pId)) g.projects.set(pId, { project: e.project, events: [] });
      g.projects.get(pId).events.push(e);
    }
    return Array.from(map.values());
  }, [events]);

  if (!dateKey) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.date}>{dayLabel(parseKey(dateKey))}</Text>
      {events.length === 0 ? (
        <Text style={styles.empty}>등록된 일정이 없습니다.</Text>
      ) : (
        groups.map((g, gi) => (
          <View key={gi} style={styles.brandBlock}>
            <View style={styles.brandHead}>
              <View style={[styles.dot, { backgroundColor: g.brand?.color || theme.primary }]} />
              <Text style={styles.brandName}>{g.brand?.name || '브랜드 없음'}</Text>
            </View>
            {Array.from(g.projects.values()).map((pg, pi) => (
              <View key={pi} style={styles.projectBlock}>
                <Text style={styles.projectName}>{pg.project?.name || '프로젝트 없음'}</Text>
                {pg.events.map(e => (
                  <EventListItem key={e.id} event={e} brand={g.brand} project={pg.project} showProject={false} onPress={() => onOpenEvent(e.id)} />
                ))}
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 14, borderTopWidth: 1, borderColor: theme.border, paddingTop: 14 },
  date: { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 8 },
  empty: { fontSize: 13, color: theme.textFaint, paddingVertical: 12, textAlign: 'center' },
  brandBlock: { marginBottom: 10 },
  brandHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  brandName: { fontSize: 13, fontWeight: '800', color: theme.text },
  projectBlock: { marginLeft: 14, marginTop: 2 },
  projectName: { fontSize: 12, fontWeight: '700', color: theme.textSub, marginTop: 4 },
});
