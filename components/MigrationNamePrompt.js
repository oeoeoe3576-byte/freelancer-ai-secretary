import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import ColorPicker from './ColorPicker';
import { theme } from '../utils/theme';

// 예전 버전(v1)에서 브랜드/프로젝트 구분 없이 저장돼 있던 일정을 새 구조로 옮긴 뒤,
// 임시로 "기존 일정"이라 이름 붙인 브랜드의 실제 이름을 입력받는 화면.
// 실수로 닫히면 안 되므로 바깥을 눌러도 닫히지 않고, "저장" 또는 "나중에 하기"로만 넘어간다.
export default function MigrationNamePrompt({ visible, brand, eventCount, onSave, onSkip }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');

  useEffect(() => {
    if (visible && brand) {
      setName('');
      setColor(brand.color || '#3B82F6');
    }
  }, [visible, brand]);

  if (!visible || !brand) return null;

  const save = () => {
    if (!name.trim()) return;
    onSave(name.trim(), color);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>브랜드명을 알려주세요</Text>
          <Text style={styles.desc}>
            예전에 저장하신 일정 {eventCount}개를 새 구조로 옮겼어요.{'\n'}
            "기존 일정" 대신 실제 브랜드명을 입력해주세요.
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="예) Saily"
            style={styles.input}
            autoFocus
          />
          <Text style={styles.label}>브랜드 컬러</Text>
          <ColorPicker value={color} onChange={setColor} />
          <TouchableOpacity style={[styles.primary, !name.trim() && styles.primaryDisabled]} onPress={save} disabled={!name.trim()}>
            <Text style={styles.primaryText}>저장</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skip} onPress={onSkip}>
            <Text style={styles.skipText}>나중에 하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: theme.overlay, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%', maxWidth: 420, maxHeight: '85%',
    backgroundColor: theme.card, borderRadius: theme.radius.lg,
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  title: { fontSize: 19, fontWeight: '800', color: theme.text, marginBottom: 8 },
  desc: { fontSize: 12.5, color: theme.textSub, lineHeight: 19, marginBottom: 14 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, padding: 12, marginBottom: 10, fontSize: 14 },
  label: { fontSize: 12, fontWeight: '800', color: theme.textSub, marginBottom: 8 },
  primary: { backgroundColor: theme.primary, padding: 14, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 10 },
  primaryDisabled: { opacity: 0.4 },
  primaryText: { color: '#fff', fontWeight: '800' },
  skip: { alignItems: 'center', padding: 12, marginTop: 2 },
  skipText: { color: theme.textSub, fontWeight: '700', fontSize: 12.5 },
});
