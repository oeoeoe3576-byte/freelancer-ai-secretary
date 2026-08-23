import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { hexToRgba } from '../utils/colors';
import { formatWon } from '../utils/ledger';

// 가계부 목록의 한 줄. 프로젝트당 금액 1개 기준이며, 정산 여부를 바로 토글할 수 있다.
export default function LedgerItem({ project, brand, onPress, onToggleSettled }) {
  const color = brand?.color || theme.primary;
  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <View style={styles.body}>
        <Text style={styles.brand} numberOfLines={1}>{brand?.name || '브랜드 없음'}</Text>
        <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
        <Text style={styles.amount}>{formatWon(project.amount)}</Text>
      </View>
      <TouchableOpacity
        onPress={onToggleSettled}
        style={[styles.badge, project.settled ? styles.badgeDone : { backgroundColor: hexToRgba(color, 0.14) }]}
      >
        <Text style={[styles.badgeText, project.settled ? styles.badgeTextDone : { color }]}>
          {project.settled ? '정산완료' : '정산대기'}
        </Text>
      </TouchableOpacity>
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
  badge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginRight: 12 },
  badgeDone: { backgroundColor: '#DCFCE7' },
  badgeText: { fontSize: 11.5, fontWeight: '800' },
  badgeTextDone: { color: '#15803D' },
});
