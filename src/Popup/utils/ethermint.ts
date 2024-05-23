import type { MsgTransfer, SignAminoDoc } from '~/types/cosmos/amino';
import type { EIP712StructuredData, RLPTypes } from '~/types/cosmos/ethermint';

import { isEthermintStyleChainId } from './regex';

export function constructEip712TypedData(chainId: string, tx: SignAminoDoc): EIP712StructuredData | undefined {
  const chainIsInjective = chainId.startsWith('injective');

  const ethChainId = getEVMChainId(chainId);

  if (!ethChainId) {
    return undefined;
  }

  const types = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'string' },
        { name: 'salt', type: 'string' },
      ],
      Tx: [
        { name: 'account_number', type: 'string' },
        { name: 'chain_id', type: 'string' },
        { name: 'fee', type: 'Fee' },
        { name: 'memo', type: 'string' },
        { name: 'msgs', type: 'Msg[]' },
        { name: 'sequence', type: 'string' },
      ],
      Fee: [
        { name: 'feePayer', type: 'string' },
        { name: 'amount', type: 'Coin[]' },
        { name: 'gas', type: 'string' },
      ],
      Coin: [
        { name: 'denom', type: 'string' },
        { name: 'amount', type: 'string' },
      ],
      Msg: [
        { name: 'type', type: 'string' },
        { name: 'value', type: 'MsgValue' },
      ],
      ...getRLPType(tx),
    },
    domain: {
      name: 'Cosmos Web3',
      version: '1.0.0',
      chainId: ethChainId.toString(),
      verifyingContract: 'cosmos',
      salt: '0',
    },
    primaryType: 'Tx',
  };

  if (chainIsInjective) {
    types.types.Tx = [...types.types.Tx, { name: 'timeout_height', type: 'string' }];
    types.domain.name = 'Injective Web3';
    types.domain.chainId = `0x${ethChainId.toString(16)}`;
    types.types.Fee = [
      { name: 'amount', type: 'Coin[]' },
      { name: 'gas', type: 'string' },
    ];

    return types;
  }

  return types;
}

export function getEVMChainId(chainId: string) {
  if (chainId.startsWith('injective')) {
    const injectiveTestnetChainIds = ['injective-777', 'injective-888'];

    if (injectiveTestnetChainIds.includes(chainId)) {
      return 5;
    }

    return 1;
  }

  const chainIdMatches = isEthermintStyleChainId.exec(chainId) || [];

  if (
    !chainIdMatches ||
    chainIdMatches.length !== 4 ||
    chainIdMatches[1] === '' ||
    Number.isNaN(parseFloat(chainIdMatches[2])) ||
    !Number.isInteger(parseFloat(chainIdMatches[2]))
  ) {
    return undefined;
  }

  return parseInt(chainIdMatches[2], 10);
}

export function getRLPType(tx: SignAminoDoc): RLPTypes {
  const { type } = tx.msgs[0];

  if (type === 'cosmos-sdk/MsgSend') {
    return {
      MsgValue: [
        { name: 'from_address', type: 'string' },
        { name: 'to_address', type: 'string' },
        { name: 'amount', type: 'TypeAmount[]' },
      ],
      TypeAmount: [
        { name: 'denom', type: 'string' },
        { name: 'amount', type: 'string' },
      ],
    };
  }
  if (type === 'cosmos-sdk/MsgTransfer') {
    return {
      MsgValue: [
        { name: 'source_port', type: 'string' },
        { name: 'source_channel', type: 'string' },
        { name: 'token', type: 'TypeToken' },
        { name: 'sender', type: 'string' },
        { name: 'receiver', type: 'string' },
        { name: 'timeout_height', type: 'TypeTimeoutHeight' },
        { name: 'timeout_timestamp', type: 'uint64' },
        ...(() => {
          const transferMessage = type === 'cosmos-sdk/MsgTransfer' ? (tx as SignAminoDoc<MsgTransfer>) : undefined;

          if (transferMessage?.msgs.some((msg) => msg.value.memo)) {
            return [
              {
                name: 'memo',
                type: 'string',
              },
            ];
          }

          return [];
        })(),
      ],
      TypeToken: [
        { name: 'denom', type: 'string' },
        { name: 'amount', type: 'string' },
      ],
      TypeTimeoutHeight: [
        { name: 'revision_number', type: 'uint64' },
        { name: 'revision_height', type: 'uint64' },
      ],
    };
  }
  if (type === 'cosmos-sdk/MsgDelegate') {
    return {
      MsgValue: [
        { name: 'delegator_address', type: 'string' },
        { name: 'validator_address', type: 'string' },
        { name: 'amount', type: 'TypeAmount' },
      ],
      TypeAmount: [
        { name: 'denom', type: 'string' },
        { name: 'amount', type: 'string' },
      ],
    };
  }
  if (type === 'cosmos-sdk/MsgUndelegate') {
    return {
      MsgValue: [
        { name: 'delegator_address', type: 'string' },
        { name: 'validator_address', type: 'string' },
        { name: 'amount', type: 'TypeAmount' },
      ],
      TypeAmount: [
        { name: 'denom', type: 'string' },
        { name: 'amount', type: 'string' },
      ],
    };
  }
  if (type === 'cosmos-sdk/MsgBeginRedelegate') {
    return {
      MsgValue: [
        { name: 'delegator_address', type: 'string' },
        { name: 'validator_src_address', type: 'string' },
        { name: 'validator_dst_address', type: 'string' },
        { name: 'amount', type: 'TypeAmount' },
      ],
      TypeAmount: [
        { name: 'denom', type: 'string' },
        { name: 'amount', type: 'string' },
      ],
    };
  }
  if (type === 'cosmos-sdk/MsgWithdrawDelegatorReward') {
    return {
      MsgValue: [
        { name: 'delegator_address', type: 'string' },
        { name: 'validator_address', type: 'string' },
      ],
    };
  }
  if (type === 'cosmos-sdk/MsgWithdrawValidatorCommission') {
    return {
      MsgValue: [{ name: 'validator_address', type: 'string' }],
    };
  }

  return {};
}
