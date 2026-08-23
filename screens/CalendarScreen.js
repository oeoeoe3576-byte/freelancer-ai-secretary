import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { keyOf } from '../utils/date';
import CalendarCard from '../components/CalendarCard';
import DayDetailPanel from '../components/DayDetailPanel';

// 일정 탭: 월/주/일 달력. 일 보기에서는 달력 컴포넌트 안에서 바로 목록을 보여주므로
// 아래 날짜 상세 패널은 월/주 보기일 때만 노출한다(중복 방지).
export default function CalendarScreen({ enrichedEvents, onOpenEvent }) {
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(keyOf(new Date()));
  const todayKey = keyOf(new Date());

  const grouped = useMemo(() => enrichedEvents.reduce((a, e) => ((a[e.date] ||= []).push(e), a), {}), [enrichedEvents]);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.h1}>📅 일정</Text>
      <View style={styles.card}>
        <CalendarCard
          cursor={cursor}
          onCursorChange={setCursor}
          view={view}
          onViewChange={setView}
          grouped={grouped}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          todayKey={todayKey}
          onOpenEvent={onOpenEvent}
        />
        {view !== 'day' && (
          <DayDetailPanel dateKey={selectedDate} events={grouped[selectedDate] || []} onOpenEvent={onOpenEvent} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 18, paddingBottom: 50 },
  h1: { fontSize: 22, fontWeight: '800', color: theme.text, marginBottom: 14 },
  card: { backgroundColor: theme.card, padding: 16, borderRadius: theme.radius.lg, ...theme.shadow },
});
