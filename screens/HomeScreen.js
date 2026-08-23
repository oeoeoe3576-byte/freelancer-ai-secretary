import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { keyOf, daysBetween } from '../utils/date';
import { computeLedgerSummary, formatWon } from '../utils/ledger';
import EventListItem from '../components/EventListItem';
import BrandCard from '../components/BrandCard';
import CalendarCard from '../components/CalendarCard';
import DayDetailPanel from '../components/DayDetailPanel';
import PasteExtractSection from '../components/PasteExtractSection';

export default function HomeScreen({
  brands, projects, enrichedEvents,
  onAddEvent, onOpenEvent, onOpenBrands, onOpenBrand, onOpenLedger,
  onAddBrandQuick, onAddProjectQuick, onExtract,
}) {
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(keyOf(new Date()));

  const todayKey = keyOf(new Date());

  const grouped = useMemo(() => enrichedEvents.reduce((a, e) => ((a[e.date] ||= []).push(e), a), {}), [enrichedEvents]);
  const todayEvents = grouped[todayKey] || [];
  const upcoming = useMemo(
    () => enrichedEvents
      .filter(e => !e.done && daysBetween(todayKey, e.date) >= 0 && daysBetween(todayKey, e.date) <= 3)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [enrichedEvents]
  );

  const projectStats = useMemo(() => {
    const map = new Map();
    for (const p of projects) map.set(p.id, { total: 0, done: 0 });
    for (const e of enrichedEvents) {
      const s = map.get(e.projectId);
      if (!s) continue;
      s.total += 1; if (e.done) s.done += 1;
    }
    return map;
  }, [projects, enrichedEvents]);
  const inProgressProjectCount = projects.filter(p => {
    const s = projectStats.get(p.id) || { total: 0, done: 0 };
    return s.total === 0 || s.done < s.total;
  }).length;

  const ledgerSummary = useMemo(() => computeLedgerSummary(projects, enrichedEvents), [projects, enrichedEvents]);

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
        <View>
          <Text style={styles.kicker}>FREELANCER SECRETARY</Text>
          <Text style={styles.h1}>프리랜서 AI 비서</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onAddEvent}><Text style={styles.addBtnText}>+ 일정</Text></TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.card}><Text style={styles.cardNum}>{todayEvents.filter(e => !e.done).length}</Text><Text style={styles.cardLabel}>오늘 할 일</Text></View>
        <View style={styles.card}><Text style={styles.cardNum}>{upcoming.length}</Text><Text style={styles.cardLabel}>3일 내 마감</Text></View>
        <View style={styles.card}><Text style={styles.cardNum}>{inProgressProjectCount}</Text><Text style={styles.cardLabel}>진행 중 프로젝트</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>오늘 일정</Text>
        {todayEvents.length ? todayEvents.map(e => (
          <EventListItem key={e.id} event={e} brand={e.brand} project={e.project} onPress={() => onOpenEvent(e.id)} />
        )) : <Text style={styles.empty}>오늘 등록된 일정이 없습니다.</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>마감 임박</Text>
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
        )) : <Text style={styles.empty}>3일 이내 마감이 없습니다.</Text>}
      </View>

      <View style={styles.section}>
        <View style={styles.brandSectionHead}>
          <Text style={styles.sectionTitle}>가계부</Text>
          <TouchableOpacity onPress={onOpenLedger}><Text style={styles.link}>전체보기 ›</Text></TouchableOpacity>
        </View>
        <View style={styles.ledgerRow}>
          <View style={styles.ledgerCard}>
            <Text style={styles.ledgerNum}>{formatWon(ledgerSummary.pendingThisMonth)}</Text>
            <Text style={styles.ledgerLabel}>이번 달 정산 예정</Text>
          </View>
          <View style={styles.ledgerCard}>
            <Text style={styles.ledgerNum}>{formatWon(ledgerSummary.settledThisMonth)}</Text>
            <Text style={styles.ledgerLabel}>이번 달 정산 완료</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.brandSectionHead}>
          <Text style={styles.sectionTitle}>브랜드</Text>
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

      <PasteExtractSection
        brands={brands}
        projects={projects}
        onAddBrand={onAddBrandQuick}
        onAddProject={onAddProjectQuick}
        onExtract={onExtract}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>달력</Text>
        <CalendarCard
          cursor={cursor}
          onCursorChange={setCursor}
          view={view}
          onViewChange={setView}
          grouped={grouped}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          todayKey={todayKey}
        />
        <DayDetailPanel dateKey={selectedDate} events={grouped[selectedDate] || []} onOpenEvent={onOpenEvent} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 18, paddingBottom: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  kicker: { fontSize: 11, letterSpacing: 1.4, color: theme.textSub, fontWeight: '700' },
  h1: { fontSize: 26, fontWeight: '800', color: theme.text, marginTop: 4 },
  addBtn: { backgroundColor: theme.primary, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  card: { flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: theme.radius.lg, ...theme.shadow },
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
  ledgerRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  ledgerCard: { flex: 1, backgroundColor: '#F8F9FB', padding: 12, borderRadius: theme.radius.md },
  ledgerNum: { fontSize: 16, fontWeight: '800', color: theme.text },
  ledgerLabel: { fontSize: 11, color: theme.textSub, marginTop: 3 },
  link: { fontSize: 12.5, color: theme.textSub, fontWeight: '700' },
  addBrandCard: { width: 100, borderRadius: theme.radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C6CBD3', alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  addBrandCardText: { fontSize: 12, color: theme.textSub, fontWeight: '700', textAlign: 'center' },
  emptyBrandBtn: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C6CBD3', borderRadius: theme.radius.lg, alignItems: 'center', padding: 18, marginTop: 4 },
  emptyBrandBtnText: { color: theme.textSub, fontWeight: '700' },
});
