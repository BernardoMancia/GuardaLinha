import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, ruleTypeColors } from '../theme/colors';
import { Rule, RULE_LABELS, RULE_ICONS } from '../types/rules';
import { NeonToggle } from './NeonToggle';

interface RuleItemProps {
  rule: Rule;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const getRuleSummary = (rule: Rule): string => {
  switch (rule.type) {
    case 'BLOCK_ALL':
      return 'Todas as chamadas serão bloqueadas';
    case 'BLOCK_ALL_EXCEPT':
      return `${rule.whitelist.length} número(s) na lista branca`;
    case 'SPECIFIC_NUMBERS':
      return `${rule.numbers.length} número(s) bloqueado(s)`;
    case 'NUMBER_RANGE':
      return `${rule.from} → ${rule.to}`;
    case 'NUMBER_LIST':
      return `${rule.numbers.length} número(s) na lista`;
    case 'FOREIGN_CALLS':
      return `DDI diferente de +${rule.allowedCountryCode}`;
    case 'SPECIFIC_DDD':
      return `DDDs: ${rule.ddds.join(', ')}`;
    case 'PREFIX':
      return `Começa com ${rule.prefix}`;
    case 'SUFFIX':
      return `Termina com ${rule.suffix}`;
    default:
      return '';
  }
};

export const RuleItem: React.FC<RuleItemProps> = ({ rule, onToggle, onDelete }) => {
  const accent = ruleTypeColors[rule.type] || colors.neonBlue;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const confirmDelete = () => {
    Alert.alert(
      'Remover Regra',
      `Deseja remover a regra "${rule.label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onDelete(rule.id),
        },
      ]
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={[styles.card, { borderColor: rule.enabled ? accent + '44' : colors.border }]}>
        <View style={styles.header}>
          <View style={styles.left}>
            <Text style={styles.icon}>{RULE_ICONS[rule.type]}</Text>
            <View>
              <Text style={[styles.label, { color: rule.enabled ? accent : colors.textSecondary }]}>
                {rule.label || RULE_LABELS[rule.type]}
              </Text>
              <Text style={styles.summary}>{getRuleSummary(rule)}</Text>
            </View>
          </View>
          <NeonToggle
            value={rule.enabled}
            onToggle={() => onToggle(rule.id)}
            activeColor={accent}
            size="small"
          />
        </View>
        <View style={styles.footer}>
          <View style={[styles.tag, { backgroundColor: accent + '22', borderColor: accent + '55' }]}>
            <Text style={[styles.tagText, { color: accent }]}>{RULE_LABELS[rule.type]}</Text>
          </View>
          <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  icon: { fontSize: 24 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  summary: { fontSize: 12, color: colors.textMuted },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: { fontSize: 11, fontWeight: '600' },
  deleteBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  deleteText: { color: colors.neonRed, fontSize: 12, fontWeight: '600' },
});
