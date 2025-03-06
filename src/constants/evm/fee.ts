export const DEFAULT_GAS_MULTIPLY = 1.3;

export const EVM_DEFAULT_GAS = '21000';

export const FEE_TYPE = {
  BASIC: 'BASIC',
  EIP_1559: 'EIP-1559',
} as const;

export const GAS_SETTINGS_BY_GAS_RATE_KEY = [
  {
    minBaseFeePerGas: '500000000',
    minMaxPriorityFeePerGas: '1000000000',
  },
  {
    minBaseFeePerGas: '500000000',
    minMaxPriorityFeePerGas: '1000000000',
  },
  {
    minBaseFeePerGas: '500000000',
    minMaxPriorityFeePerGas: '1000000000',
  },
];
