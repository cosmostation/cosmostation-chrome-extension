export const ETHEREUM_POPUP_METHOD_TYPE = {
  ETH__REQUEST_ACCOUNTS: 'eth_requestAccounts',
  ETH__SEND_TRANSACTION: 'eth_sendTransaction',
  ETH__SIGN: 'eth_sign',
  ETH__SIGN_TRANSACTION: 'eth_signTransaction',
  ETH__SIGN_TYPED_DATA: 'eth_signTypedData',
  ETH__SIGN_TYPED_DATA_V1: 'eth_signTypedData_v1',
  ETH__SIGN_TYPED_DATA_V3: 'eth_signTypedData_v3',
  ETH__SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',
  PERSONAL_SIGN: 'personal_sign',

  // custom
  ETHC__ADD_NETWORK: 'ethc_addNetwork',
  ETHC__SWITCH_NETWORK: 'ethc_switchNetwork',
  ETHC__ADD_TOKENS: 'ethc_addTokens',
} as const;

export const ETHEREUM_NO_POPUP_METHOD_TYPE = {
  ETH__ACCOUNTS: 'eth_accounts',
  ETH__BLOCK_NUMBER: 'eth_blockNumber',
  ETH__CALL: 'eth_call',
  ETH__CHAIN_ID: 'eth_chainId',
  ETH__COINBASE: 'eth_coinbase',
  ETH__DECRYPT: 'eth_decrypt',
  ETH__ESTIMATE_GAS: 'eth_estimateGas',
  ETH__FEE_HISTORY: 'eth_feeHistory',
  ETH__GAS_PRICE: 'eth_gasPrice',
  ETH__GET_BALANCE: 'eth_getBalance',
  ETH__GET_BLOCK_BY_HASH: 'eth_getBlockByHash',
  ETH__GET_BLOCK_BY_NUMBER: 'eth_getBlockByNumber',
  ETH__GET_BLOCK_TRANSACTION_COUNT_BY_HASH: 'eth_getBlockTransactionCountByHash',
  ETH__GET_BLOCK_TRANSACTION_COUNT_BY_NUMBER: 'eth_getBlockTransactionCountByNumber',
  ETH__GET_CODE: 'eth_getCode',
  ETH__GET_ENCRYPTION_PUBLIC_KEY: 'eth_getEncryptionPublicKey',
  ETH__GET_FILTER_CHANGES: 'eth_getFilterChanges',
  ETH__GET_FILTER_LOGS: 'eth_getFilterLogs',
  ETH__GET_LOGS: 'eth_getLogs',
  ETH__GET_PROOF: 'eth_getProof',
  ETH__GET_STORAGEAT: 'eth_getStorageAt',
  ETH__GET_TRANSACTION_BY_BLOCK_HASH_AND_INDEX: 'eth_getTransactionByBlockHashAndIndex',
  ETH__GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX: 'eth_getTransactionByBlockNumberAndIndex',
  ETH__GET_TRANSACTION_BY_HASH: 'eth_getTransactionByHash',
  ETH__GET_TRANSACTION_COUNT: 'eth_getTransactionCount',
  ETH__GET_TRANSACTION_RECEIPT: 'eth_getTransactionReceipt',
  ETH__GET_UNCLEBY_BLOCK_HASH_AND_INDEX: 'eth_getUncleByBlockHashAndIndex',
  ETH__GET_UNCLEBY_BLOCK_NUMBER_AND_INDEX: 'eth_getUncleByBlockNumberAndIndex',
  ETH__GET_UNCLECOUNT_BY_BLOCK_HASH: 'eth_getUncleCountByBlockHash',
  ETH__GET_UNCLECOUNT_BY_BLOCK_NUMBER: 'eth_getUncleCountByBlockNumber',
  ETH__HASHRATE: 'eth_hashrate',
  ETH__NEW_BLOCK_FILTER: 'eth_newBlockFilter',
  ETH__NEW_FILTER: 'eth_newFilter',
  ETH__NEW_PENDING_TRANSACTION_FILTER: 'eth_newPendingTransactionFilter',
  ETH__SEND_RAW_TRANSACTION_: 'eth_sendRawTransaction',
  ETH__SUBMIT_HASHRATE: 'eth_submitHashrate',
  ETH__SUBMIT_WORK: 'eth_submitWork',
  ETH__SYNCING: 'eth_syncing',
  ETH__UNINSTALL_FILTER: 'eth_uninstallFilter',
  NET_LISTENING: 'net_listening',
  NET_PEERCOUNT: 'net_peerCount',
  NET_VERSION: 'net_version',
  PERSONAL_EC_RECOVER: 'personal_ecRecover',
  WALLET_WATCH_ASSET: 'wallet_watchAsset',
  WEB3_CLIENT_VERSION: 'web3_clientVersion',
  WEB3_SHA3: 'web3_sha3',
} as const;

export const ETHEREUM_METHOD_TYPE = {
  ...ETHEREUM_NO_POPUP_METHOD_TYPE,
  ...ETHEREUM_POPUP_METHOD_TYPE,
} as const;

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
  SWAP_APPROVAL: 'swapApproval',
  SIGN: 'sign',
  SIGN_TYPED_DATA: 'signTypedData',
  PERSONAL_SIGN: 'personalSign',
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
