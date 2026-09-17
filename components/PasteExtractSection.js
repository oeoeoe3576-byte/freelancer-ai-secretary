import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../utils/theme';
import BrandProjectPicker from './BrandProjectPicker';
import OcrApiKeyModal from './OcrApiKeyModal';
import { extractEvents } from '../utils/extract';
import { getOcrApiKey, setOcrApiKey, recognizeText } from '../utils/ocr';
import { notify, notifyWithActions } from '../utils/alert';

// 메일/카톡 본문 붙여넣기, 또는 사진 촬영·선택으로 글자 인식(OCR) -> 날짜 있는 줄 자동 추출
// -> 선택한 브랜드/프로젝트 아래로 한꺼번에 등록.
export default function PasteExtractSection({ brands, projects, onAddBrand, onAddProject, onDeleteBrand, onExtract }) {
  const [open, setOpen] = useState(false);
  const [brandId, setBrandId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [input, setInput] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [keyModalVisible, setKeyModalVisible] = useState(false);
  const [keyModalInitial, setKeyModalInitial] = useState('');
  const [pendingSource, setPendingSource] = useState(null); // 키 입력 후 이어서 실행할 'camera' | 'library'

  const changeBrand = (id) => { setBrandId(id); setProjectId(''); };

  const deleteBrand = (brand) => {
    onDeleteBrand(brand, () => {
      if (brand.id === brandId) { setBrandId(''); setProjectId(''); }
    });
  };

  const run = () => {
    if (!brandId) { notify('브랜드를 먼저 선택해주세요.'); return; }
    const found = extractEvents(input);
    if (!found.length) { notify('날짜를 찾지 못했습니다', '예: 8/25 초안 전달, 8월 28일 업로드'); return; }
    onExtract(brandId, projectId || null, found);
    setInput('');
    notify('일정 등록 완료', `${found.length}개의 일정을 추가했습니다.`);
  };

  // 사진 촬영/선택 -> 권한 확인 -> OCR 인식 -> 인식된 텍스트를 입력창에 채워준다 (등록 전 확인/수정 가능).
  const runCapture = async (source, apiKey) => {
    try {
      const perm = source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        notify('권한이 필요합니다', source === 'camera' ? '카메라 접근을 허용해주세요.' : '사진 보관함 접근을 허용해주세요.');
        return;
      }

      const pickerOptions = { base64: true, quality: 0.5, allowsEditing: true };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (result.canceled || !result.assets?.[0]?.base64) return;

      setOcrLoading(true);
      const text = await recognizeText(result.assets[0].base64, apiKey);
      setInput(prev => (prev.trim() ? `${prev}\n${text}` : text));
      setOpen(true);
    } catch (e) {
      notify('텍스트 인식 실패', e.message || '잠시 후 다시 시도해주세요.');
    } finally {
      setOcrLoading(false);
    }
  };

  const chooseSource = async (source) => {
    const key = await getOcrApiKey();
    if (!key) {
      setPendingSource(source);
      setKeyModalInitial('');
      setKeyModalVisible(true);
      return;
    }
    runCapture(source, key);
  };

  const startPhotoOcr = () => {
    notifyWithActions('사진에서 텍스트 가져오기', '어디서 가져올까요?', [
      { text: '카메라로 촬영', onPress: () => chooseSource('camera') },
      { text: '앨범에서 선택', onPress: () => chooseSource('library') },
      { text: '취소', style: 'cancel' },
    ]);
  };

  const changeOcrKey = async () => {
    const key = await getOcrApiKey();
    setPendingSource(null);
    setKeyModalInitial(key);
    setKeyModalVisible(true);
  };

  const saveOcrKey = async (key) => {
    await setOcrApiKey(key);
    setKeyModalVisible(false);
    const source = pendingSource;
    setPendingSource(null);
    if (source) runCapture(source, key);
  };

  const cancelOcrKeyModal = () => {
    setKeyModalVisible(false);
    setPendingSource(null);
  };

  return (
    <View style={styles.section}>
      <TouchableOpacity onPress={() => setOpen(o => !o)} style={styles.toggleRow}>
        <Text style={styles.sectionTitle}>붙여넣기·사진으로 일정 자동 추출</Text>
        <Text style={styles.toggleIcon}>{open ? '접기 ▲' : '펼치기 ▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.helper}>메일·카톡 내용을 붙여넣거나, 협찬 안내 사진을 촬영·선택하면 글자를 읽어 날짜가 있는 줄을 찾아줍니다. 선택한 프로젝트 아래로 일정으로 등록합니다.</Text>
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
          <TouchableOpacity style={styles.photoBtn} onPress={startPhotoOcr} disabled={ocrLoading}>
            {ocrLoading ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <Text style={styles.photoBtnText}>📷 사진에서 텍스트 가져오기</Text>
            )}
          </TouchableOpacity>
          <TextInput
            multiline
            value={input}
            onChangeText={setInput}
            placeholder={'예)\n8/25 기획안 전달\n8/28 1차 영상 전달\n8/31 릴스 업로드'}
            placeholderTextColor={theme.textFaint}
            style={styles.textarea}
          />
          <TouchableOpacity style={styles.primary} onPress={run}><Text style={styles.primaryText}>일정 자동 추출</Text></TouchableOpacity>
          <TouchableOpacity onPress={changeOcrKey}><Text style={styles.keyLink}>OCR 키 등록/변경</Text></TouchableOpacity>
        </View>
      )}

      <OcrApiKeyModal
        visible={keyModalVisible}
        initialValue={keyModalInitial}
        onSave={saveOcrKey}
        onCancel={cancelOcrKeyModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: theme.card, padding: 16, borderRadius: theme.radius.lg, marginBottom: 14, ...theme.shadow },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.text },
  toggleIcon: { fontSize: 12, color: theme.textSub, fontWeight: '700' },
  helper: { fontSize: 12, color: theme.textSub, lineHeight: 18, marginBottom: 10 },
  photoBtn: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.md, padding: 13, alignItems: 'center', marginTop: 10, backgroundColor: '#F6F1EC' },
  photoBtnText: { fontSize: 13.5, fontWeight: '800', color: theme.text },
  textarea: { minHeight: 110, borderWidth: 1, borderColor: theme.border, borderRadius: theme.radius.md, padding: 12, textAlignVertical: 'top', fontSize: 14, marginTop: 10 },
  primary: { backgroundColor: theme.primary, padding: 14, borderRadius: theme.radius.md, alignItems: 'center', marginTop: 10 },
  primaryText: { color: '#fff', fontWeight: '800' },
  keyLink: { fontSize: 11.5, color: theme.textSub, fontWeight: '700', textAlign: 'center', marginTop: 12 },
});
