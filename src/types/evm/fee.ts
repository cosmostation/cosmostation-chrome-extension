import type { FEE_TYPE } from '@/constants/evm/fee';

export type FeeType = ValueOf<typeof FEE_TYPE>;

export interface EIP1559Configuration {
  maxBaseFeePerGas: string;
  maxPriorityFeePerGas: string;
}
