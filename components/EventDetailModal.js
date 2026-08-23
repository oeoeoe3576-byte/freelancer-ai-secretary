import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ModalOverlay from './ModalOverlay';
import { theme } from '../utils/theme';
import { hexToRgba } from '../utils/colors';

// 일정 상세. 완료 처리/수정/삭제는 반드시 여기서만 가능하다(실수 방지).
export default function EventDetailModal({ visible, event, brand, project, onClose, onToggleDone, onEdit, onDelete }) {
  if (!visible || !event) return null;
  const color = brand?.color || theme.primary;
  return (
    <ModalOverlay visible={visible} onClose={onClose} align="center">
      <View style={[styles.brandTag, { backgroundColor: hexToRgba(color, 0.14) }]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.brandTagText}>{brand?.name || '브랜드 없음'}</Text>
      </View>
      <Text style={styles.project}>{project?.name || '프로젝트 없음'}</Text>
      <Text style={[styles.title, event.done && styles.doneText]}>{event.done ? '✓ ' : ''}{event.title}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaChip}><Text style={styles.metaText}>{event.date}</Text></View>
        <View style={styles.metaChip}><Text style={styles.metaText}>{event.type}</Text></View>
        <View style={[styles.metaChip, event.done ? styles.doneChip : styles.pendingChip]}>
          <Text style={[styles.metaText, event.done ? styles.doneChipText : styles.pendingChipText]}>{event.done ? '완료' : '진행중'}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.primary, event.done ? styles.undoBtn : null]} onPress={onToggleDone}>
        <Text style={[styles.primaryText, event.done && { color: theme.text }]}>{event.done ? '완료 취소' : '완료 처리'}</Text>
      </TouchableOpacity>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.secondary, styles.editBtn]} onPress={onEdit}><Text style={styles.secondaryText}>수정</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.secondary, styles.deleteBtn]} onPress={onDelete}><Text style={styles.deleteText}>삭제</Text></TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>닫기</Text></TouchableOpacity>
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  brandTag: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  brandTagText: { fontSize: 13, fontWeight: '700', color: theme.text },
  project: { fontSize: 13, color: theme.textSub, marginBottom: 4, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 14 },
  doneText: { textDecorationLine: 'line-through', color: theme.textFaint },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 18, flexWrap: 'wrap' },
  metaChip: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  metaText: { fontSize: 12, fontWeight: '700', color: theme.textSub },
  doneChip: { backgroundColor: '#DCFCE7' },
  doneChipText: { color: '#15803D' },
  pendingChip: { backgroundColor: '#FEF3C7' },
  pendingChipText: { color: '#92400E' },
  primary: { backgroundColor: theme.primary, padding: 14, borderRadius: theme.radius.md, alignItems: 'center' },
  undoBtn: { backgroundColor: '#F3F4F6' },
  primaryText: { color: '#fff', fontWeight: '800' },
  row: { flexDirection: 'row', gap: 10, marginTop: 10 },
  secondary: { flex: 1, padding: 13, borderRadius: theme.radius.md, alignItems: 'center' },
  editBtn: { backgroundColor: '#EEF2F7' },
  secondaryText: { color: theme.text, fontWeight: '700' },
  deleteBtn: { backgroundColor: theme.dangerBg },
  deleteText: { color: theme.danger, fontWeight: '800' },
  cancel: { alignItems: 'center', padding: 12, marginTop: 4 },
  cancelText: { color: theme.textSub, fontWeight: '700' },
});
