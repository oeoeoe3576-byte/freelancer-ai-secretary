import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { formatWon } from '../utils/ledger';
import AppHeader from '../components/AppHeader';
import LedgerItem from '../components/LedgerItem';

// 가계부: 금액이 설정된 프로젝트를 한눈에 모아 정산 여부를 관리하는 화면.
export default function LedgerScreen({ projects, brands, onBack, onOpenProject, onToggleSettled }) {
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
      <AppHeader title="가계부" onBack={onBack} />

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
        <Text style={styles.empty}>금액이 등록된 프로젝트가 없습니다.{'\n'}프로젝트 수정에서 정산 금액을 입력해주세요.</Text>
      ) : (
        priced.map(p => (
          <LedgerItem
            key={p.id}
            project={p}
            brand={brands.find(b => b.id === p.brandId)}
            onPress={() => onOpenProject(p.id)}
            onToggleSettled={() => onToggleSettled(p)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 18, paddingBottom: 50 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: theme.card, padding: 14, borderRadius: theme.radius.lg, ...theme.shadow },
  summaryNum: { fontSize: 18, fontWeight: '800', color: theme.text },
  summaryLabel: { fontSize: 11.5, color: theme.textSub, marginTop: 3 },
  empty: { fontSize: 13, color: theme.textFaint, textAlign: 'center', marginTop: 40, lineHeight: 20 },
});
