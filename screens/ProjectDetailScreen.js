import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { hexToRgba } from '../utils/colors';
import { formatWon } from '../utils/ledger';
import AppHeader from '../components/AppHeader';
import EventListItem from '../components/EventListItem';

export default function ProjectDetailScreen({ project, brand, events, onBack, onOpenEvent, onAddEvent, onEditProject, onDeleteProject, onToggleSettled }) {
  const projectEvents = useMemo(
    () => events.filter(e => e.projectId === project.id).sort((a, b) => a.date.localeCompare(b.date)),
    [events, project.id]
  );
  const done = projectEvents.filter(e => e.done).length;
  const color = brand?.color || theme.primary;

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <AppHeader title={project.name} onBack={onBack} />

      <View style={[styles.banner, { backgroundColor: hexToRgba(color, 0.12) }]}>
        <View style={styles.bannerTop}>
          <View style={styles.brandTag}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={styles.brandName}>{brand?.name || '브랜드 없음'}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEditProject} style={styles.iconBtn}><Text style={styles.iconText}>✎ 수정</Text></TouchableOpacity>
            <TouchableOpacity onPress={onDeleteProject} style={styles.iconBtn}><Text style={[styles.iconText, styles.deleteText]}>삭제</Text></TouchableOpacity>
          </View>
        </View>
        <Text style={styles.projectName}>{project.name}</Text>
        {!!project.memo && <Text style={styles.memo}>{project.memo}</Text>}
        <Text style={styles.progress}>{done} / {projectEvents.length} 완료 · 남은 일정 {projectEvents.length - done}개</Text>

        {!!project.amount && (
          <View style={styles.settleRow}>
            <View>
              <Text style={styles.settleAmount}>{formatWon(project.amount)}</Text>
              <Text style={[styles.settleStatus, project.settled ? styles.settledText : styles.pendingText]}>
                {project.settled
                  ? `정산 완료 · ${project.settledAt || ''}`
                  : `정산 대기중${project.dueDate ? ` · 예정일 ${project.dueDate}` : ''}`}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.settleBtn, project.settled ? styles.settleBtnDone : styles.settleBtnPending]}
              onPress={onToggleSettled}
            >
              <Text style={[styles.settleBtnText, project.settled && styles.settleBtnTextDone]}>
                {project.settled ? '정산 취소' : '정산 완료 처리'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>세부 일정</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAddEvent}><Text style={styles.addBtnText}>+ 일정</Text></TouchableOpacity>
      </View>
      {projectEvents.length === 0 ? (
        <Text style={styles.empty}>등록된 일정이 없습니다.</Text>
      ) : (
        projectEvents.map(e => (
          <EventListItem key={e.id} event={e} brand={brand} project={project} showProject={false} onPress={() => onOpenEvent(e.id)} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 18, paddingBottom: 50 },
  banner: { borderRadius: theme.radius.lg, padding: 16, marginBottom: 18 },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandTag: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  brandName: { fontSize: 12.5, fontWeight: '700', color: theme.textSub },
  actions: { flexDirection: 'row', gap: 10 },
  iconBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  iconText: { fontSize: 12.5, fontWeight: '700', color: theme.textSub },
  deleteText: { color: theme.danger },
  projectName: { fontSize: 19, fontWeight: '800', color: theme.text, marginTop: 6 },
  memo: { fontSize: 13, color: theme.textSub, marginTop: 6, lineHeight: 19 },
  progress: { fontSize: 12.5, fontWeight: '700', color: theme.text, marginTop: 10 },
  settleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  settleAmount: { fontSize: 18, fontWeight: '800', color: theme.text },
  settleStatus: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  settledText: { color: '#15803D' },
  pendingText: { color: '#92400E' },
  settleBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: theme.radius.sm },
  settleBtnPending: { backgroundColor: theme.primary },
  settleBtnDone: { backgroundColor: '#F3F4F6' },
  settleBtnText: { color: '#fff', fontWeight: '800', fontSize: 12.5 },
  settleBtnTextDone: { color: theme.text },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.text },
  addBtn: { backgroundColor: theme.primary, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty: { fontSize: 13, color: theme.textFaint, textAlign: 'center', marginTop: 24 },
});
