import { APTOS_COIN_TYPE } from '@/constants/aptos/coin';
import { UNSUPPORT_STAKE_CHAIN_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { IOTA_COIN_TYPE } from '@/constants/iota';
import { SUI_COIN_TYPE } from '@/constants/sui';
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

  const supportedChains = chainInfos.filter(
    (chainInfo) => !!chainInfo.params?.chainlist_params && chainInfo.params?.chainlist_params.is_support_extension_wallet,
  ) as SupportedV11Param[];

  console.log('🚀 ~ getChains ~ supportedChains:', supportedChains);

  const cosmosChains = supportedChains.filter((chainInfo) => chainInfo.params.chainlist_params?.chain_type?.includes('cosmos'));
  const evmChains = supportedChains.filter((chainInfo) => chainInfo.params.chainlist_params?.chain_type?.includes('evm'));
  const suiChains = supportedChains.filter((chainInfo) => chainInfo.params.chainlist_params?.chain_type?.includes('sui'));
  const aptosChains = supportedChains.filter((chainInfo) => chainInfo.params.chainlist_params?.chain_type?.includes('aptos'));
  const bitcoinChains = supportedChains.filter((chainInfo) => chainInfo.params.chainlist_params?.chain_type?.includes('bitcoin'));
  const iotaChains = supportedChains.filter((chainInfo) => chainInfo.params.chainlist_params?.chain_type?.includes('iota'));
  const solanaChains = supportedChains.filter((chainInfo) => chainInfo.params.chainlist_params?.chain_type?.includes('solana'));
  const gnoChains = supportedChains.filter((chainInfo) => chainInfo.params.chainlist_params?.chain_type?.includes('gno'));

  const remappedCosmosChains: CosmosChain[] = cosmosChains.map((chain) => {
    const id = chain.id;
    const chainType = 'cosmos';
    const chainId = chain.params.chainlist_params.chain_id_cosmos!;

    const name = chain.params.chainlist_params.chain_name.toUpperCase();
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const mainAssetDenom = chain.params.chainlist_params?.staking_asset_denom || '';
    const chainDefaultCoinDenoms = collectDefaultDenoms(chain.params.chainlist_params);
    const isCosmwasm = chain.params.chainlist_params?.is_support_cw20 ?? false;
    const isSupportCW721 = chain.params.chainlist_params?.is_support_cw721 ?? false;
    const isTestnet = isTestnetChain(id);
    const isEvm = chain.params.chainlist_params?.chain_type?.includes('evm') ?? false;

    const lcdUrls = chain.params.chainlist_params.lcd_endpoint ?? [];

    const explorer = chain.params.chainlist_params?.explorer
      ? Object.entries(chain.params.chainlist_params.explorer).reduce((acc, [key, value]) => {
          acc[key as keyof ChainExplorer] = removeTrailingSlash(value);
          return acc;
        }, {} as ChainExplorer)
      : { name: '', url: '', account: '', tx: '', proposal: '' };

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

    const isSupportStaking = chain.params.chainlist_params?.is_stake_enabled !== false && !UNSUPPORT_STAKE_CHAIN_CHAINLIST_ID.includes(chain.id);
    const isSupportHistory = !!chain.params.chainlist_params?.is_support_mintscan;
    const isDiableSend = chain.params.chainlist_params?.is_send_enabled === false;

    const apr = chain.params.apr;

    const stakingParams = chain.params?.staking_params ? chain.params.staking_params.params : undefined;

    const reportedValidators = chain.params.chainlist_params.reported_validators;
    const maxApproveValidator = chain.params.interchain_provider_params?.max_provider_consensus_validators;

    return {
      id,
      chainId,
      name,
      image,
      chainType,
      mainAssetDenom,
      chainDefaultCoinDenoms,
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
      isTestnet,
      apr,
      stakingParams,
      reportedValidators,
      maxApproveValidator,
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
    const chainDefaultCoinDenoms = collectDefaultDenoms(chain.params.chainlist_params, { isEvm: true });

    const feeInfo = {
      isEip1559: chain.params.chainlist_params?.evm_fee_info?.is_eip1559 ?? false,
      gasCoefficient: chain.params.chainlist_params?.evm_fee_info?.simulated_gas_multiply ?? 1.1,
    };

    const isTestnet = isTestnetChain(id);

    const rpcUrls = chain.params.chainlist_params.evm_rpc_endpoint ?? [];

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
      : { name: '', url: '', account: '', tx: '', proposal: '' };

    const isDiableSend = chain.params.chainlist_params?.is_send_enabled === false;

    return {
      id,
      chainId,
      name,
      mainAssetDenom,
      chainDefaultCoinDenoms,
      isCosmos,
      image,
      chainType,
      feeInfo,
      rpcUrls,
      accountTypes,
      isDiableSend,
      isTestnet,
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
    const chainDefaultCoinDenoms = collectDefaultDenoms(chain.params.chainlist_params);

    const rpcUrls = chain.params.chainlist_params.rpc_endpoint ?? [];

    const explorer = chain.params.chainlist_params?.explorer
      ? Object.entries(chain.params.chainlist_params.explorer).reduce((acc, [key, value]) => {
          acc[key as keyof ChainExplorer] = removeTrailingSlash(value);
          return acc;
        }, {} as ChainExplorer)
      : { name: '', url: '', account: '', tx: '', proposal: '' };

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

    return { id, chainId, name, image, chainType, mainAssetDenom, chainDefaultCoinDenoms, rpcUrls, explorer, accountTypes };
  });

  const remappedAptosChains: AptosChain[] = aptosChains.map((chain) => {
    const id = chain.id;
    const chainType = 'aptos';
    const chainId = chain.params.chainlist_params.chain_id!;

    const name = chain.params.chainlist_params.chain_name.toUpperCase();
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const mainAssetDenom = chain.params.chainlist_params?.staking_asset_denom ?? APTOS_COIN_TYPE;
    const chainDefaultCoinDenoms = collectDefaultDenoms(chain.params.chainlist_params);

    const rpcUrls = chain.params.chainlist_params.rpc_endpoint ?? [];

    const explorer = chain.params.chainlist_params?.explorer
      ? Object.entries(chain.params.chainlist_params.explorer).reduce((acc, [key, value]) => {
          acc[key as keyof ChainExplorer] = removeTrailingSlash(value);
          return acc;
        }, {} as ChainExplorer)
      : { name: '', url: '', account: '', tx: '', proposal: '' };

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

    return { id, chainId, name, image, chainType, mainAssetDenom, chainDefaultCoinDenoms, rpcUrls, explorer, accountTypes };
  });

  const remappedBitcoinChains: BitcoinChain[] = bitcoinChains.map((chain) => {
    const id = chain.id;
    const chainType = 'bitcoin';
    const chainId = chain.params.chainlist_params.chain_id || chain.id;

    const name = chain.params.chainlist_params.chain_name.toUpperCase();
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const { coinTypeLevel } = parsingHdPath(chain.params?.chainlist_params?.account_type?.[0].hd_path || '');

    const isTestnet = coinTypeLevel.replace(/[^0-9]/g, '') === `1`;

    const mainAssetDenom = (() => {
      if (chain.params.chainlist_params?.main_asset_denom) return chain.params.chainlist_params.main_asset_denom;

      return isTestnet ? 'sbtc' : 'btc';
    })();

    const chainDefaultCoinDenoms = collectDefaultDenoms(chain.params.chainlist_params);

    const rpcUrls =
      chain.params.chainlist_params.rpc_endpoint ??
      (isTestnet
        ? [{ provider: 'Cosmostation', url: 'https://rpc-office.cosmostation.io/bitcoin-testnet' }]
        : [{ provider: 'Cosmostation', url: 'https://rpc-office.cosmostation.io/bitcoin-mainnet' }]);

    const mempoolURL = isTestnet ? 'https://mempool.space/signet/api' : 'https://mempool.space/api';

    const explorer = chain.params.chainlist_params?.explorer
      ? Object.entries(chain.params.chainlist_params.explorer).reduce((acc, [key, value]) => {
          acc[key as keyof ChainExplorer] = removeTrailingSlash(value);
          return acc;
        }, {} as ChainExplorer)
      : { name: '', url: '', account: '', tx: '', proposal: '' };

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

    return { id, chainId, name, image, chainType, mainAssetDenom, chainDefaultCoinDenoms, rpcUrls, mempoolURL, explorer, accountTypes, isTestnet };
  });

  const remappedIotaChains: IotaChain[] = iotaChains.map((chain) => {
    const id = chain.id;
    const chainType = 'iota';
    const chainId = chain.params.chainlist_params.chain_id!;

    const name = chain.params.chainlist_params.chain_name.toUpperCase();
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const mainAssetDenom = chain.params.chainlist_params?.staking_asset_denom ?? IOTA_COIN_TYPE;
    const chainDefaultCoinDenoms = collectDefaultDenoms(chain.params.chainlist_params);

    const rpcUrls = chain.params.chainlist_params.rpc_endpoint ?? [];

    const explorer = chain.params.chainlist_params?.explorer
      ? Object.entries(chain.params.chainlist_params.explorer).reduce((acc, [key, value]) => {
          acc[key as keyof ChainExplorer] = removeTrailingSlash(value);
          return acc;
        }, {} as ChainExplorer)
      : { name: '', url: '', account: '', tx: '', proposal: '' };

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

    return { id, chainId, name, image, chainType, mainAssetDenom, chainDefaultCoinDenoms, rpcUrls, explorer, accountTypes };
  });

  const remappedSolanaChains: SolanaChain[] = solanaChains.map((chain) => {
    const id = chain.id;
    const chainType = 'solana';
    const chainId = chain.params.chainlist_params.chain_id!;

    const name = chain.params.chainlist_params.chain_name.toUpperCase();
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const mainAssetDenom = chain.params.chainlist_params?.main_asset_denom || null;
    const chainDefaultCoinDenoms = collectDefaultDenoms(chain.params.chainlist_params);

    const rpcUrls = chain.params.chainlist_params.solana_rpc_endpoint ?? [];

    const explorer = chain.params.chainlist_params?.explorer
      ? Object.entries(chain.params.chainlist_params.explorer).reduce((acc, [key, value]) => {
          acc[key as keyof ChainExplorer] = removeTrailingSlash(value);
          return acc;
        }, {} as ChainExplorer)
      : { name: '', url: '', account: '', tx: '', proposal: '' };

    const accountTypes =
      chain.params.chainlist_params?.account_type?.map((accountType) => {
        const hdPath = accountType.hd_path.replace('X', '${index}');
        return {
          hdPath,
          pubkeyStyle: accountType.pubkey_style,
          isDefault: accountType.is_default ?? null,
        };
      }) ?? [];

    const programId = { splToken: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' };

    return { id, chainId, name, image, chainType, mainAssetDenom, chainDefaultCoinDenoms, rpcUrls, explorer, accountTypes, programId };
  });

  const remappedGnoChains: GnoChain[] = gnoChains.map((chain) => {
    const id = chain.id;
    const chainType = 'gno';
    const chainId = chain.params.chainlist_params.chain_id_cosmos!;

    const name = chain.params.chainlist_params.chain_name.toUpperCase();
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const mainAssetDenom = chain.params.chainlist_params?.staking_asset_denom ?? '';
    const chainDefaultCoinDenoms = collectDefaultDenoms(chain.params.chainlist_params);

    const accountPrefix = chain.params.chainlist_params.bech_account_prefix ?? '';

    const isTestnet = isTestnetChain(id);

    const rpcUrls = chain.params.chainlist_params.cosmos_rpc_endpoint ?? [];

    const explorer = chain.params.chainlist_params?.explorer
      ? Object.entries(chain.params.chainlist_params.explorer).reduce((acc, [key, value]) => {
          acc[key as keyof ChainExplorer] = removeTrailingSlash(value);
          return acc;
        }, {} as ChainExplorer)
      : { name: '', url: '', account: '', tx: '', proposal: '' };

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

    const feeInfo = {
      isSimulable: chain.params.chainlist_params?.cosmos_fee_info?.is_simulable ?? false,
      isFeemarketEnabled: chain.params.chainlist_params?.cosmos_fee_info?.is_feemarket ?? false,
      defaultFeeRateKey: chain.params.chainlist_params?.cosmos_fee_info?.base ?? '0',
      gasRate: chain.params.chainlist_params?.cosmos_fee_info?.rate ?? [],
      defaultGasLimit: chain.params.chainlist_params?.cosmos_fee_info?.init_gas_limit ?? 200000,
      gasCoefficient: chain.params.chainlist_params?.cosmos_fee_info?.simulated_gas_multiply ?? 2,
    };

    return {
      id,
      chainId,
      name,
      image,
      chainType,
      mainAssetDenom,
      chainDefaultCoinDenoms,
      rpcUrls,
      explorer,
      accountTypes,
      accountPrefix,
      feeInfo,
      isTestnet,
    };
  });

  return {
    cosmosChains: remappedCosmosChains,
    evmChains: remappedEvmChains,
    suiChains: remappedSuiChains,
    aptosChains: remappedAptosChains,
    bitcoinChains: remappedBitcoinChains,
    iotaChains: remappedIotaChains,
    solanaChains: remappedSolanaChains,
    gnoChains: remappedGnoChains,
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
