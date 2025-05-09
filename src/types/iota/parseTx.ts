import type { IotaTransactionBlockResponse } from '@iota/iota-sdk/client';

export interface StakingTransactionInfo {
  coinType?: string;
  amount: string;
  validatorAddress: string;
  isUnstaking?: boolean;
}

export interface SendTransactionInfo {
  isSender: boolean;
  sender: string;
  recipient: string;
  coinType?: string;
  coinAmount?: string;
  objectId?: string;
  objectType?: string;
}

export interface MoveCallTransactionInfo {
  packageObjectId: string;
  moduleName: string;
  functionName: string;
  possibleDisplayObjectIds?: string[];
}

export interface FaucetTransactionInfo {
  amount: string;
}

export interface BasicTransactionInfo {
  type: string;
  commands?: string[];
}

export interface ImportantTransactionInfo {
  staking?: StakingTransactionInfo[];
  sending?: SendTransactionInfo[];
  moveCalls?: MoveCallTransactionInfo[];
  faucet?: FaucetTransactionInfo;
  basic?: BasicTransactionInfo;
}

export interface AnalyzedTransaction {
  owner: string;
  digest: string;
  timestampMs?: string | null;
  isSender: boolean;
  from?: string;
  totalGasUsed?: string;
  ownerBalanceChanges?: Record<string, string>;
  important: ImportantTransactionInfo;
  status: 'success' | 'failure';
  original: IotaTransactionBlockResponse;
}

export type IotaJsonValue = string | number | boolean | IotaJsonValue[];
