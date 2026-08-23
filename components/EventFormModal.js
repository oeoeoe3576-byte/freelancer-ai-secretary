import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ModalOverlay from './ModalOverlay';
import BrandProjectPicker from './BrandProjectPicker';
import { theme } from '../utils/theme';
import { EVENT_TYPES } from '../utils/constants';
import { keyOf, isValidDateKey } from '../utils/date';

// 일정 추가/수정 공용 폼. 브랜드 -> 프로젝트를 먼저 고르지 않으면 저장할 수 없다.
export default function EventFormModal({
  visible, mode, initial, brands, projects,
  onSave, onClose, onAddBrand, onAddProject,
}) {
  const [brandId, setBrandId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(keyOf(new Date()));
  const [type, setType] = useState('업무');

  useEffect(() => {
    if (!visible) return;
    setBrandId(initial?.brandId || '');
    setProjectId(initial?.projectId || '');
    setTitle(initial?.title || '');
    setDate(initial?.date || keyOf(new Date()));
    setType(initial?.type || '업무');
  }, [visible, initial]);

  const changeBrand = (id) => { setBrandId(id); setProjectId(''); };

  const save = () => {
    if (brands.length === 0) { Alert.alert('먼저 브랜드를 추가해주세요.'); return; }
    if (!brandId) { Alert.alert('브랜드를 선택해주세요.'); return; }
    if (!projectId) { Alert.alert('프로젝트를 선택해주세요.'); return; }
    if (!title.trim()) { Alert.alert('일정 제목을 입력해주세요.'); return; }
    if (!isValidDateKey(date)) { Alert.alert('날짜는 YYYY-MM-DD 형식으로 입력해주세요.'); return; }
    onSave({ ...(initial || {}), brandId, projectId, title: title.trim(), date, type });
  };

  if (!visible) return null;
  return (
    <ModalOverlay visible={visible} onClose={onClose}>
      <Text style={styles.title}>{mode === 'edit' ? '일정 수정' : '일정 추가'}</Text>

      <BrandProjectPicker
        brands={brands}
        projects={projects}
        brandId={brandId}
        projectId={projectId}
        onChangeBrand={changeBrand}
        onChangeProject={setProjectId}
        onAddBrand={() => onAddBrand(b => { setBrandId(b.id); setProjectId(''); })}
        onAddProject={(bid) => onAddProject(bid, p => setProjectId(p.id))}
      />

      <Text style={styles.label}>일정 제목</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="예) 기획안 제출" style={styles.input} />
      <Text style={styles.label}>날짜 (YYYY-MM-DD)</Text>
      <TextInput value={date} onChangeText={setDate} placeholder="2026-08-25" style={styles.input} />
      <Text style={styles.label}>업무 유형</Text>
      <View style={styles.typeRow}>
        {EVENT_TYPES.map(t => (
          <TouchableOpacity key={t} onPress={() => setType(t)} style={[styles.typeBtn, type === t && styles.typeOn]}>
            <Text style={[styles.typeText, type === t && styles.typeTextOn]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.primary} onPress={save}>
        <Text style={styles.primaryText}>{mode === 'edit' ? '저장' : '일정 추가'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>취소</Text></TouchableOpacity>
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '800', color: theme.textSub, marginBottom: 8, marginTop: 8 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, padding: 12, marginBottom: 4, fontSize: 14 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: { paddingHorizontal: 13, paddingVertical: 9, backgroundColor: '#F3F4F6', borderRadius: 10 },
  typeOn: { backgroundColor: theme.text },
  typeText: { fontSize: 13, color: theme.textSub, fontWeight: '600' },
  typeTextOn: { color: '#fff', fontWeight: '800' },
  primary: { backgroundColor: theme.primary, padding: 14, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 16 },
  primaryText: { color: '#fff', fontWeight: '800' },
  cancel: { alignItems: 'center', padding: 12, marginTop: 2 },
  cancelText: { color: theme.textSub, fontWeight: '700' },
});
