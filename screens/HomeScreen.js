import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { keyOf, daysBetween } from '../utils/date';
import EventListItem from '../components/EventListItem';
import BrandCard from '../components/BrandCard';

// 홈: 한눈에 보이는 요약만. 자세한 내용(달력/추가/가계부)은 하단 탭에서 각각 확인한다.
export default function HomeScreen({
  brands, projects, enrichedEvents,
  onOpenEvent, onOpenBrands, onOpenBrand, onAddBrandQuick,
}) {
  const todayKey = keyOf(new Date());

  const grouped = useMemo(() => enrichedEvents.reduce((a, e) => ((a[e.date] ||= []).push(e), a), {}), [enrichedEvents]);
  const todayEvents = grouped[todayKey] || [];
  const upcoming = useMemo(
    () => enrichedEvents
      .filter(e => !e.done && daysBetween(todayKey, e.date) >= 0 && daysBetween(todayKey, e.date) <= 3)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [enrichedEvents]
  );

  const inProgressProjectCount = useMemo(() => {
    const stats = new Map();
    for (const p of projects) stats.set(p.id, { total: 0, done: 0 });
    for (const e of enrichedEvents) {
      const s = stats.get(e.projectId);
      if (!s) continue;
      s.total += 1; if (e.done) s.done += 1;
    }
    return projects.filter(p => {
      const s = stats.get(p.id) || { total: 0, done: 0 };
      return s.total === 0 || s.done < s.total;
    }).length;
  }, [projects, enrichedEvents]);

  const brandStats = useMemo(() => {
    const map = new Map();
    for (const b of brands) map.set(b.id, { projectCount: 0, eventCount: 0 });
    for (const p of projects) { const s = map.get(p.brandId); if (s) s.projectCount += 1; }
    for (const e of enrichedEvents) { const s = map.get(e.brandId); if (s) s.eventCount += 1; }
    return map;
  }, [brands, projects, enrichedEvents]);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.kicker}>FREELANCER SECRETARY</Text>
        <Text style={styles.h1}>안녕하세요 👋</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>🗓️</Text>
          <Text style={styles.cardNum}>{todayEvents.filter(e => !e.done).length}</Text>
          <Text style={styles.cardLabel}>오늘 할 일</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>⏰</Text>
          <Text style={styles.cardNum}>{upcoming.length}</Text>
          <Text style={styles.cardLabel}>3일 내 마감</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>🚀</Text>
          <Text style={styles.cardNum}>{inProgressProjectCount}</Text>
          <Text style={styles.cardLabel}>진행 중 프로젝트</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗓️ 오늘 일정</Text>
        {todayEvents.length ? todayEvents.map(e => (
          <EventListItem key={e.id} event={e} brand={e.brand} project={e.project} onPress={() => onOpenEvent(e.id)} />
        )) : <Text style={styles.empty}>오늘 등록된 일정이 없어요.</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏰ 마감 임박</Text>
        {upcoming.length ? upcoming.map(e => (
          <TouchableOpacity key={e.id} onPress={() => onOpenEvent(e.id)} style={styles.deadline}>
            <View style={styles.deadlineLeft}>
              <View style={[styles.dot, { backgroundColor: e.brand?.color || theme.primary }]} />
              <View>
                <Text style={styles.deadlineBrand}>{e.brand?.name || '브랜드 없음'}</Text>
                <Text style={styles.deadlineProject}>{e.project?.name || ''}</Text>
                <Text style={styles.deadlineTitle}>{e.title}</Text>
              </View>
            </View>
            <Text style={styles.dday}>D-{daysBetween(todayKey, e.date)}</Text>
          </TouchableOpacity>
        )) : <Text style={styles.empty}>3일 이내 마감이 없어요.</Text>}
      </View>

      <View style={styles.section}>
        <View style={styles.brandSectionHead}>
          <Text style={styles.sectionTitle}>🏷️ 브랜드</Text>
          <TouchableOpacity onPress={onOpenBrands}><Text style={styles.link}>전체보기 ›</Text></TouchableOpacity>
        </View>
        {brands.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {brands.map(b => {
              const s = brandStats.get(b.id) || { projectCount: 0, eventCount: 0 };
              return (
                <BrandCard key={b.id} brand={b} projectCount={s.projectCount} eventCount={s.eventCount} onPress={() => onOpenBrand(b.id)} compact />
              );
            })}
            <TouchableOpacity style={styles.addBrandCard} onPress={() => onAddBrandQuick()}>
              <Text style={styles.addBrandCardText}>+{'\n'}브랜드 추가</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <TouchableOpacity style={styles.emptyBrandBtn} onPress={() => onAddBrandQuick()}>
            <Text style={styles.emptyBrandBtnText}>+ 첫 브랜드 추가하기</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 18, paddingBottom: 30 },
  headerRow: { marginBottom: 16 },
  kicker: { fontSize: 11, letterSpacing: 1.4, color: theme.textSub, fontWeight: '700' },
  h1: { fontSize: 26, fontWeight: '800', color: theme.text, marginTop: 4 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  card: { flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: theme.radius.lg, ...theme.shadow },
  cardEmoji: { fontSize: 15, marginBottom: 4 },
  cardNum: { fontSize: 22, fontWeight: '800', color: theme.text },
  cardLabel: { fontSize: 11.5, color: theme.textSub, marginTop: 3 },
  section: { backgroundColor: theme.card, padding: 16, borderRadius: theme.radius.lg, marginBottom: 14, ...theme.shadow },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 4 },
  empty: { fontSize: 12.5, color: theme.textFaint, paddingVertical: 14, textAlign: 'center' },
  deadline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderTopWidth: 1, borderColor: theme.border },
  deadlineLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, marginRight: 8 },
  dot: { width: 9, height: 9, borderRadius: 4.5, marginRight: 9, marginTop: 4 },
  deadlineBrand: { fontSize: 11.5, fontWeight: '700', color: theme.textSub },
  deadlineProject: { fontSize: 11.5, color: theme.textFaint, marginTop: 1 },
  deadlineTitle: { fontWeight: '700', fontSize: 14, color: theme.text, marginTop: 2 },
  dday: { fontSize: 15, fontWeight: '800', color: theme.text },
  brandSectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  link: { fontSize: 12.5, color: theme.textSub, fontWeight: '700' },
  addBrandCard: { width: 100, borderRadius: theme.radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#D8CFC6', alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  addBrandCardText: { fontSize: 12, color: theme.textSub, fontWeight: '700', textAlign: 'center' },
  emptyBrandBtn: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#D8CFC6', borderRadius: theme.radius.lg, alignItems: 'center', padding: 18, marginTop: 4 },
  emptyBrandBtnText: { color: theme.textSub, fontWeight: '700' },
});
