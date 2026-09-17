import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { keyOf, parseKey, WEEK } from '../utils/date';
import { notify } from '../utils/alert';
import BrandProjectPicker from '../components/BrandProjectPicker';
import PasteExtractSection from '../components/PasteExtractSection';
import DatePickerModal from '../components/DatePickerModal';
import EventTypePicker from '../components/EventTypePicker';
import PullToRefreshScrollView from '../components/PullToRefreshScrollView';

// 일정 추가 탭: 팝업 없이 항상 열려 있는 빠른 등록 화면 + 붙여넣기 자동추출.
export default function AddScreen({ brands, projects, onAddBrand, onAddProject, onDeleteBrand, onCreateEvent, onExtract, onRefresh }) {
  const [brandId, setBrandId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(keyOf(new Date()));
  const [type, setType] = useState('업무');
  const [dateOpen, setDateOpen] = useState(false);

  const changeBrand = (id) => { setBrandId(id); setProjectId(''); };

  const deleteBrand = (brand) => {
    onDeleteBrand(brand, () => {
      if (brand.id === brandId) { setBrandId(''); setProjectId(''); }
    });
  };

  const submit = () => {
    if (brands.length === 0) { notify('먼저 브랜드를 추가해주세요.'); return; }
    if (!brandId) { notify('브랜드를 선택해주세요.'); return; }
    // 프로젝트는 선택 사항 — 안 골라도 브랜드만으로 일정을 등록할 수 있다.
    // 제목/업무 유형 중 하나만 적어도 서로 비어있는 쪽을 채워준다.
    const finalTitle = title.trim() || type.trim();
    const finalType = type.trim() || title.trim();
    if (!finalTitle) { notify('일정 제목이나 업무 유형을 입력해주세요.'); return; }
    onCreateEvent({ brandId, projectId: projectId || null, title: finalTitle, date, type: finalType });
    notify('일정 추가 완료', `${finalTitle} · ${date}`);
    setTitle('');
    setDate(keyOf(new Date()));
    setType('업무');
  };

  return (
    <PullToRefreshScrollView onRefresh={onRefresh} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.h1}>➕ 일정 추가</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>새 일정</Text>
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
          showProject={false}
        />
        <Text style={styles.label}>일정 제목 (비우면 업무 유형으로 저장)</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="예) 기획안 제출" placeholderTextColor={theme.textFaint} style={styles.input} />
        <Text style={styles.label}>날짜</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setDateOpen(true)}>
          <Text style={styles.dateBtnText}>{date} ({WEEK[parseKey(date).getDay()]})</Text>
          <Text style={styles.dateBtnIcon}>📅</Text>
        </TouchableOpacity>
        <Text style={styles.label}>업무 유형</Text>
        <EventTypePicker value={type} onChange={setType} />
        <TouchableOpacity style={styles.primary} onPress={submit}>
          <Text style={styles.primaryText}>일정 추가</Text>
        </TouchableOpacity>
      </View>

      <PasteExtractSection
        brands={brands}
        projects={projects}
        onAddBrand={onAddBrand}
        onAddProject={onAddProject}
        onDeleteBrand={onDeleteBrand}
        onExtract={onExtract}
      />

      <DatePickerModal
        visible={dateOpen}
        value={date}
        onSelect={(k) => { setDate(k); setDateOpen(false); }}
        onClose={() => setDateOpen(false)}
      />
    </PullToRefreshScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 18, paddingBottom: 50 },
  h1: { fontSize: 22, fontWeight: '800', color: theme.text, marginBottom: 14 },
  card: { backgroundColor: theme.card, padding: 16, borderRadius: theme.radius.lg, marginBottom: 14, ...theme.shadow },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 4 },
  label: { fontSize: 12, fontWeight: '800', color: theme.textSub, marginBottom: 8, marginTop: 10 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, padding: 12, marginBottom: 4, fontSize: 14 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, padding: 12, marginBottom: 4 },
  dateBtnText: { fontSize: 14, color: theme.text, fontWeight: '600' },
  dateBtnIcon: { fontSize: 14 },
  primary: { backgroundColor: theme.primary, padding: 14, borderRadius: theme.radius.pill, alignItems: 'center', marginTop: 16 },
  primaryText: { color: '#fff', fontWeight: '800' },
});
