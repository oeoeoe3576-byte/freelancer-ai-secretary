import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ModalOverlay from './ModalOverlay';
import { theme } from '../utils/theme';

// 삭제 등 되돌릴 수 없는 동작 전에 항상 거치는 확인 팝업
export default function ConfirmModal({ visible, title, message, confirmLabel = '삭제', cancelLabel = '취소', danger = true, onConfirm, onCancel }) {
  if (!visible) return null;
  return (
    <ModalOverlay visible={visible} onClose={onCancel} align="center">
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
          <Text style={styles.cancelText}>{cancelLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, danger ? styles.dangerBtn : styles.okBtn]} onPress={onConfirm}>
          <Text style={styles.confirmText}>{confirmLabel}</Text>
        </TouchableOpacity>
      </View>
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 13, color: theme.textSub, lineHeight: 19, marginBottom: 18, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 13, borderRadius: theme.radius.md, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F3F4F6' },
  cancelText: { color: theme.textSub, fontWeight: '700' },
  dangerBtn: { backgroundColor: theme.danger },
  okBtn: { backgroundColor: theme.primary },
  confirmText: { color: '#fff', fontWeight: '800' },
});
