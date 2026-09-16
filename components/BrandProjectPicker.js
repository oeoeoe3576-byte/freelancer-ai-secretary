import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { hexToRgba } from '../utils/colors';

// 브랜드 선택 -> 해당 브랜드의 프로젝트만 선택 가능.
// '+ 새로 추가' 칩은 맨 앞에 고정한다 — 브랜드/프로젝트가 계속 늘어나도 스크롤 안 해도 바로 보이게.
export default function BrandProjectPicker({
  brands, projects, brandId, projectId,
  onChangeBrand, onChangeProject, onAddBrand, onAddProject, onDeleteBrand,
}) {
  const brandProjects = projects.filter(p => p.brandId === brandId);

  return (
    <View>
      <Text style={styles.label}>브랜드</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.chipRow}>
          <TouchableOpacity onPress={onAddBrand} style={[styles.chip, styles.addChip]}>
            <Text style={styles.addChipText}>+ 새 브랜드</Text>
          </TouchableOpacity>
          {brands.map(b => {
            const on = b.id === brandId;
            return (
              <View
                key={b.id}
                style={[styles.chip, styles.chipWithDelete, { borderColor: b.color }, on && { backgroundColor: hexToRgba(b.color, 0.14) }]}
              >
                <TouchableOpacity onPress={() => onChangeBrand(b.id)} style={styles.chipMain}>
                  <View style={[styles.dot, { backgroundColor: b.color }]} />
                  <Text style={[styles.chipText, on && { color: theme.text, fontWeight: '800' }]}>{b.name}</Text>
                </TouchableOpacity>
                {onDeleteBrand && (
                  <TouchableOpacity onPress={() => onDeleteBrand(b)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }} style={styles.chipDelete}>
                    <Text style={styles.chipDeleteText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {brandId ? (
        <>
          <Text style={styles.label}>프로젝트</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            <View style={styles.chipRow}>
              <TouchableOpacity onPress={() => onAddProject(brandId)} style={[styles.chip, styles.addChip]}>
                <Text style={styles.addChipText}>+ 새 프로젝트</Text>
              </TouchableOpacity>
              {brandProjects.map(p => {
                const on = p.id === projectId;
                return (
                  <TouchableOpacity key={p.id} onPress={() => onChangeProject(p.id)} style={[styles.chip, on && styles.chipOnPlain]}>
                    <Text style={[styles.chipText, on && { color: theme.text, fontWeight: '800' }]}>{p.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          {brandProjects.length === 0 && <Text style={styles.hint}>이 브랜드에 프로젝트가 없습니다. 새 프로젝트를 추가해주세요.</Text>}
        </>
      ) : (
        <Text style={styles.hint}>먼저 브랜드를 선택하거나 추가해주세요.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '800', color: theme.textSub, marginBottom: 8, marginTop: 4 },
  scroll: { marginBottom: 4 },
  chipRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: theme.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  chipWithDelete: { paddingRight: 6 },
  chipMain: { flexDirection: 'row', alignItems: 'center' },
  chipOnPlain: { borderColor: theme.text, backgroundColor: '#F3F4F6' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  chipText: { fontSize: 13, color: theme.textSub, fontWeight: '600' },
  chipDelete: { marginLeft: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  chipDeleteText: { fontSize: 12, color: theme.textSub, fontWeight: '800', lineHeight: 14 },
  addChip: { borderStyle: 'dashed', borderColor: '#C6CBD3' },
  addChipText: { fontSize: 13, color: theme.textSub, fontWeight: '700' },
  hint: { fontSize: 12, color: theme.textFaint, marginTop: 2, marginBottom: 6 },
});
