import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rule, BlockedCallLog } from '../types/rules';
import { CallBlocker } from '../native/CallBlocker';

const RULES_KEY = '@callblocker:rules';
const LOGS_KEY = '@callblocker:logs';
const MASTER_KEY = '@callblocker:master_enabled';

export const RulesStorage = {
  getRules: async (): Promise<Rule[]> => {
    try {
      const raw = await AsyncStorage.getItem(RULES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveRules: async (rules: Rule[]): Promise<void> => {
    await AsyncStorage.setItem(RULES_KEY, JSON.stringify(rules));
    await CallBlocker.syncRules(rules);
  },

  addRule: async (rule: Rule): Promise<Rule[]> => {
    const rules = await RulesStorage.getRules();
    const updated = [...rules, rule];
    await RulesStorage.saveRules(updated);
    return updated;
  },

  updateRule: async (id: string, patch: Partial<Rule>): Promise<Rule[]> => {
    const rules = await RulesStorage.getRules();
    const updated = rules.map((r) => (r.id === id ? { ...r, ...patch } : r));
    await RulesStorage.saveRules(updated as Rule[]);
    return updated as Rule[];
  },

  deleteRule: async (id: string): Promise<Rule[]> => {
    const rules = await RulesStorage.getRules();
    const updated = rules.filter((r) => r.id !== id);
    await RulesStorage.saveRules(updated);
    return updated;
  },

  toggleRule: async (id: string): Promise<Rule[]> => {
    const rules = await RulesStorage.getRules();
    const updated = rules.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    await RulesStorage.saveRules(updated as Rule[]);
    return updated as Rule[];
  },

  getMasterEnabled: async (): Promise<boolean> => {
    try {
      const val = await AsyncStorage.getItem(MASTER_KEY);
      return val !== 'false';
    } catch {
      return true;
    }
  },

  setMasterEnabled: async (enabled: boolean): Promise<void> => {
    await AsyncStorage.setItem(MASTER_KEY, String(enabled));
    const rules = await RulesStorage.getRules();
    await CallBlocker.syncRules(enabled ? rules : []);
  },

  getLogs: async (): Promise<BlockedCallLog[]> => {
    try {
      const raw = await AsyncStorage.getItem(LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addLog: async (log: BlockedCallLog): Promise<void> => {
    const logs = await RulesStorage.getLogs();
    const updated = [log, ...logs].slice(0, 500);
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  },

  clearLogs: async (): Promise<void> => {
    await AsyncStorage.removeItem(LOGS_KEY);
  },
};
