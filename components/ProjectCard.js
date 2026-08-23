import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { hexToRgba } from '../utils/colors';

export default function ProjectCard({ project, brand, total, done, onPress, onEdit }) {
  const remaining = total - done;
  const color = brand?.color || theme.primary;
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.brandName}>{brand?.name || '브랜드 없음'}</Text>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.editIcon}>✎</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
        <View style={styles.progressRow}>
          <View style={[styles.progressChip, { backgroundColor: hexToRgba(color, 0.14) }]}>
            <Text style={[styles.progressText, { color }]}>{done} / {total} 완료</Text>
          </View>
          <Text style={styles.remaining}>남은 일정 {remaining}개</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: theme.card, borderRadius: theme.radius.lg, marginBottom: 10, overflow: 'hidden', ...theme.shadow },
  bar: { width: 6 },
  body: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandName: { fontSize: 11.5, fontWeight: '700', color: theme.textSub },
  editIcon: { fontSize: 13, color: theme.textFaint },
  name: { fontSize: 16, fontWeight: '800', color: theme.text, marginTop: 3, marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressChip: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  progressText: { fontSize: 12, fontWeight: '800' },
  remaining: { fontSize: 11.5, color: theme.textFaint },
});
