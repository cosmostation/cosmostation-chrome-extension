export const ETHEREUM_TX_TYPE = {
  CANCEL: 'cancel',
  RETRY: 'retry',
  TOKEN_METHOD_TRANSFER: 'transfer',
  TOKEN_METHOD_TRANSFER_FROM: 'transferfrom',
  TOKEN_METHOD_SAFE_TRANSFER_FROM: 'safetransferfrom',
  TOKEN_METHOD_APPROVE: 'approve',
  TOKEN_METHOD_IS_APPROVED_FOR_ALL: 'isapprovedforall',
  INCOMING: 'incoming',
  SIMPLE_SEND: 'simpleSend',
  CONTRACT_INTERACTION: 'contractInteraction',
  DEPLOY_CONTRACT: 'contractDeployment',
  SWAP: 'swap',
  UNOSWAP: 'unoswap',
  SWAP_APPROVAL: 'swapApproval',
  SIGN: 'sign',
  SIGN_TYPED_DATA: 'signTypedData',
  PERSONAL_SIGN: 'personalSign',
} as const;

export const ETHEREUM_CONTRACT_KIND = {
  ERC20: 'erc20',
  ERC721: 'erc721',
  ERC1155: 'erc1155',
  ONEINCH: 'oneInch',
} as const;

export const FEE_TYPE = {
  BASIC: 'BASIC',
  EIP_1559: 'EIP-1559',
} as const;

export const TOKEN_TYPE = {
  ERC20: 'ERC20',
  ERC721: 'ERC721',
  ERC1155: 'ERC1155',
} as const;

export const ETHEREUM_NFT_STANDARD = {
  ERC721: 'ERC721',
  ERC1155: 'ERC1155',
} as const;

export const ERC721_INTERFACE_ID = '0x80ac58cd';
export const ERC1155_INTERFACE_ID = '0xd9b67a26';

export const TRANSACTION_RESULT = {
  SUCCESS: '1',
} as const;

export const GAS_SETTINGS_BY_GAS_RATE_KEY = {
  tiny: {
    minBaseFeePerGas: '500000000',
    minMaxPriorityFeePerGas: '1000000000',
  },
  low: {
    minBaseFeePerGas: '500000000',
    minMaxPriorityFeePerGas: '1000000000',
  },
  average: {
    minBaseFeePerGas: '500000000',
    minMaxPriorityFeePerGas: '1000000000',
  },
};

export const EIP_6963_EVENTS = {
  request: 'eip6963:requestProvider',
  announce: 'eip6963:announceProvider',
} as const;
