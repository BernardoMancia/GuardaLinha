import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { RuleItem } from '../components/RuleItem';
import { RulesStorage } from '../storage/RulesStorage';
import { Rule } from '../types/rules';

export const RulesScreen = ({ navigation }: any) => {
  const [rules, setRules] = useState<Rule[]>([]);

  useFocusEffect(
    useCallback(() => {
      RulesStorage.getRules().then(setRules);
    }, [])
  );

  const handleToggle = async (id: string) => {
    const updated = await RulesStorage.toggleRule(id);
    setRules(updated as Rule[]);
  };

  const handleDelete = async (id: string) => {
    const updated = await RulesStorage.deleteRule(id);
    setRules(updated);
  };

  const clearAll = () => {
    Alert.alert(
      'Remover Todas',
      'Deseja remover todas as regras? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover Tudo',
          style: 'destructive',
          onPress: async () => {
            await RulesStorage.saveRules([]);
            setRules([]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Regras</Text>
          <Text style={styles.subtitle}>{rules.length} regra{rules.length !== 1 ? 's' : ''} configurada{rules.length !== 1 ? 's' : ''}</Text>
        </View>
        {rules.length > 0 && (
          <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {rules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔧</Text>
          <Text style={styles.emptyTitle}>Sem regras</Text>
          <Text style={styles.emptyDesc}>
            Toque no botão abaixo para adicionar seu primeiro filtro de chamadas
          </Text>
        </View>
      ) : (
        <FlatList
          data={rules}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RuleItem rule={item} onToggle={handleToggle} onDelete={handleDelete} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddRule')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
        <Text style={styles.fabText}>Nova Regra</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
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
  clearBtnText: { color: colors.neonRed, fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neonGreen,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 22,
    gap: 8,
    shadowColor: colors.neonGreen,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabIcon: { color: colors.bg, fontSize: 22, fontWeight: '800' },
  fabText: { color: colors.bg, fontWeight: '800', fontSize: 15 },
});
