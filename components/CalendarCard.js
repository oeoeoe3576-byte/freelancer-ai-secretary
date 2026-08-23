import React, { useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import { theme } from '../utils/theme';
import { WEEK, keyOf, addDays, startOfWeek, monthLabel, dayLabel } from '../utils/date';

function EventChip({ e }) {
  const color = e.brand?.color || theme.primary;
  const label = `${e.brand?.name || ''} ${e.title}`.trim();
  return (
    <View style={styles.chip}>
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <Text numberOfLines={1} style={[styles.chipText, e.done && styles.chipTextDone]}>{label}</Text>
    </View>
  );
}

// 월/주 달력. 날짜를 누르면 완료 처리 등 동작 없이 선택만 되고, 상세 목록은 바깥(DayDetailPanel)에서 보여준다.
export default function CalendarCard({ cursor, onCursorChange, view, onViewChange, grouped, selectedDate, onSelectDate, todayKey }) {
  const monthCells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor]);
  const weekCells = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i)), [cursor]);

  const move = (n) => {
    const d = new Date(cursor);
    if (view === 'month') d.setMonth(d.getMonth() + n);
    else d.setDate(d.getDate() + 7 * n);
    onCursorChange(d);
  };

  const goToday = () => { const d = new Date(); onCursorChange(d); onSelectDate(keyOf(d)); };

  // 달력을 좌우로 스와이프해도 이전/다음 달(주)로 넘어가도록 지원 (버튼 탭과 동시에 사용 가능)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gesture) =>
        Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
      onPanResponderRelease: (evt, gesture) => {
        if (gesture.dx <= -40) move(1);
        else if (gesture.dx >= 40) move(-1);
      },
    })
  ).current;

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => move(-1)} style={styles.nav}><Text style={styles.navText}>‹</Text></TouchableOpacity>
        <TouchableOpacity onPress={goToday}><Text style={styles.title}>{monthLabel(cursor)}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => move(1)} style={styles.nav}><Text style={styles.navText}>›</Text></TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['month', 'week'].map(v => (
          <TouchableOpacity key={v} onPress={() => onViewChange(v)} style={[styles.tab, view === v && styles.tabOn]}>
            <Text style={[styles.tabText, view === v && styles.tabTextOn]}>{v === 'month' ? '월' : '주'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View {...panResponder.panHandlers}>
      {view === 'month' && (
        <>
          <View style={styles.weekHeader}>{WEEK.map(w => <Text key={w} style={styles.weekHeadText}>{w}</Text>)}</View>
          <View style={styles.monthGrid}>
            {monthCells.map(d => {
              const k = keyOf(d);
              const active = d.getMonth() === cursor.getMonth();
              const list = grouped[k] || [];
              const isSelected = k === selectedDate;
              return (
                <TouchableOpacity key={k} onPress={() => onSelectDate(k)} style={[styles.dayCell, k === todayKey && styles.todayCell, isSelected && styles.selectedCell]}>
                  <Text style={[styles.dayNum, !active && styles.muted, k === todayKey && styles.todayNum]}>{d.getDate()}</Text>
                  {list.slice(0, 2).map(e => <EventChip e={e} key={e.id} />)}
                  {list.length > 2 && <Text style={styles.more}>+{list.length - 2}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {view === 'week' && (
        <View>
          {weekCells.map(d => {
            const k = keyOf(d);
            const list = grouped[k] || [];
            const isSelected = k === selectedDate;
            return (
              <TouchableOpacity key={k} onPress={() => onSelectDate(k)} style={[styles.weekRow, isSelected && styles.selectedRow]}>
                <View style={styles.weekDate}>
                  <Text style={styles.weekDay}>{WEEK[d.getDay()]}</Text>
                  <Text style={[styles.weekDateNum, k === todayKey && styles.todayNum]}>{d.getDate()}</Text>
                </View>
                <View style={styles.weekEvents}>
                  {list.length ? list.map(e => <EventChip e={e} key={e.id} />) : <Text style={styles.empty}>일정 없음</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 17, fontWeight: '800', color: theme.text },
  nav: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 16, color: theme.text },
  tabs: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginVertical: 12, alignSelf: 'flex-start' },
  tab: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 9 },
  tabOn: { backgroundColor: '#fff' },
  tabText: { color: theme.textSub, fontWeight: '700', fontSize: 13 },
  tabTextOn: { color: theme.text },
  weekHeader: { flexDirection: 'row' },
  weekHeadText: { width: '14.2857%', textAlign: 'center', fontSize: 11, color: theme.textSub, paddingBottom: 7 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', minHeight: 76, borderTopWidth: 1, borderColor: theme.border, padding: 4, borderRadius: 6 },
  todayCell: { backgroundColor: '#F8FAFC' },
  selectedCell: { backgroundColor: '#EEF2FF' },
  dayNum: { fontSize: 12, fontWeight: '700', color: theme.text },
  todayNum: { color: '#4F46E5' },
  muted: { color: '#C6CBD3' },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 6, paddingHorizontal: 3, paddingVertical: 2, marginTop: 3 },
  chipDot: { width: 5, height: 5, borderRadius: 2.5, marginRight: 3 },
  chipText: { fontSize: 8.5, color: theme.text, flexShrink: 1 },
  chipTextDone: { textDecorationLine: 'line-through', color: theme.textFaint },
  more: { fontSize: 9, color: theme.textSub, marginTop: 2 },
  weekRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: theme.border, paddingVertical: 10, borderRadius: 8 },
  selectedRow: { backgroundColor: '#EEF2FF' },
  weekDate: { width: 50, alignItems: 'center' },
  weekDay: { fontSize: 11, color: theme.textSub },
  weekDateNum: { fontSize: 19, fontWeight: '800', color: theme.text },
  weekEvents: { flex: 1, gap: 5, justifyContent: 'center', paddingLeft: 4 },
  empty: { fontSize: 12, color: theme.textFaint },
});
