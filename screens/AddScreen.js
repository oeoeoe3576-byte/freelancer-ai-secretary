import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { theme } from '../utils/theme';
import { EVENT_TYPES } from '../utils/constants';
import { keyOf, isValidDateKey } from '../utils/date';
import BrandProjectPicker from '../components/BrandProjectPicker';
import PasteExtractSection from '../components/PasteExtractSection';

// 일정 추가 탭: 팝업 없이 항상 열려 있는 빠른 등록 화면 + 붙여넣기 자동추출.
export default function AddScreen({ brands, projects, onAddBrand, onAddProject, onCreateEvent, onExtract }) {
  const [brandId, setBrandId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(keyOf(new Date()));
  const [type, setType] = useState('업무');

  const changeBrand = (id) => { setBrandId(id); setProjectId(''); };

  const submit = () => {
    if (brands.length === 0) { Alert.alert('먼저 브랜드를 추가해주세요.'); return; }
    if (!brandId) { Alert.alert('브랜드를 선택해주세요.'); return; }
    if (!projectId) { Alert.alert('프로젝트를 선택해주세요.'); return; }
    if (!title.trim()) { Alert.alert('일정 제목을 입력해주세요.'); return; }
    if (!isValidDateKey(date)) { Alert.alert('날짜는 YYYY-MM-DD 형식으로 입력해주세요.'); return; }
    onCreateEvent({ brandId, projectId, title: title.trim(), date, type });
    setTitle('');
    setDate(keyOf(new Date()));
    setType('업무');
  };

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
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
        />
        <Text style={styles.label}>일정 제목</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="예) 기획안 제출" placeholderTextColor={theme.textFaint} style={styles.input} />
        <Text style={styles.label}>날짜 (YYYY-MM-DD)</Text>
        <TextInput value={date} onChangeText={setDate} placeholder="2026-08-25" placeholderTextColor={theme.textFaint} style={styles.input} />
        <Text style={styles.label}>업무 유형</Text>
        <View style={styles.typeRow}>
          {EVENT_TYPES.map(t => (
            <TouchableOpacity key={t} onPress={() => setType(t)} style={[styles.typeBtn, type === t && styles.typeOn]}>
              <Text style={[styles.typeText, type === t && styles.typeTextOn]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.primary} onPress={submit}>
          <Text style={styles.primaryText}>일정 추가</Text>
        </TouchableOpacity>
      </View>

      <PasteExtractSection
        brands={brands}
        projects={projects}
        onAddBrand={onAddBrand}
        onAddProject={onAddProject}
        onExtract={onExtract}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 18, paddingBottom: 50 },
  h1: { fontSize: 22, fontWeight: '800', color: theme.text, marginBottom: 14 },
  card: { backgroundColor: theme.card, padding: 16, borderRadius: theme.radius.lg, marginBottom: 14, ...theme.shadow },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 4 },
  label: { fontSize: 12, fontWeight: '800', color: theme.textSub, marginBottom: 8, marginTop: 10 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.sm, padding: 12, marginBottom: 4, fontSize: 14 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: { paddingHorizontal: 13, paddingVertical: 9, backgroundColor: '#F6F1EC', borderRadius: theme.radius.pill },
  typeOn: { backgroundColor: theme.text },
  typeText: { fontSize: 13, color: theme.textSub, fontWeight: '600' },
  typeTextOn: { color: '#fff', fontWeight: '800' },
  primary: { backgroundColor: theme.primary, padding: 14, borderRadius: theme.radius.pill, alignItems: 'center', marginTop: 16 },
  primaryText: { color: '#fff', fontWeight: '800' },
});
