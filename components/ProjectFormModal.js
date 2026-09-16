import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import ModalOverlay from './ModalOverlay';
import DatePickerModal from './DatePickerModal';
import { theme } from '../utils/theme';
import { hexToRgba } from '../utils/colors';
import { parseKey, WEEK } from '../utils/date';
import { notify } from '../utils/alert';

// 프로젝트 추가/수정 공용 폼. 브랜드는 항상 고정된 상태로 전달받는다(브랜드 화면/일정폼에서 진입).
export default function ProjectFormModal({ visible, mode, initial, brand, onSave, onClose }) {
  const [name, setName] = useState('');
  const [memo, setMemo] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dateOpen, setDateOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initial?.name || '');
      setMemo(initial?.memo || '');
      setAmount(initial?.amount ? String(initial.amount) : '');
      setDueDate(initial?.dueDate || '');
    }
  }, [visible, initial]);

  const save = () => {
    if (!brand) { notify('브랜드를 먼저 선택해주세요.'); return; }
    if (!name.trim()) { notify('프로젝트 이름을 입력해주세요.'); return; }
    const numericAmount = amount.replace(/[^0-9]/g, '');
    onSave({
      ...(initial || {}),
      brandId: brand.id,
      name: name.trim(),
      memo: memo.trim(),
      amount: numericAmount ? Number(numericAmount) : null,
      dueDate: dueDate || null,
    });
  };

  if (!visible) return null;
  return (
    <ModalOverlay visible={visible} onClose={onClose} align="center">
      <Text style={styles.title}>{mode === 'edit' ? '프로젝트 수정' : '새 프로젝트'}</Text>
      {brand && (
        <View style={[styles.brandTag, { backgroundColor: hexToRgba(brand.color, 0.14) }]}>
          <View style={[styles.dot, { backgroundColor: brand.color }]} />
          <Text style={styles.brandTagText}>{brand.name}</Text>
        </View>
      )}
      <Text style={styles.label}>프로젝트 이름 *</Text>
      <TextInput value={name} onChangeText={setName} placeholder="예) eSIM 릴스 협찬" placeholderTextColor={theme.textFaint} style={styles.input} />
      <Text style={styles.label}>정산 금액 (선택)</Text>
      <TextInput
        value={amount}
        onChangeText={t => setAmount(t.replace(/[^0-9]/g, ''))}
        placeholder="예) 300000"
        placeholderTextColor={theme.textFaint}
        keyboardType="numeric"
        style={styles.input}
      />
      <Text style={styles.label}>정산 예정일 (선택)</Text>
      <View style={styles.dueDateRow}>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setDateOpen(true)}>
          <Text style={dueDate ? styles.dateBtnText : styles.dateBtnPlaceholder}>
            {dueDate ? `${dueDate} (${WEEK[parseKey(dueDate).getDay()]})` : '날짜 선택'}
          </Text>
          <Text style={styles.dateBtnIcon}>📅</Text>
        </TouchableOpacity>
        {!!dueDate && (
          <TouchableOpacity onPress={() => setDueDate('')} style={styles.dateClear}>
            <Text style={styles.dateClearText}>지우기</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.label}>메모</Text>
      <TextInput value={memo} onChangeText={setMemo} placeholder="참고 사항 (선택)" placeholderTextColor={theme.textFaint} multiline style={[styles.input, styles.memo]} />
      <TouchableOpacity style={styles.primary} onPress={save}>
        <Text style={styles.primaryText}>{mode === 'edit' ? '저장' : '프로젝트 추가'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>취소</Text></TouchableOpacity>

      <DatePickerModal
        visible={dateOpen}
        value={dueDate}
        onSelect={(k) => { setDueDate(k); setDateOpen(false); }}
        onClose={() => setDateOpen(false)}
      />
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 12 },
  brandTag: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  brandTagText: { fontSize: 13, fontWeight: '700', color: theme.text },
  label: { fontSize: 12, fontWeight: '800', color: theme.textSub, marginBottom: 8, marginTop: 4 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, padding: 12, marginBottom: 6, fontSize: 14 },
  dueDateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  dateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, padding: 12 },
  dateBtnText: { fontSize: 14, color: theme.text, fontWeight: '600' },
  dateBtnPlaceholder: { fontSize: 14, color: theme.textFaint },
  dateBtnIcon: { fontSize: 14 },
  dateClear: { paddingHorizontal: 10, paddingVertical: 10 },
  dateClearText: { fontSize: 12.5, color: theme.textSub, fontWeight: '700' },
  memo: { minHeight: 70, textAlignVertical: 'top' },
  primary: { backgroundColor: theme.primary, padding: 14, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 10 },
  primaryText: { color: '#fff', fontWeight: '800' },
  cancel: { alignItems: 'center', padding: 12, marginTop: 2 },
  cancelText: { color: theme.textSub, fontWeight: '700' },
});
