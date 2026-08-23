import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { hexToRgba } from '../utils/colors';

// 브랜드 선택 -> 해당 브랜드의 프로젝트만 선택 가능. 각 목록 끝에 '+ 새로 추가' 칩을 둔다.
export default function BrandProjectPicker({
  brands, projects, brandId, projectId,
  onChangeBrand, onChangeProject, onAddBrand, onAddProject,
}) {
  const brandProjects = projects.filter(p => p.brandId === brandId);

  return (
    <View>
      <Text style={styles.label}>브랜드</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.chipRow}>
          {brands.map(b => {
            const on = b.id === brandId;
            return (
              <TouchableOpacity
                key={b.id}
                onPress={() => onChangeBrand(b.id)}
                style={[styles.chip, { borderColor: b.color }, on && { backgroundColor: hexToRgba(b.color, 0.14) }]}
              >
                <View style={[styles.dot, { backgroundColor: b.color }]} />
                <Text style={[styles.chipText, on && { color: theme.text, fontWeight: '800' }]}>{b.name}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity onPress={onAddBrand} style={[styles.chip, styles.addChip]}>
            <Text style={styles.addChipText}>+ 새 브랜드</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {brandId ? (
        <>
          <Text style={styles.label}>프로젝트</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            <View style={styles.chipRow}>
              {brandProjects.map(p => {
                const on = p.id === projectId;
                return (
                  <TouchableOpacity key={p.id} onPress={() => onChangeProject(p.id)} style={[styles.chip, on && styles.chipOnPlain]}>
                    <Text style={[styles.chipText, on && { color: theme.text, fontWeight: '800' }]}>{p.name}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity onPress={() => onAddProject(brandId)} style={[styles.chip, styles.addChip]}>
                <Text style={styles.addChipText}>+ 새 프로젝트</Text>
              </TouchableOpacity>
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
  chipOnPlain: { borderColor: theme.text, backgroundColor: '#F3F4F6' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  chipText: { fontSize: 13, color: theme.textSub, fontWeight: '600' },
  addChip: { borderStyle: 'dashed', borderColor: '#C6CBD3' },
  addChipText: { fontSize: 13, color: theme.textSub, fontWeight: '700' },
  hint: { fontSize: 12, color: theme.textFaint, marginTop: 2, marginBottom: 6 },
});
