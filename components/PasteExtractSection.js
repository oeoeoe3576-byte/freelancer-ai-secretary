import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { theme } from '../utils/theme';
import BrandProjectPicker from './BrandProjectPicker';
import { extractEvents } from '../utils/extract';

// 메일/카톡 본문 붙여넣기 -> 날짜 있는 줄 자동 추출 -> 선택한 브랜드/프로젝트 아래로 한꺼번에 등록.
export default function PasteExtractSection({ brands, projects, onAddBrand, onAddProject, onExtract }) {
  const [open, setOpen] = useState(false);
  const [brandId, setBrandId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [input, setInput] = useState('');

  const changeBrand = (id) => { setBrandId(id); setProjectId(''); };

  const run = () => {
    if (!brandId || !projectId) { Alert.alert('브랜드와 프로젝트를 먼저 선택해주세요.'); return; }
    const found = extractEvents(input);
    if (!found.length) { Alert.alert('날짜를 찾지 못했습니다', '예: 8/25 초안 전달, 8월 28일 업로드'); return; }
    onExtract(brandId, projectId, found);
    setInput('');
    Alert.alert('일정 등록 완료', `${found.length}개의 일정을 추가했습니다.`);
  };

  return (
    <View style={styles.section}>
      <TouchableOpacity onPress={() => setOpen(o => !o)} style={styles.toggleRow}>
        <Text style={styles.sectionTitle}>붙여넣기로 일정 자동 추출</Text>
        <Text style={styles.toggleIcon}>{open ? '접기 ▲' : '펼치기 ▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.helper}>메일이나 카톡 내용을 그대로 붙여넣으세요. 날짜가 있는 줄을 찾아 선택한 프로젝트 아래로 일정으로 등록합니다.</Text>
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
          <TextInput
            multiline
            value={input}
            onChangeText={setInput}
            placeholder={'예)\n8/25 기획안 전달\n8/28 1차 영상 전달\n8/31 릴스 업로드'}
            style={styles.textarea}
          />
          <TouchableOpacity style={styles.primary} onPress={run}><Text style={styles.primaryText}>일정 자동 추출</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: theme.card, padding: 16, borderRadius: theme.radius.lg, marginBottom: 14, ...theme.shadow },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.text },
  toggleIcon: { fontSize: 12, color: theme.textSub, fontWeight: '700' },
  helper: { fontSize: 12, color: theme.textSub, lineHeight: 18, marginBottom: 10 },
  textarea: { minHeight: 110, borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.md, padding: 12, textAlignVertical: 'top', fontSize: 14, marginTop: 4 },
  primary: { backgroundColor: theme.primary, padding: 14, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 10 },
  primaryText: { color: '#fff', fontWeight: '800' },
});
