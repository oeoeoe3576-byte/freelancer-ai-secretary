import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_BRAND_COLOR } from '../utils/colors';

// v1: 기존 버전 - 일정 배열만 저장하던 키 (절대 삭제하지 않고 그대로 둔다 = 원본 백업)
const V1_KEY = 'freelancer-secretary-events-v1';
// v2: 브랜드 > 프로젝트 > 일정 구조
const V2_KEY = 'freelancer-secretary-data-v2';

const LEGACY_BRAND_ID = 'legacy-brand';
const LEGACY_PROJECT_ID = 'legacy-project';

function sanitize(parsed) {
  return {
    brands: Array.isArray(parsed?.brands) ? parsed.brands : [],
    projects: Array.isArray(parsed?.projects) ? parsed.projects : [],
    events: Array.isArray(parsed?.events) ? parsed.events : [],
  };
}

function migrateFromV1(oldEvents) {
  const brand = { id: LEGACY_BRAND_ID, name: '기존 일정', color: DEFAULT_BRAND_COLOR, createdAt: Date.now() };
  const project = { id: LEGACY_PROJECT_ID, brandId: LEGACY_BRAND_ID, name: '기존 일정', memo: '', createdAt: Date.now() };
  const events = oldEvents.map((e, i) => ({
    id: e.id ? String(e.id) : `legacy-${Date.now()}-${i}`,
    brandId: LEGACY_BRAND_ID,
    projectId: LEGACY_PROJECT_ID,
    title: e.title || '제목 없음',
    date: e.date,
    type: e.type || '업무',
    done: !!e.done,
    createdAt: Date.now(),
  })).filter(e => e.date);
  return { brands: [brand], projects: [project], events };
}

// 저장된 데이터를 불러온다. v2가 있으면 그대로, 없으면 v1을 새 구조로 자동 변환해 저장하고 반환한다.
// v1 원본 키는 안전을 위해 절대 지우지 않는다.
export async function loadData() {
  try {
    const rawV2 = await AsyncStorage.getItem(V2_KEY);
    if (rawV2) {
      return sanitize(JSON.parse(rawV2));
    }
  } catch (e) {
    // v2 파싱 실패 시 v1 마이그레이션으로 폴백
  }

  try {
    const rawV1 = await AsyncStorage.getItem(V1_KEY);
    if (rawV1) {
      const oldEvents = JSON.parse(rawV1);
      if (Array.isArray(oldEvents) && oldEvents.length) {
        const migrated = migrateFromV1(oldEvents);
        await AsyncStorage.setItem(V2_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch (e) {
    // v1도 없거나 손상된 경우 빈 데이터로 시작
  }

  const empty = { brands: [], projects: [], events: [] };
  await AsyncStorage.setItem(V2_KEY, JSON.stringify(empty));
  return empty;
}

export async function saveData(data) {
  try {
    await AsyncStorage.setItem(V2_KEY, JSON.stringify(sanitize(data)));
  } catch (e) {
    // 저장 실패는 조용히 무시 (다음 변경 시 재시도됨)
  }
}
