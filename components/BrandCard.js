import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { hexToRgba } from '../utils/colors';

export default function BrandCard({ brand, projectCount, eventCount, onPress, onEdit, compact }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, compact && styles.cardCompact, { borderColor: hexToRgba(brand.color, 0.35) }]}>
      <View style={styles.topRow}>
        <View style={[styles.dot, { backgroundColor: brand.color }]} />
        {onEdit && (
          <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{brand.name}</Text>
      <Text style={styles.meta}>진행 중 프로젝트 {projectCount}개</Text>
      <Text style={styles.meta}>전체 일정 {eventCount}개</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: 168, backgroundColor: theme.card, borderRadius: theme.radius.lg, padding: 14, borderWidth: 1.5, marginRight: 10, ...theme.shadow },
  cardCompact: { width: 150 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  editIcon: { fontSize: 13, color: theme.textFaint },
  name: { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 6 },
  meta: { fontSize: 11.5, color: theme.textSub, marginTop: 1 },
});
