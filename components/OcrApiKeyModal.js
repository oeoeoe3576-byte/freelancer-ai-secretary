import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { theme } from '../utils/theme';

// 사진 글자 인식(OCR)에 쓸 API 키를 최초 1회(또는 변경 시) 입력받는 팝업.
// 무료 발급 링크를 함께 안내한다. 실수로 닫히면 안 되므로 바깥을 눌러도 닫히지 않는다.
export default function OcrApiKeyModal({ visible, initialValue, onSave, onCancel }) {
  const [key, setKey] = useState('');

  useEffect(() => {
    if (visible) setKey(initialValue || '');
  }, [visible, initialValue]);

  if (!visible) return null;

  const save = () => {
    if (!key.trim()) return;
    onSave(key.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>사진 글자 인식 키 등록</Text>
          <Text style={styles.desc}>
            사진 속 글자를 읽으려면 무료 OCR API 키가 한 번 필요해요.{'\n'}
            아래 링크에서 이메일만으로 무료 발급받은 뒤 붙여넣어주세요.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://ocr.space/ocrapi/freekey')}>
            <Text style={styles.link}>무료 키 발급받기 →</Text>
          </TouchableOpacity>
          <TextInput
            value={key}
            onChangeText={setKey}
            placeholder="발급받은 API 키 붙여넣기"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          <TouchableOpacity style={[styles.primary, !key.trim() && styles.primaryDisabled]} onPress={save} disabled={!key.trim()}>
            <Text style={styles.primaryText}>저장하고 계속</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skip} onPress={onCancel}>
            <Text style={styles.skipText}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: theme.overlay, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%', maxWidth: 420,
    backgroundColor: theme.card, borderRadius: theme.radius.lg,
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  title: { fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 8 },
  desc: { fontSize: 12.5, color: theme.textSub, lineHeight: 19, marginBottom: 10 },
  link: { fontSize: 13, color: theme.primary, fontWeight: '800', marginBottom: 14 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, padding: 12, marginBottom: 10, fontSize: 14 },
  primary: { backgroundColor: theme.primary, padding: 14, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 6 },
  primaryDisabled: { opacity: 0.4 },
  primaryText: { color: '#fff', fontWeight: '800' },
  skip: { alignItems: 'center', padding: 12, marginTop: 2 },
  skipText: { color: theme.textSub, fontWeight: '700', fontSize: 12.5 },
});
