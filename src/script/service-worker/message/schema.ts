import { COSMOS_TYPE } from '@/constants/cosmos';
import type { CosmosChain } from '@/types/chain';
import type { Fee, Msg, SignAminoDoc } from '@/types/cosmos/amino';
import type { Amount } from '@/types/cosmos/common';
import type { SignDirectDoc } from '@/types/cosmos/direct';
import type { AddChainGasRate } from '@/types/fee';
import type {
  CosAddNFTsCW721,
  CosAddTokensCW20,
  CosGetBalanceCW20,
  CosGetTokenInfoCW20,
  CosRequestAddChain,
  CosSendTransaction,
  CosSignAmino,
  CosSignDirect,
  CosSignMessage,
  CosVerifyMessage,
} from '@/types/message/inject/cosmos';
import Joi from '@/utils/joi';
import { getCosmosAddressRegex } from '@/utils/regex';

const cosmosType = Object.values(COSMOS_TYPE);

function getChainIdRegex(chainId: string) {
  const splitedChainId = chainId.split('-');
  const prefixChainId = splitedChainId[0] ?? '';
  const chainIdRegex = new RegExp(`^${prefixChainId || ''}(.*)$`);

  return chainIdRegex;
}

export const cosAddChainParamsSchema = (chainNames: string[], officialChainIds: string[], unofficialChainIds: string[]) => {
  const invalidChainNames = [...chainNames, ...officialChainIds, ...unofficialChainIds];

  return Joi.object<CosRequestAddChain['params']>({
    type: Joi.string()
      .valid(...cosmosType)
      .default(''),
    chainId: Joi.string()
      .lowercase()
      .invalid(...officialChainIds)
      .required(),
    chainName: Joi.string()
      .invalid(...invalidChainNames)
      .insensitive()
      .required(),
    restURL: Joi.string().required(),
    tokenImageURL: Joi.string().empty('').optional(),
    imageURL: Joi.string().empty('').optional(),
    baseDenom: Joi.string().required(),
    displayDenom: Joi.string().required(),
    decimals: Joi.number().optional(),
    coinType: Joi.string()
      .regex(/^[0-9]+'?$/)
      .optional(),
    addressPrefix: Joi.string().required(),
    coinGeckoId: Joi.string().optional(),
    gasRate: Joi.object<AddChainGasRate>({
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
    cosmWasm: Joi.boolean().optional(),
  })
    .label('params')
    .required();
};

export const cosSignAminoParamsSchema = (chainNames: string[], chainId: string) => {
  const chainIdRegex = getChainIdRegex(chainId);

  return Joi.object<CosSignAmino['params']>({
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
          .optional(),
        gas: Joi.string().required(),
        payer: Joi.string().optional(),
        granter: Joi.string().optional(),
      }),
      memo: Joi.string().allow(''),
      msgs: Joi.array().items(
        Joi.object<Msg>({
          type: Joi.string().required(),
          value: Joi.any(),
        }),
      ),
      timeout_height: Joi.string().optional(),
    }).required(),
    isEditFee: Joi.boolean().default(true),
    isEditMemo: Joi.boolean().default(false),
    isCheckBalance: Joi.boolean().default(true),
  })
    .label('params')
    .required();
};

export const cosSignMessageParamsSchema = (chainNames: string[]) =>
  Joi.object<CosSignMessage['params']>({
    chainName: Joi.string()
      .lowercase()
      .valid(...chainNames)
      .required(),
    message: Joi.string().required(),
    signer: Joi.string().required(),
  })
    .label('params')
    .required();

export const cosVerifyMessageParamsSchema = (chainNames: string[]) =>
  Joi.object<CosVerifyMessage['params']>({
    chainName: Joi.string()
      .lowercase()
      .valid(...chainNames)
      .required(),
    message: Joi.string().required(),
    signer: Joi.string().required(),
    publicKey: Joi.string().required(),
    signature: Joi.string().required(),
  })
    .label('params')
    .required();

export const cosSignDirectParamsSchema = (chainNames: string[], chainId: string) => {
  const chainIdRegex = getChainIdRegex(chainId);

  return Joi.object<CosSignDirect['params']>({
    chainName: Joi.string()
      .lowercase()
      .valid(...chainNames)
      .required(),
    doc: Joi.object<SignDirectDoc>({
      chain_id: Joi.string().trim().pattern(chainIdRegex).required(),
      account_number: Joi.string().required(),
      auth_info_bytes: Joi.array().items(Joi.number()).required(),
      body_bytes: Joi.array().items(Joi.number()).required(),
    }).required(),
    isEditFee: Joi.boolean().default(true),
    isEditMemo: Joi.boolean().default(false),
    isCheckBalance: Joi.boolean().default(true),
  })
    .label('params')
    .required();
};

export const cosSendTransactionParamsSchema = (chainNames: string[]) =>
  Joi.object<CosSendTransaction['params']>({
    chainName: Joi.string()
      .lowercase()
      .valid(...chainNames)
      .required(),
    txBytes: Joi.string().base64().required(),
    mode: Joi.number().required(),
  })
    .label('params')
    .required();

export const cosGetBalanceCW20ParamsSchema = (chainNames: string[], chain: CosmosChain) => {
  const regex = getCosmosAddressRegex(chain.accountPrefix, [39, 59]);

  return Joi.object<CosGetBalanceCW20['params']>({
    chainName: Joi.string()
      .lowercase()
      .valid(...chainNames)
      .required(),
    contractAddress: Joi.string().pattern(regex).required(),
    address: Joi.string().pattern(regex).required(),
  })
    .label('params')
    .required();
};

export const cosGetTokenInfoCW20ParamsSchema = (chainNames: string[], chain: CosmosChain) => {
  const contractAddressRegex = getCosmosAddressRegex(chain.accountPrefix, [39, 59]);

  return Joi.object<CosGetTokenInfoCW20['params']>({
    chainName: Joi.string()
      .lowercase()
      .valid(...chainNames)
      .required(),
    contractAddress: Joi.string().pattern(contractAddressRegex).required(),
  })
    .label('params')
    .required();
};

export const cosAddTokensCW20ParamsSchema = (chainNames: string[], chain: CosmosChain) => {
  const contractAddressRegex = getCosmosAddressRegex(chain.accountPrefix, [39, 59]);

  return Joi.object<CosAddTokensCW20['params']>({
    chainName: Joi.string()
      .lowercase()
      .valid(...chainNames)
      .required(),
    tokens: Joi.array()
      .items(
        Joi.object<CosAddTokensCW20['params']['tokens'][0]>({
          contractAddress: Joi.string().pattern(contractAddressRegex).required(),
          coinGeckoId: Joi.string().empty('').optional(),
          imageURL: Joi.string().empty('').optional(),
        }),
      )
      .required(),
  })
    .label('params')
    .required();
};

export const cosAddNFTsCW721ParamsSchema = (chainNames: string[], chain: CosmosChain) => {
  const contractAddressRegex = getCosmosAddressRegex(chain.accountPrefix, [39, 59]);

  return Joi.object<CosAddNFTsCW721['params']>({
    chainName: Joi.string()
      .lowercase()
      .valid(...chainNames)
      .required(),
    nfts: Joi.array()
      .items(
        Joi.object<CosAddNFTsCW721['params']['nfts'][0]>({
          contractAddress: Joi.string().pattern(contractAddressRegex).required(),
          tokenId: Joi.string().optional(),
        }),
      )
      .required(),
  })
    .label('params')
    .required();
};
