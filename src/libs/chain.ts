import type { AptosChain, BitcoinChain, CosmosChain, EvmChain, SuiChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';

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

    const name = chain.params.chainlist_params.chain_name;
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const mainAssetDenom = chain.params.chainlist_params.main_asset_denom;

    const isCosmwasm = chain.params.chainlist_params?.is_support_cw20 ?? false;
    const isEvm = chain.params.chainlist_params?.chain_type?.includes('evm') ?? false;

    const lcdUrls = chain.params.chainlist_params.lcd_endpoint ?? [];

    const explorer = chain.params.chainlist_params?.explorer ?? null;

    const accountPrefix = chain.params.chainlist_params.bech_account_prefix ?? '';

    const feeInfo = {
      isSimulable: chain.params.chainlist_params?.cosmos_fee_info?.is_simulable ?? false,
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
          pubKeyType: accountType.pubkey_type ?? null,
        };
      }) ?? [];

    return {
      id,
      chainId,
      name,
      image,
      chainType,
      mainAssetDenom,
      isCosmwasm,
      accountPrefix,
      isEvm,
      lcdUrls,
      explorer,
      feeInfo,
      accountTypes,
    };
  });

  const remappedEvmChains: EvmChain[] = evmChains.map((chain) => {
    const id = chain.id;
    const chainType = 'evm';
    const chainId = chain.params.chainlist_params.chain_id_evm!;
    const name = chain.params.chainlist_params.chain_name;
    const image = chain.params.chainlist_params?.chain_image ?? null;
    const mainAssetDenom = chain.params?.chainlist_params?.main_asset_denom ?? null;

    const isCosmos = chain.params.chainlist_params?.chain_type?.includes('cosmos') ?? false;

    const feeInfo = {
      isEip1559: chain.params.chainlist_params?.evm_fee_info?.is_eip1559 ?? false,
      gasCoefficient: chain.params.chainlist_params?.evm_fee_info?.simulated_gas_multiply ?? 1.1,
    };

    const rpcUrls = chain.params.chainlist_params.evm_rpc_endpoint ?? [];

    const accountTypes = [
      {
        hdPath: "m/44'/60'/0'/0/${index}",
        pubkeyStyle: 'keccak256',
      },
    ];

    const explorer = chain.params.chainlist_params?.explorer ?? null;

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
      explorer,
    };
  });

  const remappedSuiChains: SuiChain[] = suiChains.map((chain) => {
    const id = chain.id;
    const chainType = 'sui';
    const chainId = chain.params.chainlist_params.chain_id!;

    const name = chain.params.chainlist_params.chain_name;
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const mainAssetDenom = chain.params.chainlist_params?.main_asset_denom ?? null;

    const rpcUrls = chain.params.chainlist_params.rpc_endpoint ?? [];

    const explorer = chain.params.chainlist_params?.explorer ?? null;

    const accountTypes =
      chain.params.chainlist_params?.account_type?.map((accountType) => {
        const hdPath = accountType.hd_path.replace('X', '${index}');
        return {
          hdPath,
          pubkeyStyle: accountType.pubkey_style,
          pubKeyType: accountType.pubkey_type ?? null,
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

    const name = chain.params.chainlist_params.chain_name;
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const mainAssetDenom = chain.params.chainlist_params?.main_asset_denom ?? null;

    const rpcUrls = chain.params.chainlist_params.rpc_endpoint ?? [];

    const explorer = chain.params.chainlist_params?.explorer ?? null;

    const accountTypes =
      chain.params.chainlist_params?.account_type?.map((accountType) => {
        const hdPath = accountType.hd_path.replace('X', '${index}');
        return {
          hdPath,
          pubkeyStyle: accountType.pubkey_style,
          pubKeyType: accountType.pubkey_type ?? null,
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
    const chainId = chain.params.chainlist_params.chain_id!;

    const name = chain.params.chainlist_params.chain_name;
    const image = chain.params.chainlist_params?.chain_image ?? null;

    const mainAssetDenom = chain.params.chainlist_params?.main_asset_denom ?? null;

    const rpcUrls = chain.params.chainlist_params.rpc_endpoint ?? [];

    const explorer = chain.params.chainlist_params?.explorer ?? null;

    const accountTypes =
      chain.params.chainlist_params?.account_type?.map((accountType) => {
        const hdPath = accountType.hd_path.replace('X', '${index}');
        return {
          hdPath,
          pubkeyStyle: accountType.pubkey_style,
          pubKeyType: accountType.pubkey_type ?? null,
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

  return {
    cosmosChains: remappedCosmosChains,
    evmChains: remappedEvmChains,
    suiChains: remappedSuiChains,
    aptosChains: remappedAptosChains,
    bitcoinChains: remappedBitcoinChains,
  };
}
