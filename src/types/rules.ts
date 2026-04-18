export type RuleType =
  | 'BLOCK_ALL'
  | 'BLOCK_ALL_EXCEPT'
  | 'SPECIFIC_NUMBERS'
  | 'NUMBER_RANGE'
  | 'NUMBER_LIST'
  | 'FOREIGN_CALLS'
  | 'SPECIFIC_DDD'
  | 'PREFIX'
  | 'SUFFIX';

export interface BaseRule {
  id: string;
  type: RuleType;
  label: string;
  enabled: boolean;
  createdAt: number;
}

export interface BlockAllRule extends BaseRule {
  type: 'BLOCK_ALL';
}

export interface BlockAllExceptRule extends BaseRule {
  type: 'BLOCK_ALL_EXCEPT';
  whitelist: string[];
}

export interface SpecificNumbersRule extends BaseRule {
  type: 'SPECIFIC_NUMBERS';
  numbers: string[];
}

export interface NumberRangeRule extends BaseRule {
  type: 'NUMBER_RANGE';
  from: string;
  to: string;
}

export interface NumberListRule extends BaseRule {
  type: 'NUMBER_LIST';
  numbers: string[];
}

export interface ForeignCallsRule extends BaseRule {
  type: 'FOREIGN_CALLS';
  allowedCountryCode: string;
}

export interface SpecificDDDRule extends BaseRule {
  type: 'SPECIFIC_DDD';
  ddds: string[];
}

export interface PrefixRule extends BaseRule {
  type: 'PREFIX';
  prefix: string;
}

export interface SuffixRule extends BaseRule {
  type: 'SUFFIX';
  suffix: string;
}

export type Rule =
  | BlockAllRule
  | BlockAllExceptRule
  | SpecificNumbersRule
  | NumberRangeRule
  | NumberListRule
  | ForeignCallsRule
  | SpecificDDDRule
  | PrefixRule
  | SuffixRule;

export interface BlockedCallLog {
  id: string;
  number: string;
  ruleId: string;
  ruleType: RuleType;
  timestamp: number;
}

export const RULE_LABELS: Record<RuleType, string> = {
  BLOCK_ALL: 'Bloquear Todas',
  BLOCK_ALL_EXCEPT: 'Todas com Exceção',
  SPECIFIC_NUMBERS: 'Números Específicos',
  NUMBER_RANGE: 'Range de Números',
  NUMBER_LIST: 'Lista de Números',
  FOREIGN_CALLS: 'Ligações Internacionais',
  SPECIFIC_DDD: 'DDDs Específicos',
  PREFIX: 'Prefixo (4 dígitos)',
  SUFFIX: 'Sufixo (4 dígitos)',
};

export const RULE_ICONS: Record<RuleType, string> = {
  BLOCK_ALL: '🚫',
  BLOCK_ALL_EXCEPT: '🛡️',
  SPECIFIC_NUMBERS: '📵',
  NUMBER_RANGE: '📊',
  NUMBER_LIST: '📋',
  FOREIGN_CALLS: '🌍',
  SPECIFIC_DDD: '📍',
  PREFIX: '🔢',
  SUFFIX: '🔣',
};

export const BRAZIL_DDDS = [
  '11','12','13','14','15','16','17','18','19',
  '21','22','24','27','28',
  '31','32','33','34','35','37','38',
  '41','42','43','44','45','46','47','48','49',
  '51','53','54','55',
  '61','62','63','64','65','66','67','68','69',
  '71','73','74','75','77','79',
  '81','82','83','84','85','86','87','88','89',
  '91','92','93','94','95','96','97','98','99',
];
