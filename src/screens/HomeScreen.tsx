import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { AnimatedShield } from '../components/AnimatedShield';
import { GlassCard } from '../components/GlassCard';
import { NeonToggle } from '../components/NeonToggle';
import { StatusBadge } from '../components/StatusBadge';
import { RulesStorage } from '../storage/RulesStorage';
import { CallBlocker } from '../native/CallBlocker';
import { Rule, RULE_LABELS, RULE_ICONS, ruleTypeColors } from '../types/rules';

export const HomeScreen = ({ navigation }: any) => {
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [rules, setRules] = useState<Rule[]>([]);
  const [hasRole, setHasRole] = useState(false);
  const [blockedToday, setBlockedToday] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [r, master, role, count] = await Promise.all([
      RulesStorage.getRules(),
      RulesStorage.getMasterEnabled(),
      CallBlocker.isScreeningRoleHeld(),
      CallBlocker.getBlockedCount(),
    ]);
    setRules(r);
    setMasterEnabled(master);
    setHasRole(role);
    setBlockedToday(count);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const toggleMaster = async () => {
    const next = !masterEnabled;
    setMasterEnabled(next);
    await RulesStorage.setMasterEnabled(next);
  };

  const activeRules = rules.filter((r) => r.enabled);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neonGreen} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>GuardaLinha</Text>
          <Text style={styles.subtitle}>Proteção inteligente de chamadas</Text>
        </View>
        <StatusBadge active={masterEnabled && hasRole} label={hasRole ? (masterEnabled ? 'Ativo' : 'Pausado') : 'Sem Permissão'} />
      </View>

      {!hasRole && (
        <TouchableOpacity
          style={styles.permissionBanner}
          onPress={() => navigation.navigate('Permission')}
        >
          <Text style={styles.permissionBannerIcon}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.permissionBannerTitle}>Permissão Necessária</Text>
            <Text style={styles.permissionBannerSub}>Toque para configurar a triagem de chamadas</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      )}

      <AnimatedShield active={masterEnabled && hasRole} blockedToday={blockedToday} />

      <GlassCard style={styles.masterCard}>
        <View style={styles.masterRow}>
          <View>
            <Text style={styles.masterLabel}>Proteção Ativa</Text>
            <Text style={styles.masterSub}>
              {masterEnabled ? 'Todas as regras estão funcionando' : 'Nenhuma chamada será bloqueada'}
            </Text>
          </View>
          <NeonToggle value={masterEnabled} onToggle={toggleMaster} activeColor={colors.neonGreen} />
        </View>
      </GlassCard>

      <View style={styles.statsRow}>
        <GlassCard style={styles.statCard} accent={colors.neonBlue}>
          <Text style={styles.statValue}>{rules.length}</Text>
          <Text style={styles.statLabel}>Regras Total</Text>
        </GlassCard>
        <GlassCard style={styles.statCard} accent={colors.neonGreen}>
          <Text style={[styles.statValue, { color: colors.neonGreen }]}>{activeRules.length}</Text>
          <Text style={styles.statLabel}>Ativas</Text>
        </GlassCard>
        <GlassCard style={styles.statCard} accent={colors.neonRed}>
          <Text style={[styles.statValue, { color: colors.neonRed }]}>{blockedToday}</Text>
          <Text style={styles.statLabel}>Bloqueadas</Text>
        </GlassCard>
      </View>

      {activeRules.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regras Ativas</Text>
          {activeRules.slice(0, 4).map((rule) => {
            const accent = ruleTypeColors[rule.type] || colors.neonBlue;
            return (
              <View key={rule.id} style={[styles.ruleChip, { borderColor: accent + '44', backgroundColor: accent + '11' }]}>
                <Text style={styles.ruleIcon}>{RULE_ICONS[rule.type]}</Text>
                <Text style={[styles.ruleChipText, { color: accent }]}>
                  {rule.label || RULE_LABELS[rule.type]}
                </Text>
              </View>
            );
          })}
          {activeRules.length > 4 && (
            <Text style={styles.moreText}>+{activeRules.length - 4} mais regras...</Text>
          )}
        </View>
      )}

      {rules.length === 0 && (
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🧩</Text>
          <Text style={styles.emptyTitle}>Nenhuma regra criada</Text>
          <Text style={styles.emptySub}>Vá para "Regras" e adicione seu primeiro filtro de chamadas</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('Rules')}
          >
            <Text style={styles.addBtnText}>+ Criar Regra</Text>
          </TouchableOpacity>
        </GlassCard>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    marginTop: 10,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neonOrange + '15',
    borderColor: colors.neonOrange + '44',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  permissionBannerIcon: { fontSize: 22 },
  permissionBannerTitle: { color: colors.neonOrange, fontWeight: '700', fontSize: 14 },
  permissionBannerSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  arrow: { color: colors.neonOrange, fontSize: 22 },
  masterCard: { marginBottom: 16 },
  masterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  masterLabel: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  masterSub: { fontSize: 12, color: colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, alignItems: 'center', padding: 14 },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.neonBlue },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 10, letterSpacing: 1 },
  ruleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  ruleIcon: { fontSize: 18 },
  ruleChipText: { fontSize: 13, fontWeight: '600' },
  moreText: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 4 },
  emptyCard: { alignItems: 'center', padding: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  addBtn: {
    backgroundColor: colors.neonGreenDim,
    borderColor: colors.neonGreen + '66',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addBtnText: { color: colors.neonGreen, fontWeight: '700', fontSize: 14 },
});
