import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { GlassCard } from '../components/GlassCard';
import { RulesStorage } from '../storage/RulesStorage';
import { BlockedCallLog, RULE_ICONS, RULE_LABELS, RuleType } from '../types/rules';

const formatDate = (ts: number): string => {
  const d = new Date(ts);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export const LogScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState<BlockedCallLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      RulesStorage.getLogs().then(setLogs);
    }, [])
  );

  const clearLogs = () => {
    Alert.alert('Limpar Log', 'Deseja apagar todo o histórico de chamadas bloqueadas?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: async () => {
          await RulesStorage.clearLogs();
          setLogs([]);
        },
      },
    ]);
  };

  const unblock = async (log: BlockedCallLog) => {
    Alert.alert(
      'Desbloquear',
      `Adicionar ${log.number} à lista de exceções?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desbloquear',
          onPress: async () => {
            const rules = await RulesStorage.getRules();
            const exceptionRule = rules.find((r) => r.type === 'BLOCK_ALL_EXCEPT');
            if (exceptionRule && exceptionRule.type === 'BLOCK_ALL_EXCEPT') {
              await RulesStorage.updateRule(exceptionRule.id, {
                whitelist: [...exceptionRule.whitelist, log.number],
              });
            } else {
              await RulesStorage.addRule({
                id: Date.now().toString(),
                type: 'BLOCK_ALL_EXCEPT',
                label: 'Exceções',
                enabled: true,
                createdAt: Date.now(),
                whitelist: [log.number],
              });
            }
            Alert.alert('✅ Número liberado', `${log.number} foi adicionado às exceções.`);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: BlockedCallLog }) => {
    const icon = RULE_ICONS[item.ruleType as RuleType] || '🚫';
    const label = RULE_LABELS[item.ruleType as RuleType] || item.ruleType;
    return (
      <GlassCard style={styles.logCard}>
        <View style={styles.logRow}>
          <View style={styles.logLeft}>
            <Text style={styles.logNumber}>{item.number || 'Número oculto'}</Text>
            <View style={styles.logMeta}>
              <Text style={styles.logIcon}>{icon}</Text>
              <Text style={styles.logRule}>{label}</Text>
              <Text style={styles.logDot}>·</Text>
              <Text style={styles.logTime}>{formatDate(item.timestamp)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.unblockBtn} onPress={() => unblock(item)}>
            <Text style={styles.unblockText}>Liberar</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Histórico</Text>
          <Text style={styles.subtitle}>{logs.length} chamada{logs.length !== 1 ? 's' : ''} bloqueada{logs.length !== 1 ? 's' : ''}</Text>
        </View>
        {logs.length > 0 && (
          <TouchableOpacity onPress={clearLogs} style={styles.clearBtn}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {logs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>Nenhuma chamada bloqueada</Text>
          <Text style={styles.emptySub}>
            O histórico de chamadas bloqueadas aparecerá aqui
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neonRed + '55',
    backgroundColor: colors.neonRedDim,
  },
  clearText: { color: colors.neonRed, fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 16 },
  logCard: { marginBottom: 10 },
  logRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logLeft: { flex: 1 },
  logNumber: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  logMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  logIcon: { fontSize: 12 },
  logRule: { fontSize: 11, color: colors.neonRed },
  logDot: { color: colors.textMuted },
  logTime: { fontSize: 11, color: colors.textMuted },
  unblockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neonGreen + '55',
    backgroundColor: colors.neonGreenDim,
    marginLeft: 8,
  },
  unblockText: { color: colors.neonGreen, fontSize: 12, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
