export const ETHEREUM_POPUP_METHOD_TYPE = {
  ETH__REQUEST_ACCOUNTS: 'eth_requestAccounts',
  ETH__SEND_TRANSACTION: 'eth_sendTransaction',
  ETH__SIGN: 'eth_sign',
  ETH__SIGN_TRANSACTION: 'eth_signTransaction',
  ETH__SIGN_TYPED_DATA_V3: 'eth_signTypedData_v3',
  ETH__SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',
  PERSONAL_SIGN: 'personal_sign',

  // https://eips.ethereum.org/EIPS/eip-3326
  WALLET__SWITCH_ETHEREUM_CHAIN: 'wallet_switchEthereumChain',

  // https://eips.ethereum.org/EIPS/eip-3085
  WALLET__ADD_ETHEREUM_CHAIN: 'wallet_addEthereumChain',

  // https://eips.ethereum.org/EIPS/eip-747
  WALLET__WATCH_ASSET: 'wallet_watchAsset',

  // lagacy
  WALLET__REQUEST_PERMISSIONS: 'wallet_requestPermissions',

  // custom
  ETHC__ADD_NETWORK: 'ethc_addNetwork',
  ETHC__SWITCH_NETWORK: 'ethc_switchNetwork',
  ETHC__ADD_TOKENS: 'ethc_addTokens',
} as const;

export const ETHEREUM_NO_POPUP_METHOD_TYPE = {
  ETH__ACCOUNTS: 'eth_accounts',
  ETH__COINBASE: 'eth_coinbase',
  ETH__BLOCK_NUMBER: 'eth_blockNumber',
  ETH__CALL: 'eth_call',
  ETH__CHAIN_ID: 'eth_chainId',
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
  NET__LISTENING: 'net_listening',
  NET__PEERCOUNT: 'net_peerCount',
  NET__VERSION: 'net_version',
  PERSONAL__EC_RECOVER: 'personal_ecRecover',
  WEB3__CLIENT_VERSION: 'web3_clientVersion',
  WEB3__SHA3: 'web3_sha3',

  // lagacy
  WALLET__GET_PERMISSIONS: 'wallet_getPermissions',
} as const;

export const ETHEREUM_METHOD_TYPE = {
  ...ETHEREUM_NO_POPUP_METHOD_TYPE,
  ...ETHEREUM_POPUP_METHOD_TYPE,
} as const;
