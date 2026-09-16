import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { formatWon } from '../utils/ledger';

// 가계부 목록의 한 줄. 전체가 하나의 탭 대상이며(중첩 버튼으로 인한 오작동 방지),
// 누르면 프로젝트 상세로 이동해서 그곳의 정산 버튼으로 토글한다.
// 정산 예정일만은 목록에서 바로 설정/수정할 수 있게 별도 버튼으로 둔다(중첩 터치, 바깥 onPress는 발동 안 함).
export default function LedgerItem({ project, brand, onPress, onEditDueDate }) {
  const color = brand?.color || theme.primary;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.row}>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <View style={styles.body}>
        <Text style={styles.brand} numberOfLines={1}>{brand?.name || '브랜드 없음'}</Text>
        <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
        <Text style={styles.amount}>{formatWon(project.amount)}</Text>
      </View>
      <View style={styles.badgeCol}>
        <View style={[styles.badge, project.settled ? styles.badgeDone : styles.badgePending]}>
          <Text style={[styles.badgeText, project.settled ? styles.badgeTextDone : styles.badgeTextPending]}>
            {project.settled ? '✓ 정산완료' : '정산대기'}
          </Text>
        </View>
        {!project.settled && (
          <TouchableOpacity onPress={() => onEditDueDate?.(project)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={project.dueDate ? styles.dueDate : styles.dueDateEmpty}>
              {project.dueDate ? `${project.dueDate} 예정 ✎` : '+ 정산일 설정'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderRadius: theme.radius.lg, marginBottom: 10, overflow: 'hidden', ...theme.shadow },
  bar: { width: 6, alignSelf: 'stretch' },
  body: { flex: 1, padding: 14 },
  brand: { fontSize: 11.5, fontWeight: '700', color: theme.textSub },
  name: { fontSize: 15, fontWeight: '800', color: theme.text, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700', color: theme.text, marginTop: 4 },
  badgeCol: { alignItems: 'flex-end', marginRight: 12, gap: 4 },
  badge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radius.pill },
  dueDate: { fontSize: 10.5, color: theme.textFaint, fontWeight: '700' },
  dueDateEmpty: { fontSize: 10.5, color: theme.primary, fontWeight: '800' },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeDone: { backgroundColor: '#DCFCE7' },
  badgeText: { fontSize: 11.5, fontWeight: '800' },
  badgeTextPending: { color: '#92400E' },
  badgeTextDone: { color: '#15803D' },
});
