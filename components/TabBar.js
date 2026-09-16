import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { theme } from '../utils/theme';

const TABS = [
  { key: 'home', label: '홈', icon: '🏠' },
  { key: 'calendar', label: '일정', icon: '📅' },
  { key: 'add', label: '추가', icon: '➕' },
  { key: 'ledger', label: '가계부', icon: '💰' },
  { key: 'brands', label: '브랜드', icon: '🏷️' },
];

// 하단 탭바. 어느 화면(브랜드 상세 등)에 들어가 있어도 항상 보이며,
// 탭을 누르면 그 탭의 기본 화면으로 바로 이동한다.
export default function TabBar({ active, onChange }) {
  return (
    <View style={styles.wrap}>
      {TABS.map(t => {
        const on = active === t.key;
        return (
          <TouchableOpacity key={t.key} onPress={() => onChange(t.key)} style={styles.tab} hitSlop={{ top: 6, bottom: 6 }}>
            <View style={[styles.iconWrap, on && styles.iconWrapOn]}>
              <Text style={styles.icon}>{t.icon}</Text>
            </View>
            <Text style={[styles.label, on && styles.labelOn]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderColor: theme.border,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
    paddingHorizontal: 6,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  iconWrap: { width: 40, height: 28, borderRadius: theme.radius.pill, alignItems: 'center', justifyContent: 'center' },
  iconWrapOn: { backgroundColor: '#FFE9D6' },
  icon: { fontSize: 16 },
  label: { fontSize: 10.5, fontWeight: '700', color: theme.textFaint },
  labelOn: { color: theme.text },
});
