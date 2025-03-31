import Long from 'long';
import type { KeplrMode } from '@keplr-wallet/types';

import type { SignAminoDoc } from '@/types/cosmos/amino';
import type {
  CosRequestAccountResponse,
  CosSendTransactionResponse,
  CosSignAminoResponse,
  CosSignDirectResponse,
  CosSignMessageResponse,
  CosSupportedChainIdsResponse,
  CosVerifyMessageResponse,
} from '@/types/message/inject/cosmos';

import { wrappedCosmosRequestApp } from './cosmostation';
import { toUint8Array } from '../utils';

const keplrEnable: KeplrInterface['enable'] = async (chainIds?: string[] | string) => {
  if (!chainIds) {
    throw new Error('chain id not set');
  }

  const inputChainIds = typeof chainIds === 'string' ? [chainIds] : chainIds;

  const response = (await wrappedCosmosRequestApp({ method: 'cos_supportedChainIds' })) as CosSupportedChainIdsResponse;

  const suppotedChainIds = [...response.official, ...response.unofficial];

  const invalidChainId = inputChainIds.find((chainId) => !suppotedChainIds.includes(chainId));

  if (invalidChainId) {
    throw new Error(`There is no chain info for ${invalidChainId}`);
  }

  await wrappedCosmosRequestApp({ method: 'cos_requestAccount', params: { chainName: inputChainIds[0] } });
};

const keplrGetKey: KeplrInterface['getKey'] = async (chainId) => {
  try {
    const account = (await wrappedCosmosRequestApp({
      method: 'cos_requestAccount',
      params: { chainName: chainId },
    })) as CosRequestAccountResponse;

    return {
      isNanoLedger: account.isLedger,
      algo: account.isEthermint ? 'ethsecp256k1' : 'secp256k1',
      pubKey: new Uint8Array(Buffer.from(account.publicKey, 'hex')),
      bech32Address: account.address,
      name: account.name,
      address: new Uint8Array(),
      isKeystone: false,
      ethereumHexAddress: '',
    };
  } catch (e) {
    throw new Error((e as { message?: string }).message || 'Unknown Error');
  }
};

const keplrExperimentalSuggestChain: KeplrInterface['experimentalSuggestChain'] = async (chainInfo) => {
  try {
    const supportedChainNames = (await wrappedCosmosRequestApp({ method: 'cos_supportedChainIds' })) as CosSupportedChainIdsResponse;
    if (![...supportedChainNames.official, ...supportedChainNames.unofficial].includes(chainInfo.chainId)) {
      await window.cosmostation.cosmos.request({
        method: 'cos_addChain',
        params: {
          chainId: chainInfo.chainId,
          addressPrefix: chainInfo.bech32Config?.bech32PrefixAccAddr,
          baseDenom: chainInfo.currencies[0].coinMinimalDenom,
          chainName: chainInfo.chainName || chainInfo.chainId,
          displayDenom: chainInfo.currencies[0].coinDenom,
          decimals: chainInfo.currencies[0].coinDecimals,
          restURL: chainInfo.rest,
          coinType: `${String(chainInfo.bip44.coinType)}'`,
          gasRate: chainInfo.feeCurrencies[0].gasPriceStep
            ? {
                tiny: String(chainInfo.feeCurrencies[0].gasPriceStep.low),
                low: String(chainInfo.feeCurrencies[0].gasPriceStep.average),
                average: String(chainInfo.feeCurrencies[0].gasPriceStep.high),
              }
            : undefined,
        },
      });
    }
  } catch (e) {
    throw new Error((e as { message?: string }).message || 'Unknown Error');
  }
};

const keplrSignAmino: KeplrInterface['signAmino'] = async (chainId, _, signDoc, signOptions) => {
  try {
    const response = (await wrappedCosmosRequestApp({
      method: 'cos_signAmino',
      params: {
        chainName: chainId,
        isEditFee: !(signOptions?.preferNoSetFee ?? window.cosmostation.providers.keplr.defaultOptions.sign?.preferNoSetFee),
        isEditMemo: !(signOptions?.preferNoSetMemo ?? window.cosmostation.providers.keplr.defaultOptions.sign?.preferNoSetMemo),
        isCheckBalance: !(signOptions?.disableBalanceCheck ?? window.cosmostation.providers.keplr.defaultOptions.sign?.disableBalanceCheck),
        doc: signDoc as unknown as SignAminoDoc,
      },
    })) as CosSignAminoResponse;

    return { signed: response.signed_doc, signature: { pub_key: response.pub_key, signature: response.signature } };
  } catch (e) {
    throw new Error((e as { message?: string }).message || 'Unknown Error');
  }
};

const keplrSignDirect: KeplrInterface['signDirect'] = async (chainId, _, signDoc, signOptions) => {
  const response = (await wrappedCosmosRequestApp({
    method: 'cos_signDirect',
    params: {
      chainName: chainId,
      doc: {
        account_number: String(signDoc.accountNumber),
        auth_info_bytes: signDoc.authInfoBytes!,
        body_bytes: signDoc.bodyBytes!,
        chain_id: signDoc.chainId!,
      },
      isEditFee: !(signOptions?.preferNoSetFee ?? window.cosmostation.providers.keplr.defaultOptions.sign?.preferNoSetFee),
      isEditMemo: !(signOptions?.preferNoSetMemo ?? window.cosmostation.providers.keplr.defaultOptions.sign?.preferNoSetMemo),
      isCheckBalance: !(signOptions?.disableBalanceCheck ?? window.cosmostation.providers.keplr.defaultOptions.sign?.disableBalanceCheck),
    },
  })) as CosSignDirectResponse;
  return {
    signed: {
      accountNumber: new Long(Number(response.signed_doc.account_number)),
      chainId: response.signed_doc.chain_id,
      authInfoBytes: toUint8Array(response.signed_doc.auth_info_bytes),
      bodyBytes: toUint8Array(response.signed_doc.body_bytes),
    },
    signature: { pub_key: response.pub_key, signature: response.signature },
  };
};

const keplrSignArbitrary: KeplrInterface['signArbitrary'] = async (chainId, signer, data) => {
  const message = typeof data === 'string' ? data : Buffer.from(data).toString('utf8');
  const response = (await wrappedCosmosRequestApp({ method: 'cos_signMessage', params: { chainName: chainId, signer, message } })) as CosSignMessageResponse;

  return response;
};

const keplrVerifyArbitrary: KeplrInterface['verifyArbitrary'] = async (chainId, signer, data, signature) => {
  const message = typeof data === 'string' ? data : Buffer.from(data).toString('utf8');
  const response = (await wrappedCosmosRequestApp({
    method: 'cos_verifyMessage',
    params: { chainName: chainId, signer, message, publicKey: signature.pub_key.value, signature: signature.signature },
  })) as CosVerifyMessageResponse;

  return response;
};

const keplrSendTx: KeplrInterface['sendTx'] = async (chainId, tx, mode) => {
  try {
    const txMode = (() => {
      if (mode === 'block') return 1;
      if (mode === 'sync') return 2;
      if (mode === 'async') return 3;
      return 0;
    })();

    const response = (await wrappedCosmosRequestApp({
      method: 'cos_sendTransaction',
      params: {
        chainName: chainId,
        mode: txMode,
        txBytes: Buffer.from(tx).toString('base64'),
      },
    })) as CosSendTransactionResponse;

    return Buffer.from(response.tx_response.txhash, 'hex');
  } catch (e) {
    throw new Error((e as { message?: string }).message || 'Unknown Error');
  }
};

const keplrGetOfflineSigner: KeplrInterface['getOfflineSigner'] = (chainId, signOptions) => ({
  signAmino: async (signerAddress, signDoc) => keplrSignAmino(chainId, signerAddress, signDoc, signOptions),
  signDirect: async (signerAddress, signDoc) => keplrSignDirect(chainId, signerAddress, signDoc, signOptions),
  getAccounts: async () => {
    const response = await keplrGetKey(chainId);

    return [{ address: response.bech32Address, pubkey: response.pubKey, algo: response.algo as 'secp256k1' }];
  },
  chainId,
});

const keplrGetOfflineSignerOnlyAmino: KeplrInterface['getOfflineSignerOnlyAmino'] = (chainId) => ({
  signAmino: async (signerAddress, signDoc) => keplrSignAmino(chainId, signerAddress, signDoc),
  getAccounts: async () => {
    const response = await keplrGetKey(chainId);

    return [{ address: response.bech32Address, pubkey: response.pubKey, algo: response.algo as 'secp256k1' }];
  },
  chainId,
});

const keplrGetOfflineSignerAuto: KeplrInterface['getOfflineSignerAuto'] = async (chainId) => {
  const account = (await wrappedCosmosRequestApp({
    method: 'cos_requestAccount',
    params: { chainName: chainId },
  })) as CosRequestAccountResponse;

  if (account.isLedger) {
    return keplrGetOfflineSignerOnlyAmino(chainId);
  }
  return keplrGetOfflineSigner(chainId);
};

const keplrSuggestToken: KeplrInterface['suggestToken'] = async (chainId, contractAddress) => {
  try {
    await wrappedCosmosRequestApp({
      method: 'cos_addTokensCW20',
      params: {
        chainName: chainId,
        tokens: [
          {
            contractAddress,
          },
        ],
      },
    });
  } catch (e) {
    throw new Error((e as { message?: string }).message || 'Unknown Error');
  }
};

export class CosmostationKeplr implements KeplrInterface {
  version = '0.0.0';
  mode = 'extension' as KeplrMode;
  defaultOptions = {
    sign: { disableBalanceCheck: false, preferNoSetFee: false, preferNoSetMemo: false },
  };

  private static instance: KeplrInterface;

  public static getInstance(): KeplrInterface {
    if (!CosmostationKeplr.instance) {
      CosmostationKeplr.instance = new CosmostationKeplr();
    }
    return CosmostationKeplr.instance;
  }
  enable = keplrEnable;
  getKey = keplrGetKey;
  experimentalSuggestChain = keplrExperimentalSuggestChain;
  getOfflineSigner = keplrGetOfflineSigner;
  getOfflineSignerAuto = keplrGetOfflineSignerAuto;
  getOfflineSignerOnlyAmino = keplrGetOfflineSignerOnlyAmino;
  sendTx = keplrSendTx;
  signAmino = keplrSignAmino;
  signDirect = keplrSignDirect;
  signArbitrary = keplrSignArbitrary;
  verifyArbitrary = keplrVerifyArbitrary;
  suggestToken = keplrSuggestToken;
}
