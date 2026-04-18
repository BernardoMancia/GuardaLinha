import { NativeModules, Platform } from 'react-native';
import { Rule } from '../types/rules';

const { CallBlockerModule } = NativeModules;

const isAndroid = Platform.OS === 'android';

const noop = async () => {};

export const CallBlocker = {
  syncRules: async (rules: Rule[]): Promise<void> => {
    if (!isAndroid || !CallBlockerModule) return;
    const json = JSON.stringify(rules);
    return CallBlockerModule.syncRules(json);
  },

  requestScreeningRole: async (): Promise<void> => {
    if (!isAndroid || !CallBlockerModule) return;
    return CallBlockerModule.requestScreeningRole();
  },

  isScreeningRoleHeld: async (): Promise<boolean> => {
    if (!isAndroid || !CallBlockerModule) return false;
    return CallBlockerModule.isScreeningRoleHeld();
  },

  getBlockedCount: async (): Promise<number> => {
    if (!isAndroid || !CallBlockerModule) return 0;
    return CallBlockerModule.getBlockedCount();
  },

  resetBlockedCount: async (): Promise<void> => {
    if (!isAndroid || !CallBlockerModule) return;
    return CallBlockerModule.resetBlockedCount();
  },
};
