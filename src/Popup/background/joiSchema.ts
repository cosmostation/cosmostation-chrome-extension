import { TENDERMINT_TYPE } from '~/constants/tendermint';
import Joi from '~/Popup/utils/joi';
import type { GasRate } from '~/types/chain';
import type { CustomChain, EthcAddNetwork, EthereumTxCommon, EthSignTransaction } from '~/types/ethereum/message';
import type { Fee, Msg, SignAminoDoc } from '~/types/tendermint/amino';
import type { Amount } from '~/types/tendermint/common';
import type { TenAddChainParams, TenSignAminoParams, TenSignDirectParams } from '~/types/tendermint/message';
import type { SignDirectDoc } from '~/types/tendermint/proto';

import { getChainIdRegex } from '../utils/common';

const numberRegex = /^([0-9]+|[0-9]+(\.[0-9]+))$/;
const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

const tendermintType = Object.values(TENDERMINT_TYPE);

export const tenAddChainParamsSchema = (chainNames: string[], officialChainIds: string[], unofficialChainIds: string[]) => {
  const invalidChainNames = [...chainNames, ...officialChainIds, ...unofficialChainIds];

  return Joi.object<TenAddChainParams>({
    type: Joi.string()
      .valid(...tendermintType)
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

  return Joi.object<TenSignAminoParams>({
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

  return Joi.object<TenSignDirectParams>({
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

export const ethSignParamsSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(Joi.string().label('address').pattern(ethereumAddressRegex).required(), Joi.string().label('dataToSign').required());

export const personalSignParamsSchema = ethSignParamsSchema;

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
