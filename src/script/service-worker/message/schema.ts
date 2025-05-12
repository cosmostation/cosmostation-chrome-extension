import { COSMOS_TYPE } from '@/constants/cosmos';
import { TOKEN_TYPE } from '@/constants/evm/token';
import { PERMISSION as IOTA_PERMISSION } from '@/constants/iota';
import { PERMISSION } from '@/constants/sui';
import type { CosmosChain } from '@/types/chain';
import type { Fee, Msg, SignAminoDoc } from '@/types/cosmos/amino';
import type { Amount } from '@/types/cosmos/common';
import type { SignDirectDoc } from '@/types/cosmos/direct';
import type { AddChainGasRate } from '@/types/fee';
import type { AptosSignMessage, AptosSignTransaction } from '@/types/message/inject/aptos';
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
import type {
  EthcAddNetwork,
  EthcAddTokens,
  EthSignTransaction,
  WalletAddEthereumChain,
  WalletSwitchEthereumChain,
  WalletWatchAsset,
} from '@/types/message/inject/evm';
import type { IotaSignPersonalMessageInput } from '@/types/message/inject/iota';
import type { SuiSignMessageInput } from '@/types/message/inject/sui';
import Joi from '@/utils/joi';
import { ethereumAddressRegex, getCosmosAddressRegex, suiAddressRegex } from '@/utils/regex';

const cosmosType = Object.values(COSMOS_TYPE);
const suiPermissionType = Object.values(PERMISSION);
const iotaPermissionType = Object.values(IOTA_PERMISSION);

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

export const ethSignParamsSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(Joi.string().label('address').pattern(ethereumAddressRegex).required(), Joi.string().label('dataToSign').required(), Joi.optional());

export const personalSignParamsSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(Joi.string().label('dataToSign').required(), Joi.optional(), Joi.string().label('address').pattern(ethereumAddressRegex).required());

export const ethSignTransactionParamsSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(
      Joi.object<EthSignTransaction['params'][0]>({
        from: Joi.string().optional(),
        to: Joi.string().optional(),
        nonce: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        data: Joi.string().optional(),
        maxFeePerGas: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        maxPriorityFeePerGas: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        value: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        gas: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        gasPrice: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        r: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        s: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        v: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
      })
        .unknown()
        .required(),
    );

export const ethcAddTokensParamsSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(
      Joi.object<EthcAddTokens['params'][0]>({
        type: Joi.string().valid('erc20'),
        chainType: Joi.string().valid('evm'),
        name: Joi.string().optional(),
        symbol: Joi.string().required(),
        decimals: Joi.number().required(),
        image: Joi.string().optional(),
        id: Joi.string().pattern(ethereumAddressRegex).required(),
        coinGeckoId: Joi.string().optional(),
      }).required(),
    );

export const walletAddEthereumChainParamsSchema = () =>
  Joi.array()
    .label('params')
    .items(
      Joi.object<WalletAddEthereumChain['params'][0]>({
        chainId: Joi.string().label('chainId').trim().required(),
        chainName: Joi.string().label('chainName').trim().required(),
        rpcUrls: Joi.array().label('rpcUrls').items(Joi.string().required()).required(),
        blockExplorerUrls: Joi.array().label('blockExplorerUrls').items(Joi.string().allow('').optional()).optional(),
        iconUrls: Joi.array().label('iconUrls').items(Joi.string().allow('').optional()).optional(),
        nativeCurrency: Joi.object<WalletAddEthereumChain['params'][0]['nativeCurrency']>({
          name: Joi.string().required(),
          symbol: Joi.string().required(),
          decimals: Joi.number().required(),
        })
          .label('nativeCurrency')
          .unknown(true)
          .required(),
        coinGeckoId: Joi.string().optional(),
      }).required(),
      Joi.optional(),
    )
    .required();

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
        tokenImageURL: Joi.string().trim().optional(),
        imageURL: Joi.string().trim().optional(),
        explorerURL: Joi.string().trim().optional(),
        coinGeckoId: Joi.string().trim().optional(),
      }).required(),
    );

export const WalletWatchAssetParamsSchema = () =>
  Joi.object<WalletWatchAsset['params']>({
    type: Joi.string().valid(TOKEN_TYPE.ERC20),
    options: Joi.object<WalletWatchAsset['params']['options']>({
      address: Joi.string().pattern(ethereumAddressRegex).required(),
      decimals: Joi.number().required(),
      symbol: Joi.string().required(),
      image: Joi.string().empty('').optional(),
      coinGeckoId: Joi.string().empty('').optional(),
    }),
  }).required();

export const ethSignTypedDataParamsSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(Joi.string().label('address').pattern(ethereumAddressRegex).required(), Joi.string().label('dataToSign').required());

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
      Joi.object<WalletSwitchEthereumChain['params'][0]>({
        chainId: Joi.string()
          .valid(...chainIds)
          .required(),
      }),
    );

export const suiConnectSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(
      Joi.string()
        .valid(...suiPermissionType)
        .required(),
    );

export const suiSignMessageSchema = () =>
  Joi.object<SuiSignMessageInput>({
    message: Joi.string().base64(),
    accountAddress: Joi.string().pattern(suiAddressRegex).optional(),
  }).required();

export const suiExecuteSerializedMoveCallSchema = () => Joi.array().label('params').min(1).max(1).required().items(Joi.string().base64());

export const iotaConnectSchema = () =>
  Joi.array()
    .label('params')
    .required()
    .items(
      Joi.string()
        .valid(...iotaPermissionType)
        .required(),
    );

export const iotaSignMessageSchema = () =>
  Joi.object<IotaSignPersonalMessageInput>({
    message: Joi.string().base64(),
    accountAddress: Joi.string().pattern(suiAddressRegex).optional(),
  }).required();

export const iotaExecuteSerializedMoveCallSchema = () => Joi.array().label('params').min(1).max(1).required().items(Joi.string().base64());

export const aptosSignTransactionSchema = () =>
  Joi.object<AptosSignTransaction['params']>({
    serializedTxHex: Joi.string().required(),
    asFeePayer: Joi.boolean().optional(),
  }).required();

export const aptosSignMessageSchema = () =>
  Joi.object<AptosSignMessage['params']>({
    address: Joi.boolean().optional(),
    application: Joi.boolean().optional(),
    chainId: Joi.boolean().optional(),
    message: Joi.string().required(),
    nonce: Joi.number().required(),
  }).required();
