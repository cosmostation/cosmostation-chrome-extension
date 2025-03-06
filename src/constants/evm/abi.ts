export const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
];

export const ERC721_ABI = [
  {
    constant: true,
    inputs: [
      {
        name: 'interfaceID',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '_name',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'getApproved',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_approved',
        type: 'address',
      },
      {
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_index',
        type: 'uint256',
      },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_index',
        type: 'uint256',
      },
    ],
    name: 'tokenByIndex',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'ownerOf',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '_symbol',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_operator',
        type: 'address',
      },
      {
        name: '_approved',
        type: 'bool',
      },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_tokenId',
        type: 'uint256',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_operator',
        type: 'address',
      },
    ],
    name: 'isApprovedForAll',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_from',
        type: 'address',
      },
      {
        indexed: true,
        name: '_to',
        type: 'address',
      },
      {
        indexed: true,
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_owner',
        type: 'address',
      },
      {
        indexed: true,
        name: '_approved',
        type: 'address',
      },
      {
        indexed: true,
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_owner',
        type: 'address',
      },
      {
        indexed: true,
        name: '_operator',
        type: 'address',
      },
      {
        indexed: false,
        name: '_approved',
        type: 'bool',
      },
    ],
    name: 'ApprovalForAll',
    type: 'event',
  },
];

export const ERC1155_ABI = [
  {
    inputs: [
      {
        internalType: 'string',
        name: 'uri_',
        type: 'string',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'ApprovalForAll',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'ids',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'values',
        type: 'uint256[]',
      },
    ],
    name: 'TransferBatch',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'TransferSingle',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'value',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'URI',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'accounts',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'ids',
        type: 'uint256[]',
      },
    ],
    name: 'balanceOfBatch',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'isApprovedForAll',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256[]',
        name: 'ids',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'safeBatchTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'uri',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export const ONE_INCH_ABI = [
  { inputs: [{ internalType: 'contract IWETH', name: 'weth', type: 'address' }], stateMutability: 'nonpayable', type: 'constructor' },
  { inputs: [], name: 'AccessDenied', type: 'error' },
  { inputs: [], name: 'AdvanceNonceFailed', type: 'error' },
  { inputs: [], name: 'AlreadyFilled', type: 'error' },
  { inputs: [], name: 'ArbitraryStaticCallFailed', type: 'error' },
  { inputs: [], name: 'BadPool', type: 'error' },
  { inputs: [], name: 'BadSignature', type: 'error' },
  { inputs: [], name: 'ETHTransferFailed', type: 'error' },
  { inputs: [], name: 'ETHTransferFailed', type: 'error' },
  { inputs: [], name: 'EmptyPools', type: 'error' },
  { inputs: [], name: 'EthDepositRejected', type: 'error' },
  { inputs: [], name: 'GetAmountCallFailed', type: 'error' },
  { inputs: [], name: 'IncorrectDataLength', type: 'error' },
  { inputs: [], name: 'InsufficientBalance', type: 'error' },
  { inputs: [], name: 'InvalidMsgValue', type: 'error' },
  { inputs: [], name: 'InvalidMsgValue', type: 'error' },
  { inputs: [], name: 'InvalidatedOrder', type: 'error' },
  { inputs: [], name: 'MakingAmountExceeded', type: 'error' },
  { inputs: [], name: 'MakingAmountTooLow', type: 'error' },
  { inputs: [], name: 'OnlyOneAmountShouldBeZero', type: 'error' },
  { inputs: [], name: 'OrderExpired', type: 'error' },
  { inputs: [], name: 'PermitLengthTooLow', type: 'error' },
  { inputs: [], name: 'PredicateIsNotTrue', type: 'error' },
  { inputs: [], name: 'PrivateOrder', type: 'error' },
  { inputs: [], name: 'RFQBadSignature', type: 'error' },
  { inputs: [], name: 'RFQPrivateOrder', type: 'error' },
  { inputs: [], name: 'RFQSwapWithZeroAmount', type: 'error' },
  { inputs: [], name: 'RFQZeroTargetIsForbidden', type: 'error' },
  { inputs: [], name: 'ReentrancyDetected', type: 'error' },
  { inputs: [], name: 'RemainingAmountIsZero', type: 'error' },
  { inputs: [], name: 'ReservesCallFailed', type: 'error' },
  { inputs: [], name: 'ReturnAmountIsNotEnough', type: 'error' },
  { inputs: [], name: 'SafePermitBadLength', type: 'error' },
  { inputs: [], name: 'SafeTransferFailed', type: 'error' },
  { inputs: [], name: 'SafeTransferFromFailed', type: 'error' },
  {
    inputs: [
      { internalType: 'bool', name: 'success', type: 'bool' },
      { internalType: 'bytes', name: 'res', type: 'bytes' },
    ],
    name: 'SimulationResults',
    type: 'error',
  },
  { inputs: [], name: 'SwapAmountTooLarge', type: 'error' },
  { inputs: [], name: 'SwapWithZeroAmount', type: 'error' },
  { inputs: [], name: 'TakingAmountExceeded', type: 'error' },
  { inputs: [], name: 'TakingAmountIncreased', type: 'error' },
  { inputs: [], name: 'TakingAmountTooHigh', type: 'error' },
  { inputs: [], name: 'TransferFromMakerToTakerFailed', type: 'error' },
  { inputs: [], name: 'TransferFromTakerToMakerFailed', type: 'error' },
  { inputs: [], name: 'UnknownOrder', type: 'error' },
  { inputs: [], name: 'WrongAmount', type: 'error' },
  { inputs: [], name: 'WrongGetter', type: 'error' },
  { inputs: [], name: 'ZeroAddress', type: 'error' },
  { inputs: [], name: 'ZeroMinReturn', type: 'error' },
  { inputs: [], name: 'ZeroReturnAmount', type: 'error' },
  { inputs: [], name: 'ZeroTargetIsForbidden', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'maker', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'newNonce', type: 'uint256' },
    ],
    name: 'NonceIncreased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'maker', type: 'address' },
      { indexed: false, internalType: 'bytes32', name: 'orderHash', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'remainingRaw', type: 'uint256' },
    ],
    name: 'OrderCanceled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'maker', type: 'address' },
      { indexed: false, internalType: 'bytes32', name: 'orderHash', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'remaining', type: 'uint256' },
    ],
    name: 'OrderFilled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bytes32', name: 'orderHash', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
    ],
    name: 'OrderFilledRFQ',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  { inputs: [{ internalType: 'uint8', name: 'amount', type: 'uint8' }], name: 'advanceNonce', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [
      { internalType: 'uint256', name: 'offsets', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'and',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'target', type: 'address' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'arbitraryStaticCall',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'salt', type: 'uint256' },
          { internalType: 'address', name: 'makerAsset', type: 'address' },
          { internalType: 'address', name: 'takerAsset', type: 'address' },
          { internalType: 'address', name: 'maker', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'allowedSender', type: 'address' },
          { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'takingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'offsets', type: 'uint256' },
          { internalType: 'bytes', name: 'interactions', type: 'bytes' },
        ],
        internalType: 'struct OrderLib.Order',
        name: 'order',
        type: 'tuple',
      },
    ],
    name: 'cancelOrder',
    outputs: [
      { internalType: 'uint256', name: 'orderRemaining', type: 'uint256' },
      { internalType: 'bytes32', name: 'orderHash', type: 'bytes32' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'orderInfo', type: 'uint256' }],
    name: 'cancelOrderRFQ',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'orderInfo', type: 'uint256' },
      { internalType: 'uint256', name: 'additionalMask', type: 'uint256' },
    ],
    name: 'cancelOrderRFQ',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'salt', type: 'uint256' },
          { internalType: 'address', name: 'makerAsset', type: 'address' },
          { internalType: 'address', name: 'takerAsset', type: 'address' },
          { internalType: 'address', name: 'maker', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'allowedSender', type: 'address' },
          { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'takingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'offsets', type: 'uint256' },
          { internalType: 'bytes', name: 'interactions', type: 'bytes' },
        ],
        internalType: 'struct OrderLib.Order',
        name: 'order',
        type: 'tuple',
      },
    ],
    name: 'checkPredicate',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IClipperExchangeInterface', name: 'clipperExchange', type: 'address' },
      { internalType: 'contract IERC20', name: 'srcToken', type: 'address' },
      { internalType: 'contract IERC20', name: 'dstToken', type: 'address' },
      { internalType: 'uint256', name: 'inputAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'outputAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'goodUntil', type: 'uint256' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 'vs', type: 'bytes32' },
    ],
    name: 'clipperSwap',
    outputs: [{ internalType: 'uint256', name: 'returnAmount', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IClipperExchangeInterface', name: 'clipperExchange', type: 'address' },
      { internalType: 'address payable', name: 'recipient', type: 'address' },
      { internalType: 'contract IERC20', name: 'srcToken', type: 'address' },
      { internalType: 'contract IERC20', name: 'dstToken', type: 'address' },
      { internalType: 'uint256', name: 'inputAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'outputAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'goodUntil', type: 'uint256' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 'vs', type: 'bytes32' },
    ],
    name: 'clipperSwapTo',
    outputs: [{ internalType: 'uint256', name: 'returnAmount', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IClipperExchangeInterface', name: 'clipperExchange', type: 'address' },
      { internalType: 'address payable', name: 'recipient', type: 'address' },
      { internalType: 'contract IERC20', name: 'srcToken', type: 'address' },
      { internalType: 'contract IERC20', name: 'dstToken', type: 'address' },
      { internalType: 'uint256', name: 'inputAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'outputAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'goodUntil', type: 'uint256' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 'vs', type: 'bytes32' },
      { internalType: 'bytes', name: 'permit', type: 'bytes' },
    ],
    name: 'clipperSwapToWithPermit',
    outputs: [{ internalType: 'uint256', name: 'returnAmount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { inputs: [], name: 'destroy', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'eq',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'salt', type: 'uint256' },
          { internalType: 'address', name: 'makerAsset', type: 'address' },
          { internalType: 'address', name: 'takerAsset', type: 'address' },
          { internalType: 'address', name: 'maker', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'allowedSender', type: 'address' },
          { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'takingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'offsets', type: 'uint256' },
          { internalType: 'bytes', name: 'interactions', type: 'bytes' },
        ],
        internalType: 'struct OrderLib.Order',
        name: 'order',
        type: 'tuple',
      },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
      { internalType: 'bytes', name: 'interaction', type: 'bytes' },
      { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'takingAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'skipPermitAndThresholdAmount', type: 'uint256' },
    ],
    name: 'fillOrder',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'info', type: 'uint256' },
          { internalType: 'address', name: 'makerAsset', type: 'address' },
          { internalType: 'address', name: 'takerAsset', type: 'address' },
          { internalType: 'address', name: 'maker', type: 'address' },
          { internalType: 'address', name: 'allowedSender', type: 'address' },
          { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'takingAmount', type: 'uint256' },
        ],
        internalType: 'struct OrderRFQLib.OrderRFQ',
        name: 'order',
        type: 'tuple',
      },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
      { internalType: 'uint256', name: 'flagsAndAmount', type: 'uint256' },
    ],
    name: 'fillOrderRFQ',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'info', type: 'uint256' },
          { internalType: 'address', name: 'makerAsset', type: 'address' },
          { internalType: 'address', name: 'takerAsset', type: 'address' },
          { internalType: 'address', name: 'maker', type: 'address' },
          { internalType: 'address', name: 'allowedSender', type: 'address' },
          { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'takingAmount', type: 'uint256' },
        ],
        internalType: 'struct OrderRFQLib.OrderRFQ',
        name: 'order',
        type: 'tuple',
      },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 'vs', type: 'bytes32' },
      { internalType: 'uint256', name: 'flagsAndAmount', type: 'uint256' },
    ],
    name: 'fillOrderRFQCompact',
    outputs: [
      { internalType: 'uint256', name: 'filledMakingAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'filledTakingAmount', type: 'uint256' },
      { internalType: 'bytes32', name: 'orderHash', type: 'bytes32' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'info', type: 'uint256' },
          { internalType: 'address', name: 'makerAsset', type: 'address' },
          { internalType: 'address', name: 'takerAsset', type: 'address' },
          { internalType: 'address', name: 'maker', type: 'address' },
          { internalType: 'address', name: 'allowedSender', type: 'address' },
          { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'takingAmount', type: 'uint256' },
        ],
        internalType: 'struct OrderRFQLib.OrderRFQ',
        name: 'order',
        type: 'tuple',
      },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
      { internalType: 'uint256', name: 'flagsAndAmount', type: 'uint256' },
      { internalType: 'address', name: 'target', type: 'address' },
    ],
    name: 'fillOrderRFQTo',
    outputs: [
      { internalType: 'uint256', name: 'filledMakingAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'filledTakingAmount', type: 'uint256' },
      { internalType: 'bytes32', name: 'orderHash', type: 'bytes32' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'info', type: 'uint256' },
          { internalType: 'address', name: 'makerAsset', type: 'address' },
          { internalType: 'address', name: 'takerAsset', type: 'address' },
          { internalType: 'address', name: 'maker', type: 'address' },
          { internalType: 'address', name: 'allowedSender', type: 'address' },
          { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'takingAmount', type: 'uint256' },
        ],
        internalType: 'struct OrderRFQLib.OrderRFQ',
        name: 'order',
        type: 'tuple',
      },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
      { internalType: 'uint256', name: 'flagsAndAmount', type: 'uint256' },
      { internalType: 'address', name: 'target', type: 'address' },
      { internalType: 'bytes', name: 'permit', type: 'bytes' },
    ],
    name: 'fillOrderRFQToWithPermit',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'salt', type: 'uint256' },
          { internalType: 'address', name: 'makerAsset', type: 'address' },
          { internalType: 'address', name: 'takerAsset', type: 'address' },
          { internalType: 'address', name: 'maker', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'allowedSender', type: 'address' },
          { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'takingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'offsets', type: 'uint256' },
          { internalType: 'bytes', name: 'interactions', type: 'bytes' },
        ],
        internalType: 'struct OrderLib.Order',
        name: 'order_',
        type: 'tuple',
      },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
      { internalType: 'bytes', name: 'interaction', type: 'bytes' },
      { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'takingAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'skipPermitAndThresholdAmount', type: 'uint256' },
      { internalType: 'address', name: 'target', type: 'address' },
    ],
    name: 'fillOrderTo',
    outputs: [
      { internalType: 'uint256', name: 'actualMakingAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'actualTakingAmount', type: 'uint256' },
      { internalType: 'bytes32', name: 'orderHash', type: 'bytes32' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'salt', type: 'uint256' },
          { internalType: 'address', name: 'makerAsset', type: 'address' },
          { internalType: 'address', name: 'takerAsset', type: 'address' },
          { internalType: 'address', name: 'maker', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'allowedSender', type: 'address' },
          { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'takingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'offsets', type: 'uint256' },
          { internalType: 'bytes', name: 'interactions', type: 'bytes' },
        ],
        internalType: 'struct OrderLib.Order',
        name: 'order',
        type: 'tuple',
      },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
      { internalType: 'bytes', name: 'interaction', type: 'bytes' },
      { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'takingAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'skipPermitAndThresholdAmount', type: 'uint256' },
      { internalType: 'address', name: 'target', type: 'address' },
      { internalType: 'bytes', name: 'permit', type: 'bytes' },
    ],
    name: 'fillOrderToWithPermit',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'gt',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'salt', type: 'uint256' },
          { internalType: 'address', name: 'makerAsset', type: 'address' },
          { internalType: 'address', name: 'takerAsset', type: 'address' },
          { internalType: 'address', name: 'maker', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'allowedSender', type: 'address' },
          { internalType: 'uint256', name: 'makingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'takingAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'offsets', type: 'uint256' },
          { internalType: 'bytes', name: 'interactions', type: 'bytes' },
        ],
        internalType: 'struct OrderLib.Order',
        name: 'order',
        type: 'tuple',
      },
    ],
    name: 'hashOrder',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [], name: 'increaseNonce', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [
      { internalType: 'address', name: 'maker', type: 'address' },
      { internalType: 'uint256', name: 'slot', type: 'uint256' },
    ],
    name: 'invalidatorForOrderRFQ',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'lt',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'nonce',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'makerAddress', type: 'address' },
      { internalType: 'uint256', name: 'makerNonce', type: 'uint256' },
    ],
    name: 'nonceEquals',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'offsets', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'or',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [], name: 'owner', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
  {
    inputs: [{ internalType: 'bytes32', name: 'orderHash', type: 'bytes32' }],
    name: 'remaining',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'orderHash', type: 'bytes32' }],
    name: 'remainingRaw',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32[]', name: 'orderHashes', type: 'bytes32[]' }],
    name: 'remainingsRaw',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [
      { internalType: 'contract IERC20', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'rescueFunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'target', type: 'address' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'simulate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IAggregationExecutor', name: 'executor', type: 'address' },
      {
        components: [
          { internalType: 'contract IERC20', name: 'srcToken', type: 'address' },
          { internalType: 'contract IERC20', name: 'dstToken', type: 'address' },
          { internalType: 'address payable', name: 'srcReceiver', type: 'address' },
          { internalType: 'address payable', name: 'dstReceiver', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'minReturnAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'flags', type: 'uint256' },
        ],
        internalType: 'struct GenericRouter.SwapDescription',
        name: 'desc',
        type: 'tuple',
      },
      { internalType: 'bytes', name: 'permit', type: 'bytes' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'swap',
    outputs: [
      { internalType: 'uint256', name: 'returnAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'spentAmount', type: 'uint256' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'time', type: 'uint256' }],
    name: 'timestampBelow',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'timeNonceAccount', type: 'uint256' }],
    name: 'timestampBelowAndNonceEquals',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'minReturn', type: 'uint256' },
      { internalType: 'uint256[]', name: 'pools', type: 'uint256[]' },
    ],
    name: 'uniswapV3Swap',
    outputs: [{ internalType: 'uint256', name: 'returnAmount', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'int256', name: 'amount0Delta', type: 'int256' },
      { internalType: 'int256', name: 'amount1Delta', type: 'int256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'uniswapV3SwapCallback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address payable', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'minReturn', type: 'uint256' },
      { internalType: 'uint256[]', name: 'pools', type: 'uint256[]' },
    ],
    name: 'uniswapV3SwapTo',
    outputs: [{ internalType: 'uint256', name: 'returnAmount', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address payable', name: 'recipient', type: 'address' },
      { internalType: 'contract IERC20', name: 'srcToken', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'minReturn', type: 'uint256' },
      { internalType: 'uint256[]', name: 'pools', type: 'uint256[]' },
      { internalType: 'bytes', name: 'permit', type: 'bytes' },
    ],
    name: 'uniswapV3SwapToWithPermit',
    outputs: [{ internalType: 'uint256', name: 'returnAmount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IERC20', name: 'srcToken', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'minReturn', type: 'uint256' },
      { internalType: 'uint256[]', name: 'pools', type: 'uint256[]' },
    ],
    name: 'unoswap',
    outputs: [{ internalType: 'uint256', name: 'returnAmount', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address payable', name: 'recipient', type: 'address' },
      { internalType: 'contract IERC20', name: 'srcToken', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'minReturn', type: 'uint256' },
      { internalType: 'uint256[]', name: 'pools', type: 'uint256[]' },
    ],
    name: 'unoswapTo',
    outputs: [{ internalType: 'uint256', name: 'returnAmount', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address payable', name: 'recipient', type: 'address' },
      { internalType: 'contract IERC20', name: 'srcToken', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'minReturn', type: 'uint256' },
      { internalType: 'uint256[]', name: 'pools', type: 'uint256[]' },
      { internalType: 'bytes', name: 'permit', type: 'bytes' },
    ],
    name: 'unoswapToWithPermit',
    outputs: [{ internalType: 'uint256', name: 'returnAmount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
];
