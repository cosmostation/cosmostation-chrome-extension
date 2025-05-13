import type { CosmosRegisterWallet, CosmosRequestAccountsSettledResponse } from '@cosmostation/wallets';

import { COSMOSTATION_ENCODED_LOGO_IMAGE, COSMOSTATION_WALLET_NAME } from '@/constants/common';
import type { SignAminoDoc } from '@/types/cosmos/amino';
import type { SignDirectDoc } from '@/types/cosmos/direct';
import type {
  CosRequestAccountResponse,
  CosRequestAccountsSettledResponse,
  CosSendTransactionResponse,
  CosSignAminoResponse,
  CosSignDirectResponse,
  CosSignMessageResponse,
  CosSupportedChainIdsResponse,
  CosVerifyMessageResponse,
} from '@/types/message/inject/cosmos';

import { wrappedCosmosRequestApp } from './cosmostation';
import { toUint8Array } from '../utils';

export const cosmosWallet: CosmosRegisterWallet = {
  name: COSMOSTATION_WALLET_NAME,
  logo: COSMOSTATION_ENCODED_LOGO_IMAGE,
  methods: {
    connect: async (chainIds) => {
      const cIds = typeof chainIds === 'string' ? [chainIds] : chainIds;

      const response = (await wrappedCosmosRequestApp({ method: 'cos_supportedChainIds' })) as CosSupportedChainIdsResponse;

      if (!cIds.every((cId) => response.official.includes(cId) || response.unofficial.includes(cId))) {
        throw new Error('Unsupported chainId is exist');
      }

      await wrappedCosmosRequestApp({ method: 'cos_requestAccount', params: { chainName: cIds[0] } });
    },
    getAccount: async (chainID) => {
      try {
        const account = (await wrappedCosmosRequestApp({
          method: 'cos_requestAccount',
          params: { chainName: chainID },
        })) as CosRequestAccountResponse;

        return {
          name: account.name,
          is_ledger: !!account.isLedger,
          public_key: {
            type: account.isEthermint ? 'ethsecp256k1' : 'secp256k1',
            value: Buffer.from(account.publicKey).toString('base64'),
          },
          address: account.address,
        };
      } catch (e) {
        throw new Error((e as { message?: string }).message || 'Unknown Error');
      }
    },
    getAccountsSettled: async (chainIDs) => {
      try {
        const accounts = (await wrappedCosmosRequestApp({
          method: 'cos_requestAccountsSettled',
          params: { chainIds: chainIDs },
        })) as CosRequestAccountsSettledResponse;

        const result: CosmosRequestAccountsSettledResponse = accounts.map((account) => {
          if (account.status === 'fulfilled') {
            return {
              status: account.status,
              value: {
                name: account.value.name,
                is_ledger: !!account.value.isLedger,
                public_key: {
                  type: account.value.isEthermint ? 'ethsecp256k1' : 'secp256k1',
                  value: Buffer.from(account.value.publicKey).toString('base64'),
                },
                address: account.value.address,
                chain_id: account.value.chainId,
              },
            };
          }
          return account;
        });
        return result;
      } catch (e) {
        throw new Error((e as { message?: string }).message || 'Unknown Error');
      }
    },
    signAmino: async (chainID, document, options) => {
      try {
        const response = (await wrappedCosmosRequestApp({
          method: 'cos_signAmino',
          params: {
            chainName: chainID,
            doc: document as unknown as SignAminoDoc,
            isEditFee: options?.edit_mode?.fee,
            isEditMemo: options?.edit_mode?.memo,
            isCheckBalance: options?.is_check_balance,
          },
        })) as CosSignAminoResponse;

        return {
          signature: response.signature,
          signed_doc: response.signed_doc,
        };
      } catch (e) {
        throw new Error((e as { message?: string }).message || 'Unknown Error');
      }
    },
    signDirect: async (chainID, document, options) => {
      const body_bytes =
        typeof document.body_bytes === 'string' ? new Uint8Array(Buffer.from(document.body_bytes, 'hex')) : new Uint8Array(document.body_bytes);
      const auth_info_bytes =
        typeof document.auth_info_bytes === 'string' ? new Uint8Array(Buffer.from(document.auth_info_bytes, 'hex')) : new Uint8Array(document.auth_info_bytes);

      try {
        const response = (await wrappedCosmosRequestApp({
          method: 'cos_signDirect',
          params: {
            chainName: chainID,
            doc: { ...document, body_bytes, auth_info_bytes } as unknown as SignDirectDoc,
            isEditFee: options?.edit_mode?.fee,
            isEditMemo: options?.edit_mode?.memo,
            isCheckBalance: options?.is_check_balance,
          },
        })) as CosSignDirectResponse;

        return {
          signature: response.signature,
          signed_doc: {
            auth_info_bytes: toUint8Array(response.signed_doc.auth_info_bytes),
            body_bytes: toUint8Array(response.signed_doc.body_bytes),
          },
        };
      } catch (e) {
        throw new Error((e as { message?: string }).message || 'Unknown Error');
      }
    },
    sendTransaction: async (chainId, txBytes, mode) => {
      const txMode = mode ?? 2;
      const response = (await wrappedCosmosRequestApp({
        method: 'cos_sendTransaction',
        params: {
          chainName: chainId,
          mode: txMode,
          txBytes: txBytes && typeof txBytes === 'object' ? Buffer.from(txBytes).toString('base64') : txBytes,
        },
      })) as CosSendTransactionResponse;

      if (response?.tx_response?.code !== 0) {
        if (typeof response?.tx_response?.raw_log === 'string') {
          throw new Error(response.tx_response.raw_log);
        } else {
          throw new Error('Unknown Error');
        }
      }

      return response.tx_response.txhash;
    },
    getSupportedChainIds: async () => {
      const response = (await wrappedCosmosRequestApp({ method: 'cos_supportedChainIds' })) as CosSupportedChainIdsResponse;

      return [...response.official, ...response.unofficial];
    },
    signMessage: async (chainId, message, signer) => {
      const response = (await wrappedCosmosRequestApp({
        method: 'cos_signMessage',
        params: { chainName: chainId, signer, message },
      })) as CosSignMessageResponse;

      return { signature: response.signature };
    },
    verifyMessage: async (chainId, message, signer, signature, public_key) => {
      const response = (await wrappedCosmosRequestApp({
        method: 'cos_verifyMessage',
        params: { chainName: chainId, signer, message, publicKey: public_key, signature },
      })) as CosVerifyMessageResponse;

      return response;
    },
    disconnect: async () => {
      await wrappedCosmosRequestApp({ method: 'cos_disconnect', params: undefined });
    },
    addChain: async (chain) => {
      await wrappedCosmosRequestApp({
        method: 'cos_addChain',
        params: {
          addressPrefix: chain.address_prefix,
          baseDenom: chain.base_denom,
          chainId: chain.chain_id,
          chainName: chain.chain_name,
          coinType: chain.coin_type,
          decimals: chain.decimals,
          displayDenom: chain.display_denom,
          gasRate: chain.gas_rate,
          restURL: chain.lcd_url,
          coinGeckoId: chain.coingecko_id,
          cosmWasm: chain.cosmwasm,
          imageURL: chain.image_url,
          type: chain.type,
        },
      });
    },
  },
  events: {
    on: (type, listener) => {
      if (type === 'AccountChanged') {
        window.addEventListener('cosmostation_keystorechange', listener);
      }
    },
    off: (type, listener) => {
      if (type === 'AccountChanged') {
        window.removeEventListener('cosmostation_keystorechange', listener);
      }
    },
  },
};
