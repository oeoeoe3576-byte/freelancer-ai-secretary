import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { COLOR_PALETTE, isValidHex } from '../utils/colors';
import { theme } from '../utils/theme';

// 기본 팔레트에서 고르거나 HEX 코드를 직접 입력해 브랜드 컬러를 정한다.
export default function ColorPicker({ value, onChange }) {
  const [hexInput, setHexInput] = useState(value || '');

  useEffect(() => { setHexInput(value || ''); }, [value]);

  return (
    <View>
      <View style={styles.row}>
        {COLOR_PALETTE.map(c => (
          <TouchableOpacity
            key={c.hex}
            onPress={() => { onChange(c.hex); setHexInput(c.hex); }}
            style={[styles.swatch, { backgroundColor: c.hex }, value?.toLowerCase() === c.hex.toLowerCase() && styles.swatchOn]}
          />
        ))}
      </View>
      <View style={styles.hexRow}>
        <Text style={styles.hexLabel}>HEX</Text>
        <TextInput
          value={hexInput}
          onChangeText={t => { setHexInput(t); if (isValidHex(t)) onChange(t); }}
          placeholder="#3B82F6"
          placeholderTextColor={theme.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.hexInput}
        />
        <View style={[styles.preview, { backgroundColor: isValidHex(hexInput) ? hexInput : '#eee' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'transparent' },
  swatchOn: { borderColor: theme.text },
  hexRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hexLabel: { fontSize: 12, fontWeight: '700', color: theme.textSub, width: 32 },
  hexInput: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13 },
  preview: { width: 34, height: 34, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: theme.border },
});
