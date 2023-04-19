export const ETHEREUM_TX_TYPE = {
  CANCEL: 'cancel',
  RETRY: 'retry',
  TOKEN_METHOD_TRANSFER: 'transfer',
  TOKEN_METHOD_TRANSFER_FROM: 'transferfrom',
  TOKEN_METHOD_APPROVE: 'approve',
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
