export const TRANSACTION_RESULT = {
  SUCCESS: '1',
} as const;

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
