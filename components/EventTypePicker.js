import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { EVENT_TYPES } from '../utils/constants';

// 업무 유형 선택 칩. 미리 정해둔 유형 외에 "+ 직접입력"을 누르면
// 원하는 이름을 자유롭게 적을 수 있다(값이 미리 정한 유형에 없으면 자동으로 직접입력 모드로 보인다).
export default function EventTypePicker({ value, onChange }) {
  const customMode = !EVENT_TYPES.includes(value);
  return (
    <View>
      <View style={styles.typeRow}>
        {EVENT_TYPES.map(t => (
          <TouchableOpacity key={t} onPress={() => onChange(t)} style={[styles.typeBtn, value === t && styles.typeOn]}>
            <Text style={[styles.typeText, value === t && styles.typeTextOn]}>{t}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => onChange('')} style={[styles.typeBtn, styles.customBtn, customMode && styles.typeOn]}>
          <Text style={[styles.typeText, customMode && styles.typeTextOn]}>+ 직접입력</Text>
        </TouchableOpacity>
      </View>
      {customMode && (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="유형 이름을 입력하세요 (예: 라이브방송)"
          placeholderTextColor={theme.textFaint}
          style={styles.customInput}
          autoFocus
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: { paddingHorizontal: 13, paddingVertical: 9, backgroundColor: '#F6F1EC', borderRadius: theme.radius.pill },
  customBtn: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#C6CBD3', backgroundColor: 'transparent' },
  typeOn: { backgroundColor: theme.text, borderColor: theme.text },
  typeText: { fontSize: 13, color: theme.textSub, fontWeight: '600' },
  typeTextOn: { color: '#fff', fontWeight: '800' },
  customInput: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, padding: 12, marginTop: 8, fontSize: 14 },
});
