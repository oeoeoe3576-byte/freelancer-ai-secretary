import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE_KEY = 'freelancer-secretary-ocr-key';
const OCR_ENDPOINT = 'https://api.ocr.space/parse/image';

// 사진 글자 인식(OCR)에 쓸 API 키를 기기에 저장/조회한다.
// https://ocr.space/ocrapi/freekey 에서 이메일만으로 무료 발급 가능.
export async function getOcrApiKey() {
  try {
    return (await AsyncStorage.getItem(API_KEY_STORAGE_KEY)) || '';
  } catch (e) {
    return '';
  }
}

export async function setOcrApiKey(key) {
  try {
    await AsyncStorage.setItem(API_KEY_STORAGE_KEY, (key || '').trim());
  } catch (e) {
    // 저장 실패는 조용히 무시 (다음 시도 때 다시 요청)
  }
}

// base64 이미지를 OCR.space에 보내 인식된 텍스트를 반환한다.
// 실패하거나 글자를 찾지 못하면 에러를 던진다 (호출부에서 Alert로 안내).
export async function recognizeText(base64Image, apiKey) {
  const body = new FormData();
  body.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
  body.append('language', 'kor');
  body.append('OCREngine', '2');
  body.append('scale', 'true');
  body.append('apikey', apiKey);

  let res;
  try {
    res = await fetch(OCR_ENDPOINT, { method: 'POST', body });
  } catch (e) {
    throw new Error('네트워크 연결을 확인해주세요.');
  }

  const json = await res.json().catch(() => null);
  if (!json) throw new Error('텍스트 인식에 실패했습니다.');

  if (json.IsErroredOnProcessing) {
    const msg = Array.isArray(json.ErrorMessage) ? json.ErrorMessage.join(' ') : (json.ErrorMessage || json.ErrorDetails);
    throw new Error(msg || 'API 키를 확인해주세요.');
  }

  const text = (json.ParsedResults || [])
    .map(r => (r.ParsedText || '').trim())
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!text) throw new Error('사진에서 글자를 찾지 못했습니다.');
  return text;
}
