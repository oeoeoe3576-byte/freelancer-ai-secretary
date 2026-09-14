import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ModalOverlay from './ModalOverlay';
import ColorPicker from './ColorPicker';
import { theme } from '../utils/theme';
import { pickBrandColor } from '../utils/colors';

// 브랜드 선택 화면에서 "새 브랜드"를 누르면 뜨는 폼.
// 브랜드는 항상 프로젝트가 있어야 일정을 등록할 수 있으므로, 브랜드 따로 -> 프로젝트 따로
// 두 번 타지 않게 브랜드 이름/컬러와 첫 프로젝트 이름을 한 화면에서 같이 받는다.
export default function BrandProjectFormModal({ visible, existingBrands, onSave, onClose }) {
  const [brandName, setBrandName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    if (visible) {
      setBrandName('');
      setColor(pickBrandColor(existingBrands || []));
      setProjectName('');
    }
  }, [visible]);

  const save = () => {
    if (!brandName.trim()) { Alert.alert('브랜드 이름을 입력해주세요.'); return; }
    if (!projectName.trim()) { Alert.alert('프로젝트 이름을 입력해주세요.'); return; }
    onSave({ brandName: brandName.trim(), color, projectName: projectName.trim() });
  };

  if (!visible) return null;
  return (
    <ModalOverlay visible={visible} onClose={onClose} align="center">
      <Text style={styles.title}>새 브랜드 + 프로젝트</Text>
      <Text style={styles.desc}>브랜드와 첫 프로젝트를 한 번에 만듭니다.</Text>

      <Text style={styles.label}>브랜드 이름 *</Text>
      <TextInput
        value={brandName}
        onChangeText={setBrandName}
        placeholder="예) Saily"
        placeholderTextColor={theme.textFaint}
        style={styles.input}
      />
      <Text style={styles.label}>브랜드 컬러</Text>
      <ColorPicker value={color} onChange={setColor} />

      <Text style={[styles.label, { marginTop: 10 }]}>프로젝트 이름 *</Text>
      <TextInput
        value={projectName}
        onChangeText={setProjectName}
        placeholder="예) eSIM 릴스 협찬"
        placeholderTextColor={theme.textFaint}
        style={styles.input}
      />

      <TouchableOpacity style={styles.primary} onPress={save}>
        <Text style={styles.primaryText}>브랜드+프로젝트 추가</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>취소</Text></TouchableOpacity>
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 4 },
  desc: { fontSize: 12.5, color: theme.textSub, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '800', color: theme.textSub, marginBottom: 8, marginTop: 4 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, padding: 12, marginBottom: 6, fontSize: 14 },
  primary: { backgroundColor: theme.primary, padding: 14, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 10 },
  primaryText: { color: '#fff', fontWeight: '800' },
  cancel: { alignItems: 'center', padding: 12, marginTop: 2 },
  cancelText: { color: theme.textSub, fontWeight: '700' },
});
