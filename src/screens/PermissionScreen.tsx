import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { GlassCard } from '../components/GlassCard';
import { CallBlocker } from '../native/CallBlocker';

export const PermissionScreen = ({ navigation }: any) => {
  const [checking, setChecking] = useState(false);
  const [hasRole, setHasRole] = useState(false);

  const check = async () => {
    const role = await CallBlocker.isScreeningRoleHeld();
    setHasRole(role);
    if (role) navigation.navigate('Home');
  };

  useEffect(() => { check(); }, []);

  const requestRole = async () => {
    setChecking(true);
    await CallBlocker.requestScreeningRole();
    setTimeout(async () => {
      await check();
      setChecking(false);
    }, 2000);
  };

  const steps = [
    {
      icon: '📋',
      title: 'Abrir Configurações',
      desc: 'O sistema abrirá as configurações de triagem de chamadas',
    },
    {
      icon: '✅',
      title: 'Selecionar GuardaLinha',
      desc: 'Escolha "GuardaLinha" como app de triagem de chamadas padrão',
    },
    {
      icon: '🛡️',
      title: 'Pronto!',
      desc: 'A proteção estará ativa imediatamente após a concessão',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroContainer}>
        <Text style={styles.heroEmoji}>🔐</Text>
        <Text style={styles.title}>Permissão Necessária</Text>
        <Text style={styles.subtitle}>
          Para bloquear chamadas, o GuardaLinha precisa ser configurado como app de
          triagem de chamadas do sistema
        </Text>
      </View>

      <GlassCard style={styles.infoCard} accent={colors.neonBlue}>
        <Text style={styles.infoTitle}>O que é a triagem de chamadas?</Text>
        <Text style={styles.infoBody}>
          O Android 10+ permite que um aplicativo atue como "triador" de chamadas, podendo
          inspecionar e bloquear chamadas antes de chegar ao seu telefone. Esta é a única
          forma segura e aprovada pelo Google de bloquear chamadas em dispositivos modernos.
        </Text>
      </GlassCard>

      <Text style={styles.stepsTitle}>Como conceder a permissão:</Text>

      {steps.map((step, i) => (
        <GlassCard key={i} style={styles.stepCard}>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepIcon}>{step.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        </GlassCard>
      ))}

      <GlassCard style={styles.warningCard} accent={colors.neonOrange}>
        <Text style={styles.warningText}>
          ⚠️ Apenas um app pode ser o triador de chamadas ao mesmo tempo. Se você já tem
          outro app configurado (ex: Google Phone), ele será substituído temporariamente.
        </Text>
      </GlassCard>

      <TouchableOpacity
        style={[styles.btn, checking && styles.btnLoading]}
        onPress={requestRole}
        disabled={checking}
      >
        <Text style={styles.btnText}>
          {checking ? 'Verificando...' : '🔓 Conceder Permissão'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.skipText}>Configurar depois</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 120 },
  heroContainer: { alignItems: 'center', paddingVertical: 32 },
  heroEmoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  infoCard: { marginBottom: 24 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: colors.neonBlue, marginBottom: 8 },
  infoBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  stepsTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, letterSpacing: 1, marginBottom: 12 },
  stepCard: { marginBottom: 10 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.neonGreenDim,
    borderColor: colors.neonGreen + '55',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: colors.neonGreen, fontWeight: '700', fontSize: 12 },
  stepIcon: { fontSize: 22 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  stepDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  warningCard: { marginTop: 12, marginBottom: 24 },
  warningText: { fontSize: 12, color: colors.neonOrange, lineHeight: 18 },
  btn: {
    backgroundColor: colors.neonGreenDim,
    borderColor: colors.neonGreen,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnLoading: { opacity: 0.6 },
  btnText: { color: colors.neonGreen, fontWeight: '800', fontSize: 16 },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { color: colors.textMuted, fontSize: 13 },
});
