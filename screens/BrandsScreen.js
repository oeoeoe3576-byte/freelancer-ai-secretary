import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import AppHeader from '../components/AppHeader';
import BrandCard from '../components/BrandCard';

export default function BrandsScreen({ brands, projects, events, onBack, onOpenBrand, onEditBrand, onAddBrand }) {
  const stats = useMemo(() => {
    const map = new Map();
    for (const b of brands) map.set(b.id, { projectCount: 0, eventCount: 0 });
    for (const p of projects) { const s = map.get(p.brandId); if (s) s.projectCount += 1; }
    for (const e of events) { const s = map.get(e.brandId); if (s) s.eventCount += 1; }
    return map;
  }, [brands, projects, events]);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <AppHeader
        title="브랜드 관리"
        onBack={onBack}
        right={<TouchableOpacity style={styles.addBtn} onPress={onAddBrand}><Text style={styles.addBtnText}>+ 브랜드</Text></TouchableOpacity>}
      />
      {brands.length === 0 ? (
        <Text style={styles.empty}>등록된 브랜드가 없습니다. 브랜드를 먼저 추가해주세요.</Text>
      ) : (
        <View style={styles.grid}>
          {brands.map(b => {
            const s = stats.get(b.id) || { projectCount: 0, eventCount: 0 };
            return (
              <BrandCard
                key={b.id}
                brand={b}
                projectCount={s.projectCount}
                eventCount={s.eventCount}
                onPress={() => onOpenBrand(b.id)}
                onEdit={() => onEditBrand(b)}
              />
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 18, paddingBottom: 50 },
  addBtn: { backgroundColor: theme.primary, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  empty: { fontSize: 13, color: theme.textFaint, textAlign: 'center', marginTop: 40 },
});
