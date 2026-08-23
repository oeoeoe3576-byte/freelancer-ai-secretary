import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { hexToRgba } from '../utils/colors';
import AppHeader from '../components/AppHeader';
import ProjectCard from '../components/ProjectCard';

export default function BrandDetailScreen({ brand, projects, events, onBack, onOpenProject, onEditProject, onAddProject, onEditBrand, onDeleteBrand }) {
  const brandProjects = projects.filter(p => p.brandId === brand.id);
  const stats = useMemo(() => {
    const map = new Map();
    for (const p of brandProjects) map.set(p.id, { total: 0, done: 0 });
    for (const e of events) { const s = map.get(e.projectId); if (s) { s.total += 1; if (e.done) s.done += 1; } }
    return map;
  }, [brandProjects, events]);
  const totalEvents = events.filter(e => e.brandId === brand.id).length;

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <AppHeader title={brand.name} onBack={onBack} />

      <View style={[styles.brandBanner, { backgroundColor: hexToRgba(brand.color, 0.12) }]}>
        <View style={styles.bannerTop}>
          <View style={styles.bannerLeft}>
            <View style={[styles.dot, { backgroundColor: brand.color }]} />
            <Text style={styles.bannerName}>{brand.name}</Text>
          </View>
          <View style={styles.bannerActions}>
            <TouchableOpacity onPress={onEditBrand} style={styles.iconBtn}><Text style={styles.iconText}>✎ 수정</Text></TouchableOpacity>
            <TouchableOpacity onPress={onDeleteBrand} style={styles.iconBtn}><Text style={[styles.iconText, styles.deleteText]}>삭제</Text></TouchableOpacity>
          </View>
        </View>
        <Text style={styles.bannerMeta}>프로젝트 {brandProjects.length}개 · 전체 일정 {totalEvents}개</Text>
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>프로젝트</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAddProject}><Text style={styles.addBtnText}>+ 프로젝트</Text></TouchableOpacity>
      </View>
      {brandProjects.length === 0 ? (
        <Text style={styles.empty}>등록된 프로젝트가 없습니다.</Text>
      ) : (
        brandProjects.map(p => {
          const s = stats.get(p.id) || { total: 0, done: 0 };
          return (
            <ProjectCard
              key={p.id}
              project={p}
              brand={brand}
              total={s.total}
              done={s.done}
              onPress={() => onOpenProject(p.id)}
              onEdit={() => onEditProject(p)}
            />
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 18, paddingBottom: 50 },
  brandBanner: { borderRadius: theme.radius.lg, padding: 16, marginBottom: 18 },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerLeft: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 8 },
  bannerName: { fontSize: 18, fontWeight: '800', color: theme.text },
  bannerActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  iconText: { fontSize: 12.5, fontWeight: '700', color: theme.textSub },
  deleteText: { color: theme.danger },
  bannerMeta: { fontSize: 12.5, color: theme.textSub, marginTop: 8 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.text },
  addBtn: { backgroundColor: theme.primary, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty: { fontSize: 13, color: theme.textFaint, textAlign: 'center', marginTop: 24 },
});
