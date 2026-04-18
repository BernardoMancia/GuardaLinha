import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { colors, ruleTypeColors } from '../theme/colors';
import { GlassCard } from '../components/GlassCard';
import { RulesStorage } from '../storage/RulesStorage';
import {
  RuleType,
  Rule,
  RULE_LABELS,
  RULE_ICONS,
  BRAZIL_DDDS,
} from '../types/rules';

const RULE_TYPES: RuleType[] = [
  'BLOCK_ALL',
  'BLOCK_ALL_EXCEPT',
  'SPECIFIC_NUMBERS',
  'NUMBER_RANGE',
  'NUMBER_LIST',
  'FOREIGN_CALLS',
  'SPECIFIC_DDD',
  'PREFIX',
  'SUFFIX',
];

const RULE_DESCRIPTIONS: Record<RuleType, string> = {
  BLOCK_ALL: 'Bloqueia absolutamente todas as chamadas recebidas',
  BLOCK_ALL_EXCEPT: 'Bloqueia tudo, exceto números na sua lista branca',
  SPECIFIC_NUMBERS: 'Bloqueia números exatos que você informar',
  NUMBER_RANGE: 'Bloqueia chamadas de um intervalo de números',
  NUMBER_LIST: 'Lista de múltiplos números para bloquear em lote',
  FOREIGN_CALLS: 'Bloqueia chamadas com DDI diferente do Brasil (+55)',
  SPECIFIC_DDD: 'Bloqueia chamadas de determinados DDDs brasileiros',
  PREFIX: 'Bloqueia chamadas cujo número começa com 4 dígitos específicos',
  SUFFIX: 'Bloqueia chamadas cujo número termina com 4 dígitos específicos',
};

export const AddRuleScreen = ({ navigation }: any) => {
  const [selectedType, setSelectedType] = useState<RuleType | null>(null);
  const [label, setLabel] = useState('');
  const [numbersText, setNumbersText] = useState('');
  const [whitelistText, setWhitelistText] = useState('');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [selectedDDDs, setSelectedDDDs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleDDD = (ddd: string) => {
    setSelectedDDDs((prev) =>
      prev.includes(ddd) ? prev.filter((d) => d !== ddd) : [...prev, ddd]
    );
  };

  const buildRule = (): Rule | null => {
    const id = Date.now().toString();
    const base = {
      id,
      label: label.trim() || RULE_LABELS[selectedType!],
      enabled: true,
      createdAt: Date.now(),
    };

    const parseNumbers = (text: string) =>
      text
        .split(/[\n,;]+/)
        .map((n) => n.trim().replace(/\D/g, ''))
        .filter((n) => n.length >= 8);

    switch (selectedType) {
      case 'BLOCK_ALL':
        return { ...base, type: 'BLOCK_ALL' };

      case 'BLOCK_ALL_EXCEPT': {
        const whitelist = parseNumbers(whitelistText);
        if (whitelist.length === 0) {
          Alert.alert('Atenção', 'Adicione ao menos um número à lista de exceções.');
          return null;
        }
        return { ...base, type: 'BLOCK_ALL_EXCEPT', whitelist };
      }

      case 'SPECIFIC_NUMBERS': {
        const numbers = parseNumbers(numbersText);
        if (numbers.length === 0) {
          Alert.alert('Atenção', 'Informe ao menos um número para bloquear.');
          return null;
        }
        return { ...base, type: 'SPECIFIC_NUMBERS', numbers };
      }

      case 'NUMBER_RANGE': {
        const f = rangeFrom.replace(/\D/g, '');
        const t = rangeTo.replace(/\D/g, '');
        if (!f || !t || f.length < 8 || t.length < 8) {
          Alert.alert('Atenção', 'Informe um range válido com ao menos 8 dígitos cada.');
          return null;
        }
        if (BigInt(f) > BigInt(t)) {
          Alert.alert('Atenção', 'O número inicial deve ser menor que o final.');
          return null;
        }
        return { ...base, type: 'NUMBER_RANGE', from: f, to: t };
      }

      case 'NUMBER_LIST': {
        const numbers = parseNumbers(numbersText);
        if (numbers.length === 0) {
          Alert.alert('Atenção', 'Informe ao menos um número na lista.');
          return null;
        }
        return { ...base, type: 'NUMBER_LIST', numbers };
      }

      case 'FOREIGN_CALLS':
        return { ...base, type: 'FOREIGN_CALLS', allowedCountryCode: '55' };

      case 'SPECIFIC_DDD': {
        if (selectedDDDs.length === 0) {
          Alert.alert('Atenção', 'Selecione ao menos um DDD.');
          return null;
        }
        return { ...base, type: 'SPECIFIC_DDD', ddds: selectedDDDs };
      }

      case 'PREFIX': {
        const p = prefix.replace(/\D/g, '');
        if (p.length !== 4) {
          Alert.alert('Atenção', 'O prefixo deve ter exatamente 4 dígitos.');
          return null;
        }
        return { ...base, type: 'PREFIX', prefix: p };
      }

      case 'SUFFIX': {
        const s = suffix.replace(/\D/g, '');
        if (s.length !== 4) {
          Alert.alert('Atenção', 'O sufixo deve ter exatamente 4 dígitos.');
          return null;
        }
        return { ...base, type: 'SUFFIX', suffix: s };
      }

      default:
        return null;
    }
  };

  const save = async () => {
    if (!selectedType) {
      Alert.alert('Atenção', 'Selecione um tipo de regra.');
      return;
    }
    const rule = buildRule();
    if (!rule) return;
    setSaving(true);
    await RulesStorage.addRule(rule);
    setSaving(false);
    navigation.goBack();
  };

  const accent = selectedType ? ruleTypeColors[selectedType] || colors.neonGreen : colors.neonGreen;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nova Regra</Text>
      <Text style={styles.subtitle}>Escolha o tipo de bloqueio</Text>

      <View style={styles.typeGrid}>
        {RULE_TYPES.map((type) => {
          const typeAccent = ruleTypeColors[type] || colors.neonBlue;
          const isSelected = selectedType === type;
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeCard,
                isSelected && {
                  borderColor: typeAccent,
                  backgroundColor: typeAccent + '18',
                },
              ]}
              onPress={() => setSelectedType(type)}
              activeOpacity={0.7}
            >
              <Text style={styles.typeIcon}>{RULE_ICONS[type]}</Text>
              <Text style={[styles.typeLabel, isSelected && { color: typeAccent }]}>
                {RULE_LABELS[type]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedType && (
        <>
          <GlassCard style={styles.descCard} accent={accent}>
            <Text style={styles.descIcon}>{RULE_ICONS[selectedType]}</Text>
            <Text style={[styles.descTitle, { color: accent }]}>{RULE_LABELS[selectedType]}</Text>
            <Text style={styles.descText}>{RULE_DESCRIPTIONS[selectedType]}</Text>
          </GlassCard>

          <GlassCard style={styles.formCard}>
            <Text style={styles.fieldLabel}>Nome da regra (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Telemarketing São Paulo"
              placeholderTextColor={colors.textMuted}
              value={label}
              onChangeText={setLabel}
            />

            {(selectedType === 'SPECIFIC_NUMBERS' || selectedType === 'NUMBER_LIST') && (
              <>
                <Text style={styles.fieldLabel}>Números (um por linha ou separados por vírgula)</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="11999990000&#10;21988880000&#10;..."
                  placeholderTextColor={colors.textMuted}
                  value={numbersText}
                  onChangeText={setNumbersText}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </>
            )}

            {selectedType === 'BLOCK_ALL_EXCEPT' && (
              <>
                <Text style={styles.fieldLabel}>Números permitidos (whitelist)</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="11999990000&#10;21988880000&#10;..."
                  placeholderTextColor={colors.textMuted}
                  value={whitelistText}
                  onChangeText={setWhitelistText}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </>
            )}

            {selectedType === 'NUMBER_RANGE' && (
              <>
                <Text style={styles.fieldLabel}>Número inicial</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 11999990000"
                  placeholderTextColor={colors.textMuted}
                  value={rangeFrom}
                  onChangeText={setRangeFrom}
                  keyboardType="numeric"
                />
                <Text style={styles.fieldLabel}>Número final</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 11999999999"
                  placeholderTextColor={colors.textMuted}
                  value={rangeTo}
                  onChangeText={setRangeTo}
                  keyboardType="numeric"
                />
              </>
            )}

            {selectedType === 'FOREIGN_CALLS' && (
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxText}>
                  🌍 Chamadas com DDI diferente de +55 (Brasil) serão bloqueadas automaticamente.
                  Não é necessário configuração adicional.
                </Text>
              </View>
            )}

            {selectedType === 'SPECIFIC_DDD' && (
              <>
                <Text style={styles.fieldLabel}>
                  DDDs a bloquear ({selectedDDDs.length} selecionado{selectedDDDs.length !== 1 ? 's' : ''})
                </Text>
                <View style={styles.dddGrid}>
                  {BRAZIL_DDDS.map((ddd) => {
                    const isActive = selectedDDDs.includes(ddd);
                    return (
                      <TouchableOpacity
                        key={ddd}
                        style={[
                          styles.dddChip,
                          isActive && { backgroundColor: accent + '22', borderColor: accent },
                        ]}
                        onPress={() => toggleDDD(ddd)}
                      >
                        <Text style={[styles.dddText, isActive && { color: accent, fontWeight: '700' }]}>
                          {ddd}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.dddActions}>
                  <TouchableOpacity onPress={() => setSelectedDDDs([...BRAZIL_DDDS])} style={styles.dddActionBtn}>
                    <Text style={styles.dddActionText}>Selecionar todos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedDDDs([])} style={styles.dddActionBtn}>
                    <Text style={styles.dddActionText}>Limpar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {selectedType === 'PREFIX' && (
              <>
                <Text style={styles.fieldLabel}>Prefixo (primeiros 4 dígitos)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 0800 ou 1195"
                  placeholderTextColor={colors.textMuted}
                  value={prefix}
                  onChangeText={(t) => setPrefix(t.replace(/\D/g, '').slice(0, 4))}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <Text style={styles.hint}>* Serão bloqueadas chamadas cujo número começa com esses 4 dígitos</Text>
              </>
            )}

            {selectedType === 'SUFFIX' && (
              <>
                <Text style={styles.fieldLabel}>Sufixo (últimos 4 dígitos)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 0000 ou 1234"
                  placeholderTextColor={colors.textMuted}
                  value={suffix}
                  onChangeText={(t) => setSuffix(t.replace(/\D/g, '').slice(0, 4))}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <Text style={styles.hint}>* Serão bloqueadas chamadas cujo número termina com esses 4 dígitos</Text>
              </>
            )}
          </GlassCard>
        </>
      )}

      <TouchableOpacity
        style={[styles.saveBtn, { borderColor: accent, backgroundColor: accent + '22' }, saving && styles.saveBtnDisabled]}
        onPress={save}
        disabled={saving}
        activeOpacity={0.8}
      >
        <Text style={[styles.saveBtnText, { color: accent }]}>
          {saving ? 'Salvando...' : '✓ Salvar Regra'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeCard: {
    width: '47%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    gap: 6,
  },
  typeIcon: { fontSize: 26 },
  typeLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },
  descCard: { marginBottom: 16, alignItems: 'center', padding: 20 },
  descIcon: { fontSize: 36, marginBottom: 8 },
  descTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  descText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  formCard: { marginBottom: 20, gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, marginTop: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 4,
  },
  textarea: { height: 120, paddingTop: 12 },
  infoBox: {
    backgroundColor: colors.neonBlueDim,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.neonBlue + '44',
    padding: 14,
    marginTop: 8,
  },
  infoBoxText: { color: colors.neonBlue, fontSize: 13, lineHeight: 20 },
  dddGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  dddChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  dddText: { fontSize: 13, color: colors.textSecondary },
  dddActions: { flexDirection: 'row', gap: 12 },
  dddActionBtn: { paddingVertical: 6 },
  dddActionText: { color: colors.neonBlue, fontSize: 12, fontWeight: '600' },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  saveBtn: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontWeight: '800', fontSize: 16 },
});
