import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import ModalOverlay from './ModalOverlay';
import BrandProjectPicker from './BrandProjectPicker';
import ColorPicker from './ColorPicker';
import DatePickerModal from './DatePickerModal';
import EventTypePicker from './EventTypePicker';
import { theme } from '../utils/theme';
import { keyOf, parseKey, WEEK } from '../utils/date';
import { notify } from '../utils/alert';

// 일정 추가/수정 공용 폼. 브랜드 -> 프로젝트를 먼저 고르지 않으면 저장할 수 없다.
// 달력에서 눌러 수정하는 흐름도 이 모달을 거치므로, 브랜드 색상도 여기서 바로 바꿀 수 있게 한다.
export default function EventFormModal({
  visible, mode, initial, brands, projects,
  onSave, onClose, onAddBrand, onAddProject, onDeleteBrand, onChangeBrandColor,
}) {
  const [brandId, setBrandId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(keyOf(new Date()));
  const [type, setType] = useState('업무');
  const [colorOpen, setColorOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setBrandId(initial?.brandId || '');
    setProjectId(initial?.projectId || '');
    setTitle(initial?.title || '');
    setDate(initial?.date || keyOf(new Date()));
    setType(initial?.type || '업무');
    setColorOpen(false);
  }, [visible, initial]);

  const changeBrand = (id) => { setBrandId(id); setProjectId(''); setColorOpen(false); };
  const selectedBrand = brands.find(b => b.id === brandId);

  const deleteBrand = (brand) => {
    onDeleteBrand(brand, () => {
      if (brand.id === brandId) { setBrandId(''); setProjectId(''); }
    });
  };

  const save = () => {
    if (brands.length === 0) { notify('먼저 브랜드를 추가해주세요.'); return; }
    if (!brandId) { notify('브랜드를 선택해주세요.'); return; }
    // 프로젝트는 선택 사항. 제목/업무 유형 중 하나만 적어도 서로 비어있는 쪽을 채워준다.
    const finalTitle = title.trim() || type.trim();
    const finalType = type.trim() || title.trim();
    if (!finalTitle) { notify('일정 제목이나 업무 유형을 입력해주세요.'); return; }
    onSave({ ...(initial || {}), brandId, projectId: projectId || null, title: finalTitle, date, type: finalType });
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
        onAddBrand={() => onAddBrand((b, p) => { setBrandId(b.id); setProjectId(p.id); })}
        onAddProject={(bid) => onAddProject(bid, p => setProjectId(p.id))}
        onDeleteBrand={deleteBrand}
        showProject={mode === 'edit' || !!initial?.projectId}
      />

      {selectedBrand && (
        <View style={styles.colorSection}>
          <TouchableOpacity onPress={() => setColorOpen(o => !o)} style={styles.colorToggle}>
            <View style={[styles.colorDot, { backgroundColor: selectedBrand.color }]} />
            <Text style={styles.colorToggleText}>{selectedBrand.name} 브랜드 색상 변경</Text>
            <Text style={styles.colorToggleIcon}>{colorOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {colorOpen && (
            <ColorPicker value={selectedBrand.color} onChange={(color) => onChangeBrandColor(selectedBrand.id, color)} />
          )}
        </View>
      )}

      <Text style={styles.label}>일정 제목 (비우면 업무 유형으로 저장)</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="예) 기획안 제출" placeholderTextColor={theme.textFaint} style={styles.input} />
      <Text style={styles.label}>날짜</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setDateOpen(true)}>
        <Text style={styles.dateBtnText}>{date} ({WEEK[parseKey(date).getDay()]})</Text>
        <Text style={styles.dateBtnIcon}>📅</Text>
      </TouchableOpacity>
      <Text style={styles.label}>업무 유형</Text>
      <EventTypePicker value={type} onChange={setType} />

      <TouchableOpacity style={styles.primary} onPress={save}>
        <Text style={styles.primaryText}>{mode === 'edit' ? '저장' : '일정 추가'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>취소</Text></TouchableOpacity>

      <DatePickerModal
        visible={dateOpen}
        value={date}
        onSelect={(k) => { setDate(k); setDateOpen(false); }}
        onClose={() => setDateOpen(false)}
      />
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 12 },
  colorSection: { marginTop: 6, marginBottom: 4, backgroundColor: '#F8F9FB', borderRadius: theme.radius.sm, padding: 10 },
  colorToggle: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  colorToggleText: { flex: 1, fontSize: 12.5, fontWeight: '700', color: theme.textSub },
  colorToggleIcon: { fontSize: 11, color: theme.textFaint },
  label: { fontSize: 12, fontWeight: '800', color: theme.textSub, marginBottom: 8, marginTop: 8 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, padding: 12, marginBottom: 4, fontSize: 14 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, padding: 12, marginBottom: 4 },
  dateBtnText: { fontSize: 14, color: theme.text, fontWeight: '600' },
  dateBtnIcon: { fontSize: 14 },
  primary: { backgroundColor: theme.primary, padding: 14, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 16 },
  primaryText: { color: '#fff', fontWeight: '800' },
  cancel: { alignItems: 'center', padding: 12, marginTop: 2 },
  cancelText: { color: theme.textSub, fontWeight: '700' },
});
