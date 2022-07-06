import { COSMOS_TYPE } from '~/constants/cosmos';
import { TOKEN_TYPE } from '~/constants/ethereum';
import Joi from '~/Popup/utils/joi';
import { ethereumAddressRegex } from '~/Popup/utils/regex';
import type { GasRate } from '~/types/chain';
import type { Fee, Msg, SignAminoDoc } from '~/types/cosmos/amino';
import type { Amount } from '~/types/cosmos/common';
import type { CosAddChainParams, CosSignAminoParams, CosSignDirectParams } from '~/types/cosmos/message';
import type { SignDirectDoc } from '~/types/cosmos/proto';
import type {
  CustomChain,
  EthcAddNetwork,
  EthcAddTokens,
  EthereumTxCommon,
  EthSignTransaction,
  WalletAddEthereumChain,
  WalletSwitchEthereumChainParam1,
  WalletWatchAsset,
} from '~/types/ethereum/message';

import { getChainIdRegex } from '../utils/common';

const numberRegex = /^([0-9]+|[0-9]+(\.[0-9]+))$/;

const cosmosType = Object.values(COSMOS_TYPE);

export const tenAddChainParamsSchema = (chainNames: string[], officialChainIds: string[], unofficialChainIds: string[]) => {
  const invalidChainNames = [...chainNames, ...officialChainIds, ...unofficialChainIds];

  return Joi.object<CosAddChainParams>({
    type: Joi.string()
      .valid(...cosmosType)
      .default(''),
    chainId: Joi.string()
      .lowercase()
      .invalid(...officialChainIds)
      .required(),
    chainName: Joi.string()
      .lowercase()
      .invalid(...invalidChainNames)
      .required(),
    restURL: Joi.string().required(),
    imageURL: Joi.string().optional(),
    baseDenom: Joi.string().required(),
    displayDenom: Joi.string().required(),
    decimals: Joi.number().optional(),
    coinType: Joi.string()
      .regex(/^[0-9]+$/)
      .optional(),
    addressPrefix: Joi.string().required(),
    coinGeckoId: Joi.string().optional(),
    gasRate: Joi.object<GasRate>({
      tiny: Joi.string()
        .required()
        .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/),
      low: Joi.string()
        .required()
        .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/),
      average: Joi.string()
        .required()
        .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/),
    }).optional(),
    sendGas: Joi.string()
      .regex(/^[0-9]+$/)
      .optional(),
  })
    .label('params')
    .required();
};

export const tenSignAminoParamsSchema = (chainNames: string[], chainId: string) => {
  const chainIdRegex = getChainIdRegex(chainId);

  return Joi.object<CosSignAminoParams>({
    chainName: Joi.string()
      .lowercase()
      .valid(...chainNames)
      .required(),
    doc: Joi.object<SignAminoDoc>({
      chain_id: Joi.string().trim().pattern(chainIdRegex).required(),
      sequence: Joi.string().required(),
      account_number: Joi.string().required(),
      fee: Joi.object<Fee>({
        amount: Joi.array()
          .items(Joi.object<Amount>({ amount: Joi.string().required(), denom: Joi.string().required() }))
          .required(),
        gas: Joi.string().required(),
      }),
      memo: Joi.string().allow(''),
      msgs: Joi.array().items(
        Joi.object<Msg>({
          type: Joi.string().required(),
          value: Joi.any(),
        }),
      ),
    }).required(),
    isEditFee: Joi.boolean().default(false),
    isEditMemo: Joi.boolean().default(false),
    gasRate: Joi.object<GasRate>({
      average: Joi.string().required().pattern(numberRegex),
      low: Joi.string().required().pattern(numberRegex),
      tiny: Joi.string().required().pattern(numberRegex),
    }).optional(),
  })
    .label('params')
    .required();
};

export const tenSignDirectParamsSchema = (chainNames: string[], chainId: string) => {
  const chainIdRegex = getChainIdRegex(chainId);

  return Joi.object<CosSignDirectParams>({
    chainName: Joi.string()
      .lowercase()
      .valid(...chainNames)
      .required(),
    doc: Joi.object<SignDirectDoc>({
      chain_id: Joi.string().trim().pattern(chainIdRegex).required(),
      account_number: Joi.string().required(),
      auth_info_bytes: Joi.string().hex().required(),
      body_bytes: Joi.string().hex().required(),
    }).required(),
    isEditFee: Joi.boolean().default(false),
    isEditMemo: Joi.boolean().default(false),
    gasRate: Joi.object<GasRate>({
      average: Joi.string().required().pattern(numberRegex),
      low: Joi.string().required().pattern(numberRegex),
      tiny: Joi.string().required().pattern(numberRegex),
    }).optional(),
  })
    .label('params')
    .required();
};

export const ethcAddNetworkParamsSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(
      Joi.object<EthcAddNetwork['params'][0]>({
        displayDenom: Joi.string().trim().required(),
        chainId: Joi.string().trim().required(),
        decimals: Joi.number().required(),
        networkName: Joi.string().trim().required(),
        rpcURL: Joi.string().trim().required(),
        imageURL: Joi.string().trim().optional(),
        explorerURL: Joi.string().trim().optional(),
        coinGeckoId: Joi.string().trim().optional(),
      }).required(),
    );

export const walletAddEthereumChainParamsSchema = () =>
  Joi.array()
    .label('params')
    .items(
      Joi.object<WalletAddEthereumChain['params'][0]>({
        chainId: Joi.string().label('chainId').trim().required(),
        chainName: Joi.string().label('chainName').trim().required(),
        rpcUrls: Joi.array().label('rpcUrls').items(Joi.string().required()).length(1).required(),
        blockExplorerUrls: Joi.array().label('blockExplorerUrls').items(Joi.string().required()).length(1).optional(),
        iconUrls: Joi.array().label('iconUrls').items(Joi.string().required()).length(1).optional(),
        nativeCurrency: Joi.object<WalletAddEthereumChain['params'][0]['nativeCurrency']>({
          name: Joi.string().required(),
          symbol: Joi.string().required(),
          decimals: Joi.number().required(),
        })
          .label('nativeCurrency')
          .required(),
        coinGeckoId: Joi.string().optional(),
      }).required(),
    )
    .length(1)
    .required();

export const ethcSwitchNetworkParamsSchema = (chainIds: string[]) =>
  Joi.array()
    .label('params')
    .required()
    .items(
      Joi.string()
        .label('chainId')
        .valid(...chainIds)
        .required(),
    );

export const walletSwitchEthereumChainParamsSchema = (chainIds: string[]) =>
  Joi.array()
    .label('params')
    .required()
    .items(
      Joi.object<WalletSwitchEthereumChainParam1>({
        chainId: Joi.string()
          .valid(...chainIds)
          .required(),
      }),
    );

export const ethSignParamsSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(Joi.string().label('address').pattern(ethereumAddressRegex).required(), Joi.string().label('dataToSign').required(), Joi.optional());

export const personalSignParamsSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(Joi.string().label('dataToSign').required(), Joi.string().label('address').pattern(ethereumAddressRegex).required(), Joi.optional());

export const ethSignTransactionParamsSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(
      Joi.object<EthSignTransaction['params'][0]>({
        from: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        to: Joi.string().optional(),
        nonce: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        chainId: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        data: Joi.string().optional(),
        maxFeePerGas: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        maxPriorityFeePerGas: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        value: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        gas: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        gasPrice: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        chain: Joi.string().optional(),
        hardfork: Joi.string().optional(),
        common: Joi.object<EthereumTxCommon>({
          customChain: Joi.object<CustomChain>({
            name: Joi.string().optional(),
            networkId: Joi.number().required(),
            chainId: Joi.number().required(),
          }).required(),
        }).optional(),
      }).required(),
    );

export const ethcAddTokensParamsSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(
      Joi.object<EthcAddTokens['params'][0]>({
        tokenType: Joi.string().valid(TOKEN_TYPE.ERC20),
        address: Joi.string().pattern(ethereumAddressRegex).required(),
        displayDenom: Joi.string().required(),
        decimals: Joi.number().required(),
        imageURL: Joi.string().optional(),
        coinGeckoId: Joi.string().optional(),
        name: Joi.string().optional(),
      }).required(),
    );

export const WalletWatchAssetParamsSchema = () =>
  Joi.object<WalletWatchAsset['params']>({
    type: Joi.string().valid(TOKEN_TYPE.ERC20),
    options: Joi.object<WalletWatchAsset['params']['options']>({
      address: Joi.string().pattern(ethereumAddressRegex).required(),
      decimals: Joi.number().required(),
      symbol: Joi.string().required(),
      image: Joi.string().optional(),
      coinGeckoId: Joi.string().optional(),
    }),
  }).required();

export const ethSignTypedDataParamsSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(Joi.string().label('address').pattern(ethereumAddressRegex).required(), Joi.string().label('dataToSign').required());
