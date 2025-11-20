import { APTOS_COIN_TYPE } from '@/constants/aptos/coin';
import { UNSUPPORT_STAKE_CHAIN_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { IOTA_COIN_TYPE } from '@/constants/iota';
import { SUI_COIN_TYPE } from '@/constants/sui';
import type { V11Param } from '@/types/apiV11';
import type { SupportedV11Param } from '@/types/apiV11';
import type { AptosChain, BitcoinChain, ChainExplorer, CosmosChain, EvmChain, GnoChain, IotaChain, SolanaChain, SuiChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import { isTestnetChain } from '@/utils/chain';
import { parsingHdPath, removeTrailingSlash } from '@/utils/string';

function collectDefaultDenoms(
  p: { gas_asset_denom?: string; staking_asset_denom?: string; main_asset_denom?: string },
  config?: {
    isEvm?: boolean;
  },
): string[] {
  return [
    ...new Set(
      [p.gas_asset_denom, p.staking_asset_denom, p.main_asset_denom, config?.isEvm ? NATIVE_EVM_COIN_ADDRESS : null].filter((denom): denom is string =>
        Boolean(denom),
      ),
    ),
  ];
}

type ChainInfo = V11Param & { id: string };

const createExplorer = (explorerData?: { name: string; url: string; account: string; tx: string; proposal: string }): ChainExplorer => {
  if (!explorerData) {
    return {
      name: '',
      url: '',
      account: '',
      tx: '',
      proposal: '',
    };
  }

  return Object.entries(explorerData).reduce((acc, [key, value]) => {
    acc[key as keyof ChainExplorer] = key === 'name' ? value : removeTrailingSlash(value as string);
    return acc;
  }, {} as ChainExplorer);
};

const createAccountTypes = (
  accountTypeData?: {
    hd_path: string;
    pubkey_style: string;
    pubkey_type?: string;
    is_default?: boolean;
  }[],
) => {
  return (
    accountTypeData?.map((accountType) => ({
      hdPath: accountType.hd_path.replace('X', '${index}'),
      pubkeyStyle: accountType.pubkey_style,
      pubkeyType: accountType.pubkey_type ?? null,
      isDefault: accountType.is_default ?? null,
    })) ?? []
  );
};

const mapCosmosChain = (chain: ChainInfo): CosmosChain => {
  const { id, params } = chain;
  const chainParams = params.chainlist_params;
  const isTestnet = isTestnetChain(id);

  return {
    id,
    chainId: chainParams.chain_id_cosmos!,
    name: chainParams.chain_name.toUpperCase(),
    image: chainParams?.chain_image ?? null,
    chainType: 'cosmos' as const,
    mainAssetDenom: chainParams?.staking_asset_denom || '',
    chainDefaultCoinDenoms: collectDefaultDenoms(chainParams),
    isCosmwasm: chainParams?.is_support_cw20 ?? false,
    accountPrefix: chainParams.bech_account_prefix ?? '',
    validatorAccountPrefix: chainParams.bech_validator_prefix,
    isEvm: chainParams?.chain_type?.includes('evm') ?? false,
    lcdUrls: chainParams.lcd_endpoint ?? [],
    explorer: createExplorer(chainParams?.explorer),
    feeInfo: {
      isSimulable: chainParams?.cosmos_fee_info?.is_simulable ?? false,
      isFeemarketEnabled: chainParams?.cosmos_fee_info?.is_feemarket ?? false,
      defaultFeeRateKey: chainParams?.cosmos_fee_info?.base ?? '0',
      gasRate: chainParams?.cosmos_fee_info?.rate ?? [],
      defaultGasLimit: chainParams?.cosmos_fee_info?.init_gas_limit ?? 200000,
      gasCoefficient: chainParams?.cosmos_fee_info?.simulated_gas_multiply ?? 1.2,
    },
    accountTypes: createAccountTypes(chainParams?.account_type),
    isSupportCW721: chainParams?.is_support_cw721 ?? false,
    isSupportStaking: chainParams?.is_stake_enabled !== false && !UNSUPPORT_STAKE_CHAIN_CHAINLIST_ID.includes(id),
    isSupportHistory: !!chainParams?.is_support_mintscan,
    isDiableSend: chainParams?.is_send_enabled === false,
    isTestnet,
    apr: params.apr,
    stakingParams: params?.staking_params?.params,
    reportedValidators: chainParams.reported_validators,
    maxApproveValidator: params.interchain_provider_params?.max_provider_consensus_validators,
  };
};

const mapEvmChain = (chain: ChainInfo): EvmChain => {
  const { id, params } = chain;
  const chainParams = params.chainlist_params;
  const isCosmos = chainParams?.chain_type?.includes('cosmos') ?? false;

  const filteredAccountTypes = chainParams?.account_type
    ?.filter((item) => item.hd_path.includes(`m/44'/60'/0'/0/`) && item.pubkey_style === 'keccak256')
    .map((item) => ({
      hdPath: "m/44'/60'/0'/0/${index}",
      pubkeyStyle: item.pubkey_style,
      pubkeyType: item.pubkey_type ?? null,
      isDefault: item.is_default ?? null,
    }));

  const accountTypes =
    filteredAccountTypes && filteredAccountTypes.length > 0
      ? filteredAccountTypes
      : [
          {
            hdPath: "m/44'/60'/0'/0/${index}",
            pubkeyStyle: 'keccak256',
            isDefault: null,
          },
        ];

  return {
    id,
    chainId: chainParams.chain_id_evm!,
    name: chainParams.chain_name.toUpperCase(),
    mainAssetDenom: (isCosmos ? chainParams?.staking_asset_denom : chainParams?.main_asset_denom) ?? null,
    chainDefaultCoinDenoms: collectDefaultDenoms(chainParams, { isEvm: true }),
    isCosmos,
    image: chainParams?.chain_image ?? null,
    chainType: 'evm' as const,
    feeInfo: {
      isEip1559: chainParams?.evm_fee_info?.is_eip1559 ?? false,
      gasCoefficient: chainParams?.evm_fee_info?.simulated_gas_multiply ?? 1.1,
    },
    rpcUrls: chainParams.evm_rpc_endpoint ?? [],
    accountTypes,
    isDiableSend: chainParams?.is_send_enabled === false,
    isTestnet: isTestnetChain(id),
    explorer: createExplorer(chainParams?.explorer),
  };
};

const mapSuiChain = (chain: ChainInfo): SuiChain => {
  const { id, params } = chain;
  const chainParams = params.chainlist_params;

  return {
    id,
    chainId: chainParams.chain_id!,
    name: chainParams.chain_name.toUpperCase(),
    image: chainParams?.chain_image ?? null,
    chainType: 'sui' as const,
    mainAssetDenom: chainParams?.staking_asset_denom ?? SUI_COIN_TYPE,
    chainDefaultCoinDenoms: collectDefaultDenoms(chainParams),
    rpcUrls: chainParams.rpc_endpoint ?? [],
    explorer: createExplorer(chainParams?.explorer),
    accountTypes: createAccountTypes(chainParams?.account_type),
  };
};

const mapAptosChain = (chain: ChainInfo): AptosChain => {
  const { id, params } = chain;
  const chainParams = params.chainlist_params;

  return {
    id,
    chainId: chainParams.chain_id!,
    name: chainParams.chain_name.toUpperCase(),
    image: chainParams?.chain_image ?? null,
    chainType: 'aptos' as const,
    mainAssetDenom: chainParams?.staking_asset_denom ?? APTOS_COIN_TYPE,
    chainDefaultCoinDenoms: collectDefaultDenoms(chainParams),
    rpcUrls: chainParams.rpc_endpoint ?? [],
    explorer: createExplorer(chainParams?.explorer),
    accountTypes: createAccountTypes(chainParams?.account_type),
  };
};

const mapBitcoinChain = (chain: ChainInfo): BitcoinChain => {
  const { id, params } = chain;
  const chainParams = params.chainlist_params;

  const { coinTypeLevel } = parsingHdPath(chainParams?.account_type?.[0].hd_path || '');
  const isTestnet = coinTypeLevel.replace(/[^0-9]/g, '') === `1`;

  const mainAssetDenom = chainParams?.main_asset_denom || (isTestnet ? 'sbtc' : 'btc');

  const defaultRpcUrls = isTestnet
    ? [{ provider: 'Cosmostation', url: 'https://rpc-office.cosmostation.io/bitcoin-testnet' }]
    : [{ provider: 'Cosmostation', url: 'https://rpc-office.cosmostation.io/bitcoin-mainnet' }];

  return {
    id,
    chainId: chainParams.chain_id || id,
    name: chainParams.chain_name.toUpperCase(),
    image: chainParams?.chain_image ?? null,
    chainType: 'bitcoin' as const,
    mainAssetDenom,
    chainDefaultCoinDenoms: collectDefaultDenoms(chainParams),
    rpcUrls: chainParams.rpc_endpoint ?? defaultRpcUrls,
    mempoolURL: isTestnet ? 'https://mempool.space/signet/api' : 'https://mempool.space/api',
    explorer: createExplorer(chainParams?.explorer),
    accountTypes: createAccountTypes(chainParams?.account_type),
    isTestnet,
  };
};

const mapIotaChain = (chain: ChainInfo): IotaChain => {
  const { id, params } = chain;
  const chainParams = params.chainlist_params;

  return {
    id,
    chainId: chainParams.chain_id!,
    name: chainParams.chain_name.toUpperCase(),
    image: chainParams?.chain_image ?? null,
    chainType: 'iota' as const,
    mainAssetDenom: chainParams?.staking_asset_denom ?? IOTA_COIN_TYPE,
    chainDefaultCoinDenoms: collectDefaultDenoms(chainParams),
    rpcUrls: chainParams.rpc_endpoint ?? [],
    explorer: createExplorer(chainParams?.explorer),
    accountTypes: createAccountTypes(chainParams?.account_type),
  };
};

interface CacheItem {
  data: {
    cosmosChains: CosmosChain[];
    evmChains: EvmChain[];
    suiChains: SuiChain[];
    aptosChains: AptosChain[];
    bitcoinChains: BitcoinChain[];
    iotaChains: IotaChain[];
  };
  timestamp: number;
}

let cachedChainResult: CacheItem | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function getChains() {
  if (cachedChainResult && isCacheValid(cachedChainResult.timestamp)) {
    return cachedChainResult.data;
  }

  const { paramsV11: chains } = await chrome.storage.local.get<ExtensionStorage>('paramsV11');

  if (!chains) {
    throw new Error('No chains found');
  }

  const supportedChains = Object.entries(chains)
    .map(([chainId, chainInfo]) => ({ id: chainId, ...chainInfo }))
    .filter((chainInfo) => chainInfo.params.chainlist_params?.is_support_extension_wallet);

  const result = supportedChains.reduce(
    (acc, chainInfo) => {
      const chainType = chainInfo.params.chainlist_params?.chain_type;

      if (chainType?.includes('cosmos')) {
        acc.cosmosChains.push(mapCosmosChain(chainInfo));
      }
      if (chainType?.includes('evm')) {
        acc.evmChains.push(mapEvmChain(chainInfo));
      }
      if (chainType?.includes('sui')) {
        acc.suiChains.push(mapSuiChain(chainInfo));
      }
      if (chainType?.includes('aptos')) {
        acc.aptosChains.push(mapAptosChain(chainInfo));
      }
      if (chainType?.includes('bitcoin')) {
        acc.bitcoinChains.push(mapBitcoinChain(chainInfo));
      }
      if (chainType?.includes('iota')) {
        acc.iotaChains.push(mapIotaChain(chainInfo));
      }

      return acc;
    },
    {
      cosmosChains: [] as CosmosChain[],
      evmChains: [] as EvmChain[],
      suiChains: [] as SuiChain[],
      aptosChains: [] as AptosChain[],
      bitcoinChains: [] as BitcoinChain[],
      iotaChains: [] as IotaChain[],
    },
  );

  setCachedResult(result);

  return result;
}

function isCacheValid(cachedTimestamp: number): boolean {
  return Date.now() - cachedTimestamp < CACHE_TTL;
}

function setCachedResult(result: CacheItem['data']): void {
  cachedChainResult = {
    data: result,
    timestamp: Date.now(),
  };
}

export async function getAddedCustomChains() {
  const storage = await chrome.storage.local.get<ExtensionStorage>('addedCustomChainList');

  const addedCustomChainList = storage['addedCustomChainList'] || [];

  return addedCustomChainList;
}

export async function getAllChains() {
  const managedChains = await getChains();
  const addedCustomChainList = await getAddedCustomChains();

  return [...Object.values(managedChains).flat(), ...addedCustomChainList];
}
