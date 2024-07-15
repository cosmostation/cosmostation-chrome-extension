import TinySecp256k1 from 'tiny-secp256k1';
import EthereumApp from '@ledgerhq/hw-app-eth';
import type Transport from '@ledgerhq/hw-transport';
import { TransportStatusError } from '@ledgerhq/hw-transport';
import type { MessageTypes } from '@metamask/eth-sig-util';
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';

import { LEDGER_TRANSPORT_STATUS_ERROR } from '~/constants/error';
import type { CosmosChain } from '~/types/chain';
import type { Msg, MsgTransfer, SignAminoDoc } from '~/types/cosmos/amino';
import type { EIP712StructuredData, RLPTypes } from '~/types/cosmos/ethermint';
import type { LedgerAccount } from '~/types/extensionStorage';
import type { CustomTypedMessage } from '~/types/message/ethereum';

import { getAddress } from './common';
import { isAminoCommission, isAminoIBCSend, isAminoReward, isAminoSend } from './cosmos';
import { isEthermintStyleChainId } from './regex';
import { isEqualsIgnoringCase } from './string';

export function constructEip712TypedData(chainId: string, tx: SignAminoDoc): EIP712StructuredData | undefined {
  const isInjectiveChain = chainId.startsWith('injective');

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

  if (isInjectiveChain) {
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
  const msgTypes = tx.msgs.map((msg) => msg.type);

  const isTypeIdentical = msgTypes.every((type) => type === msgTypes[0]);

  const msg = isTypeIdentical ? tx.msgs[0] : undefined;

  if (!msg) {
    return {};
  }

  if (isAminoSend(msg)) {
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
  if (isAminoIBCSend(msg)) {
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
          const transferMessages = tx.msgs as Msg<MsgTransfer>[];

          if (transferMessages.some((item) => item.value.memo)) {
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
  if (isAminoReward(msg)) {
    return {
      MsgValue: [
        { name: 'delegator_address', type: 'string' },
        { name: 'validator_address', type: 'string' },
      ],
    };
  }
  if (isAminoCommission(msg)) {
    return {
      MsgValue: [{ name: 'validator_address', type: 'string' }],
    };
  }

  return {};
}

export async function getEIP712Signature(
  transport: Transport,
  chain: CosmosChain,
  currentAccount: LedgerAccount,
  typedMessage: CustomTypedMessage<MessageTypes>,
) {
  try {
    const ethereumApp = new EthereumApp(transport);

    const path = `${chain.bip44.purpose}/${chain.bip44.coinType}/${chain.bip44.account}/${chain.bip44.change}/${currentAccount.bip44.addressIndex}`;

    const { publicKey } = await ethereumApp.getAddress(path);

    const compressedPublicKey = Buffer.from(TinySecp256k1.pointCompress(Buffer.from(publicKey, 'hex'), true));

    const accountAddress = currentAccount.ethermintPublicKey ? getAddress(chain, Buffer.from(currentAccount.ethermintPublicKey, 'hex')) : '';

    const ledgerAddress = getAddress(chain, compressedPublicKey);

    if (!isEqualsIgnoringCase(accountAddress, ledgerAddress)) {
      throw new Error('Account address and Ledger address are not the same.');
    }

    const domainSeparatorHex = TypedDataUtils.hashStruct('EIP712Domain', typedMessage.domain, typedMessage.types, SignTypedDataVersion.V4).toString('hex');

    const hashStructMessageHex = TypedDataUtils.hashStruct(
      typedMessage.primaryType,
      typedMessage.message,
      typedMessage.types,
      SignTypedDataVersion.V4,
    ).toString('hex');

    const result = await ethereumApp.signEIP712HashedMessage(path, domainSeparatorHex, hashStructMessageHex);

    const v = (result.v - 27).toString(16);

    const signature = `${result.r}${result.s}${v.length < 2 ? `0${v}` : v}`;

    return new Uint8Array(Buffer.from(signature, 'hex'));
  } catch (e) {
    if (e instanceof TransportStatusError) {
      const transportError = e as Error & { statusCode?: number };

      if (
        transportError?.statusCode === LEDGER_TRANSPORT_STATUS_ERROR.OPENED_WRONG_APP ||
        transportError?.statusCode === LEDGER_TRANSPORT_STATUS_ERROR.STILL_HOME_SCREEN
      ) {
        throw new Error('Please open the Ethereum application on your Ledger device and try again.');
      } else {
        throw e;
      }
    } else {
      throw e;
    }
  }
}

export function generateTimeoutTimestamp() {
  return ((Date.now() + 1000000) * 1000000).toString();
}
