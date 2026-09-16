import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import ModalOverlay from './ModalOverlay';
import ColorPicker from './ColorPicker';
import { theme } from '../utils/theme';
import { pickBrandColor } from '../utils/colors';
import { notify } from '../utils/alert';

// 브랜드 추가/수정 공용 폼. mode='add'|'edit'
// 새 브랜드는 기존 브랜드와 겹치지 않는 색을 팔레트에서 자동 배정한다(나중에 자유롭게 변경 가능).
export default function BrandFormModal({ visible, mode, initial, existingBrands, onSave, onClose }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');

  useEffect(() => {
    if (visible) {
      setName(initial?.name || '');
      setColor(initial?.color || pickBrandColor(existingBrands || []));
    }
  }, [visible, initial]);

  const save = () => {
    if (!name.trim()) { notify('브랜드 이름을 입력해주세요.'); return; }
    onSave({ ...(initial || {}), name: name.trim(), color });
  };

  if (!visible) return null;
  return (
    <ModalOverlay visible={visible} onClose={onClose} align="center">
      <Text style={styles.title}>{mode === 'edit' ? '브랜드 수정' : '새 브랜드'}</Text>
      <Text style={styles.label}>브랜드 이름 *</Text>
      <TextInput value={name} onChangeText={setName} placeholder="예) Saily" placeholderTextColor={theme.textFaint} style={styles.input} />
      <Text style={styles.label}>브랜드 컬러</Text>
      <ColorPicker value={color} onChange={setColor} />
      <TouchableOpacity style={styles.primary} onPress={save}>
        <Text style={styles.primaryText}>{mode === 'edit' ? '저장' : '브랜드 추가'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>취소</Text></TouchableOpacity>
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '800', color: theme.textSub, marginBottom: 8, marginTop: 4 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, padding: 12, marginBottom: 6, fontSize: 14 },
  primary: { backgroundColor: theme.primary, padding: 14, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 10 },
  primaryText: { color: '#fff', fontWeight: '800' },
  cancel: { alignItems: 'center', padding: 12, marginTop: 2 },
  cancelText: { color: theme.textSub, fontWeight: '700' },
});
