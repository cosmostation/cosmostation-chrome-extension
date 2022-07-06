export const RPC_ERROR = {
  INVALID_INPUT: -32000,
  RESOURCE_NOT_FOUND: -32001,
  RESOURCE_UNAVAILABLE: -32002,
  TRANSACTION_REJECTED: -32003,
  METHOD_NOT_SUPPORTED: -32004,
  LIMIT_EXCEEDED: -32005,
  PARSE: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL: -32603,

  USER_REJECTED_REQUEST: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
} as const;

export const RPC_ERROR_MESSAGE = {
  [RPC_ERROR.PARSE]: 'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
  [RPC_ERROR.INVALID_REQUEST]: 'The JSON sent is not a valid Request object.',
  [RPC_ERROR.METHOD_NOT_FOUND]: 'The method does not exist / is not available.',
  [RPC_ERROR.INVALID_PARAMS]: 'Invalid method parameter(s).',
  [RPC_ERROR.INTERNAL]: 'Internal JSON-RPC error.',
  [RPC_ERROR.INVALID_INPUT]: 'Invalid input.',
  [RPC_ERROR.RESOURCE_NOT_FOUND]: 'Resource not found.',
  [RPC_ERROR.RESOURCE_UNAVAILABLE]: 'Resource unavailable.',
  [RPC_ERROR.TRANSACTION_REJECTED]: 'Transaction rejected.',
  [RPC_ERROR.METHOD_NOT_SUPPORTED]: 'Method not supported.',
  [RPC_ERROR.LIMIT_EXCEEDED]: 'Request limit exceeded.',

  [RPC_ERROR.USER_REJECTED_REQUEST]: 'User rejected the request.',
};

export const ETHEREUM_RPC_ERROR_MESSAGE = {
  [RPC_ERROR.UNAUTHORIZED]: 'The requested account and/or method has not been authorized by the user.',
  [RPC_ERROR.UNSUPPORTED_METHOD]: 'The requested method is not supported',
  [RPC_ERROR.DISCONNECTED]: 'The provider is disconnected from all chains.',
  [RPC_ERROR.CHAIN_DISCONNECTED]: 'The provider is disconnected from the specified chain.',
} as const;

export const COSMOS_RPC_ERROR_MESSAGE = {
  [RPC_ERROR.UNAUTHORIZED]: 'The requested account and/or method has not been authorized by the user.',
  [RPC_ERROR.UNSUPPORTED_METHOD]: 'The requested method is not supported by this Ethereum provider.',
  [RPC_ERROR.DISCONNECTED]: 'The provider is disconnected from all chains.',
  [RPC_ERROR.CHAIN_DISCONNECTED]: 'The provider is disconnected from the specified chain.',
} as const;
