import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { formatWon } from '../utils/ledger';
import LedgerItem from '../components/LedgerItem';

// 가계부 탭: 금액이 설정된 프로젝트를 한눈에 모아 정산 여부를 관리한다.
// 정산 완료/취소 토글은 실수 방지를 위해 프로젝트 상세 화면에서만 한다.
export default function LedgerScreen({ projects, brands, onOpenProject, onOpenBrands }) {
  const priced = useMemo(
    () => projects.filter(p => Number(p.amount) > 0).sort((a, b) => Number(!!a.settled) - Number(!!b.settled) || (b.createdAt || 0) - (a.createdAt || 0)),
    [projects]
  );
  const totals = useMemo(() => {
    let settled = 0, pending = 0;
    for (const p of priced) {
      if (p.settled) settled += Number(p.amount) || 0;
      else pending += Number(p.amount) || 0;
    }
    return { settled, pending };
  }, [priced]);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.h1}>💰 가계부</Text>
      <Text style={styles.sub}>프로젝트별 정산 금액과 정산 여부를 관리해요.</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{formatWon(totals.pending)}</Text>
          <Text style={styles.summaryLabel}>정산 대기</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{formatWon(totals.settled)}</Text>
          <Text style={styles.summaryLabel}>정산 완료</Text>
        </View>
      </View>

      {priced.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>🧾</Text>
          <Text style={styles.empty}>아직 금액이 등록된 프로젝트가 없어요.{'\n'}브랜드 → 프로젝트 수정에서 정산 금액을 입력해보세요.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={onOpenBrands}>
            <Text style={styles.emptyBtnText}>브랜드로 이동</Text>
          </TouchableOpacity>
        </View>
      ) : (
        priced.map(p => (
          <LedgerItem
            key={p.id}
            project={p}
            brand={brands.find(b => b.id === p.brandId)}
            onPress={() => onOpenProject(p.id)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 18, paddingBottom: 50 },
  h1: { fontSize: 22, fontWeight: '800', color: theme.text },
  sub: { fontSize: 12.5, color: theme.textSub, marginTop: 4, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: theme.radius.lg, ...theme.shadow },
  summaryNum: { fontSize: 18, fontWeight: '800', color: theme.text },
  summaryLabel: { fontSize: 11.5, color: theme.textSub, marginTop: 3 },
  emptyBox: { alignItems: 'center', paddingVertical: 30 },
  emptyEmoji: { fontSize: 34, marginBottom: 10 },
  empty: { fontSize: 13, color: theme.textFaint, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  emptyBtn: { backgroundColor: theme.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: theme.radius.pill },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
