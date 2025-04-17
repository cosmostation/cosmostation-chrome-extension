import { APTOS_COIN_TYPE } from '@/constants/aptos/coin';
import { SUI_COIN_TYPE } from '@/constants/sui';
import type { AptosChain, BitcoinChain, ChainExplorer, CosmosChain, EvmChain, SuiChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import { parsingHdPath, removeTrailingSlash } from '@/utils/string';

export async function getChains() {
  const { paramsV11: chains } = await chrome.storage.local.get<ExtensionStorage>('paramsV11');

  if (!chains) {
    throw new Error('No chains found');
  }

  const chainIds = Object.keys(chains);
  const chainInfos = chainIds.map((chainId) => {
    const chainInfo = chains[chainId];

    return {
      id: chainId,
      ...chainInfo,
    };
  });

  const supportedChains = chainInfos.filter((chainInfo) => chainInfo.params.chainlist_params?.is_support_extension_wallet);

  const cosmosChains = supportedChains.filter((chainInfo) => chainInfo.params.chainlist_params?.chain_type?.includes('cosmos'));
  const evmChains = supportedChains.filter((chainInfo) => chainInfo.params.chainlist_params?.chain_type?.includes('evm'));
  const suiChains = supportedChains.filter((chainInfo) => chainInfo.params.chainlist_params?.chain_type?.includes('sui'));
  const aptosChains = supportedChains.filter((chainInfo) => chainInfo.params.chainlist_params?.chain_type?.includes('aptos'));
  const bitcoinChains = supportedChains.filter((chainInfo) => chainInfo.params.chainlist_params?.chain_type?.includes('bitcoin'));

  const remappedCosmosChains: CosmosChain[] = cosmosChains.map((chain) => {
    const id = chain.id;
    const chainType = 'cosmos';
    const chainId = chain.params.chainlist_params.chain_id_cosmos!;

    const name = chain.params.chainlist_params.chain_name.toUpperCase();
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const mainAssetDenom = chain.params.chainlist_params?.staking_asset_denom || '';

    const isCosmwasm = chain.params.chainlist_params?.is_support_cw20 ?? false;
    const isSupportCW721 = chain.params.chainlist_params?.is_support_cw721 ?? false;

    const isEvm = chain.params.chainlist_params?.chain_type?.includes('evm') ?? false;

    const lcdUrls =
      chain.params.chainlist_params.lcd_endpoint?.map((endpoint) => ({
        ...endpoint,
        url: removeTrailingSlash(endpoint.url),
      })) ?? [];

    const explorer = chain.params.chainlist_params?.explorer
      ? Object.entries(chain.params.chainlist_params.explorer).reduce((acc, [key, value]) => {
          acc[key as keyof ChainExplorer] = removeTrailingSlash(value);
          return acc;
        }, {} as ChainExplorer)
      : {
          name: '',
          url: '',
          account: '',
          tx: '',
          proposal: '',
        };

    const accountPrefix = chain.params.chainlist_params.bech_account_prefix ?? '';
    const validatorAccountPrefix = chain.params.chainlist_params.bech_validator_prefix;

    const feeInfo = {
      isSimulable: chain.params.chainlist_params?.cosmos_fee_info?.is_simulable ?? false,
      isFeemarketEnabled: chain.params.chainlist_params?.cosmos_fee_info?.is_feemarket ?? false,
      defaultFeeRateKey: chain.params.chainlist_params?.cosmos_fee_info?.base ?? '0',
      gasRate: chain.params.chainlist_params?.cosmos_fee_info?.rate ?? [],
      defaultGasLimit: chain.params.chainlist_params?.cosmos_fee_info?.init_gas_limit ?? 200000,
      gasCoefficient: chain.params.chainlist_params?.cosmos_fee_info?.simulated_gas_multiply ?? 1.2,
    };

    const accountTypes =
      chain.params.chainlist_params?.account_type?.map((accountType) => {
        const hdPath = accountType.hd_path.replace('X', '${index}');
        return {
          hdPath,
          pubkeyStyle: accountType.pubkey_style,
          pubkeyType: accountType.pubkey_type ?? null,
          isDefault: accountType.is_default ?? null,
        };
      }) ?? [];

    const isSupportStaking = chain.params.chainlist_params?.is_stake_enabled !== false;
    const isSupportHistory = !!chain.params.chainlist_params?.is_support_mintscan;
    const isDiableSend = chain.params.chainlist_params?.is_send_enabled === false;

    const apr = chain.params.apr;

    const stakingParams = chain.params?.staking_params ? chain.params.staking_params.params : undefined;

    return {
      id,
      chainId,
      name,
      image,
      chainType,
      mainAssetDenom,
      isCosmwasm,
      accountPrefix,
      validatorAccountPrefix,
      isEvm,
      lcdUrls,
      explorer,
      feeInfo,
      accountTypes,
      isSupportCW721,
      isSupportStaking,
      isSupportHistory,
      isDiableSend,
      apr,
      stakingParams,
    };
  });

  const remappedEvmChains: EvmChain[] = evmChains.map((chain) => {
    const id = chain.id;
    const chainType = 'evm';
    const chainId = chain.params.chainlist_params.chain_id_evm!;
    const name = chain.params.chainlist_params.chain_name.toUpperCase();
    const image = chain.params.chainlist_params?.chain_image ?? null;
    const isCosmos = chain.params.chainlist_params?.chain_type?.includes('cosmos') ?? false;

    const mainAssetDenom = (isCosmos ? chain.params?.chainlist_params?.staking_asset_denom : chain.params?.chainlist_params?.main_asset_denom) ?? null;
    const feeInfo = {
      isEip1559: chain.params.chainlist_params?.evm_fee_info?.is_eip1559 ?? false,
      gasCoefficient: chain.params.chainlist_params?.evm_fee_info?.simulated_gas_multiply ?? 1.1,
    };

    const rpcUrls =
      chain.params.chainlist_params.evm_rpc_endpoint?.map((endpoint) => ({
        ...endpoint,
        url: removeTrailingSlash(endpoint.url),
      })) ?? [];

    const filteredAccountTypes = chain.params.chainlist_params?.account_type
      ?.filter((item) => {
        return item.hd_path.includes(`m/44'/60'/0'/0/`) && item.pubkey_style === 'keccak256';
      })
      .map((item) => {
        return {
          hdPath: "m/44'/60'/0'/0/${index}",
          pubkeyStyle: item.pubkey_style,
          pubkeyType: item.pubkey_type ?? null,
          isDefault: item.is_default ?? null,
        };
      });

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

    const explorer = chain.params.chainlist_params?.explorer
      ? Object.entries(chain.params.chainlist_params.explorer).reduce((acc, [key, value]) => {
          acc[key as keyof ChainExplorer] = removeTrailingSlash(value);
          return acc;
        }, {} as ChainExplorer)
      : {
          name: '',
          url: '',
          account: '',
          tx: '',
          proposal: '',
        };

    const isDiableSend = chain.params.chainlist_params?.is_send_enabled === false;

    return {
      id,
      chainId,
      name,
      mainAssetDenom,
      isCosmos,
      image,
      chainType,
      feeInfo,
      rpcUrls,
      accountTypes,
      isDiableSend,
      explorer,
    };
  });

  const remappedSuiChains: SuiChain[] = suiChains.map((chain) => {
    const id = chain.id;
    const chainType = 'sui';
    const chainId = chain.params.chainlist_params.chain_id!;

    const name = chain.params.chainlist_params.chain_name.toUpperCase();
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const mainAssetDenom = chain.params.chainlist_params?.staking_asset_denom ?? SUI_COIN_TYPE;

    const rpcUrls =
      chain.params.chainlist_params.rpc_endpoint?.map((endpoint) => ({
        ...endpoint,
        url: removeTrailingSlash(endpoint.url),
      })) ?? [];

    const explorer = chain.params.chainlist_params?.explorer
      ? Object.entries(chain.params.chainlist_params.explorer).reduce((acc, [key, value]) => {
          acc[key as keyof ChainExplorer] = removeTrailingSlash(value);
          return acc;
        }, {} as ChainExplorer)
      : {
          name: '',
          url: '',
          account: '',
          tx: '',
          proposal: '',
        };

    const accountTypes =
      chain.params.chainlist_params?.account_type?.map((accountType) => {
        const hdPath = accountType.hd_path.replace('X', '${index}');
        return {
          hdPath,
          pubkeyStyle: accountType.pubkey_style,
          pubkeyType: accountType.pubkey_type ?? null,
          isDefault: accountType.is_default ?? null,
        };
      }) ?? [];

    return {
      id,
      chainId,
      name,
      image,
      chainType,
      mainAssetDenom,
      rpcUrls,
      explorer,
      accountTypes,
    };
  });

  const remappedAptosChains: AptosChain[] = aptosChains.map((chain) => {
    const id = chain.id;
    const chainType = 'aptos';
    const chainId = chain.params.chainlist_params.chain_id!;

    const name = chain.params.chainlist_params.chain_name.toUpperCase();
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const mainAssetDenom = chain.params.chainlist_params?.staking_asset_denom ?? APTOS_COIN_TYPE;

    const rpcUrls =
      chain.params.chainlist_params.rpc_endpoint?.map((endpoint) => ({
        ...endpoint,
        url: removeTrailingSlash(endpoint.url),
      })) ?? [];

    const explorer = chain.params.chainlist_params?.explorer
      ? Object.entries(chain.params.chainlist_params.explorer).reduce((acc, [key, value]) => {
          acc[key as keyof ChainExplorer] = removeTrailingSlash(value);
          return acc;
        }, {} as ChainExplorer)
      : {
          name: '',
          url: '',
          account: '',
          tx: '',
          proposal: '',
        };

    const accountTypes =
      chain.params.chainlist_params?.account_type?.map((accountType) => {
        const hdPath = accountType.hd_path.replace('X', '${index}');
        return {
          hdPath,
          pubkeyStyle: accountType.pubkey_style,
          pubkeyType: accountType.pubkey_type ?? null,
          isDefault: accountType.is_default ?? null,
        };
      }) ?? [];

    return {
      id,
      chainId,
      name,
      image,
      chainType,
      mainAssetDenom,
      rpcUrls,
      explorer,
      accountTypes,
    };
  });

  const remappedBitcoinChains: BitcoinChain[] = bitcoinChains.map((chain) => {
    const id = chain.id;
    const chainType = 'bitcoin';
    const chainId = chain.params.chainlist_params.chain_id || chain.id;

    const name = chain.params.chainlist_params.chain_name.toUpperCase();
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const { coinTypeLevel } = parsingHdPath(chain.params?.chainlist_params?.account_type?.[0].hd_path || '');

    const isTestnet = coinTypeLevel.replace(/[^0-9]/g, '') === `1`;

    const mainAssetDenom = (chain.params.chainlist_params?.main_asset_denom ?? isTestnet) ? 'sbtc' : 'btc';

    const rpcUrls =
      chain.params.chainlist_params.rpc_endpoint ??
      (isTestnet
        ? [
            {
              provider: 'Cosmostation',
              url: 'https://rpc-office.cosmostation.io/bitcoin-testnet',
            },
          ]
        : [
            {
              provider: 'Cosmostation',
              url: 'https://rpc-office.cosmostation.io/bitcoin-mainnet',
            },
          ]);

    const mempoolURL = isTestnet ? 'https://mempool.space/signet/api' : 'https://mempool.space/api';

    const explorer = chain.params.chainlist_params?.explorer
      ? Object.entries(chain.params.chainlist_params.explorer).reduce((acc, [key, value]) => {
          acc[key as keyof ChainExplorer] = removeTrailingSlash(value);
          return acc;
        }, {} as ChainExplorer)
      : {
          name: '',
          url: '',
          account: '',
          tx: '',
          proposal: '',
        };

    const accountTypes =
      chain.params.chainlist_params?.account_type?.map((accountType) => {
        const hdPath = accountType.hd_path.replace('X', '${index}');
        return {
          hdPath,
          pubkeyStyle: accountType.pubkey_style,
          pubkeyType: accountType.pubkey_type ?? null,
          isDefault: accountType.is_default ?? null,
        };
      }) ?? [];

    return {
      id,
      chainId,
      name,
      image,
      chainType,
      mainAssetDenom,
      rpcUrls,
      mempoolURL,
      explorer,
      accountTypes,
      isTestnet,
    };
  });

  return {
    cosmosChains: remappedCosmosChains,
    evmChains: remappedEvmChains,
    suiChains: remappedSuiChains,
    aptosChains: remappedAptosChains,
    bitcoinChains: remappedBitcoinChains,
  };
}

export async function getAddedCustomChains() {
  const storage = await chrome.storage.local.get<ExtensionStorage>('addedCustomChainList');

  const addedCustomChainList = storage['addedCustomChainList'];

  return addedCustomChainList;
}

export async function getAllChains() {
  const managedChains = await getChains();
  const addedCustomChainList = await getAddedCustomChains();

  return [...Object.values(managedChains).flat(), ...addedCustomChainList];
}
