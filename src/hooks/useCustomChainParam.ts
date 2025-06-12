import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { CHAINLIST_RESOURCE_URL } from '@/constants/common';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import type { CustomChainAsset, CustomChainParamResponse, CustomCosmosChainAsset, CustomEvmChainAsset } from '@/types/customChain';
import { get } from '@/utils/axios';

export function useCustomChainParam(config?: UseQueryOptions<CustomChainAsset[]>) {
  const requestURL = `${CHAINLIST_RESOURCE_URL}/custom_chain.json`;

  const fetcher = async () => {
    const response = await get<CustomChainParamResponse>(requestURL);

    const cosmosChains = response.filter((chainInfo) => chainInfo.chain_type?.includes('cosmos'));
    const evmChains = response.filter((chainInfo) => chainInfo.chain_type?.includes('evm'));

    const remappedCosmosChains: CustomCosmosChainAsset[] = cosmosChains.map((chain) => {
      const id = chain.id;
      const chainType = 'cosmos';
      const chainId = chain.chain_id_cosmos!;

      const name = chain.chain_name;
      const image = chain?.chain_image ?? null;

      const mainAssetDenom = chain?.staking_asset_denom || '';
      const mainAssetSymbol = chain.staking_asset_symbol || 'UNKNOWN';
      const mainAssetDecimals = chain?.staking_asset_decimals || 6;
      const mainAssetImage = chain?.staking_asset_image || null;
      const mainAssetCoinGeckoId = chain?.staking_asset_coingecko_id || null;
      const chainDefaultCoinDenoms = [chain?.gas_asset_denom, chain?.staking_asset_denom, chain?.main_asset_denom].filter((denom): denom is string =>
        Boolean(denom),
      );

      const isCosmwasm = chain?.is_support_cw20 ?? false;
      const isSupportCW721 = chain.is_support_cw721 ?? false;
      const isEvm = chain?.chain_type?.includes('evm') ?? false;

      const lcdUrls = chain.lcd_endpoint ?? [];

      const explorer = chain?.explorer ?? null;

      const accountPrefix = chain.bech_account_prefix ?? '';
      const validatorAccountPrefix = chain.bech_validator_prefix ?? '';

      const feeInfo = {
        isSimulable: chain?.cosmos_fee_info?.is_simulable ?? false,
        gasRate: chain?.cosmos_fee_info?.rate ?? [],
        isFeemarketEnabled: chain?.cosmos_fee_info?.is_feemarket ?? false,
        defaultFeeRateKey: chain?.cosmos_fee_info?.base ?? '0',
        defaultGasLimit: chain?.cosmos_fee_info?.init_gas_limit ?? 200000,
        gasCoefficient: chain?.cosmos_fee_info?.simulated_gas_multiply ?? 1.2,
      };

      const accountTypes =
        chain.account_type?.map((accountType) => {
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
        chainDefaultCoinDenoms,
        mainAssetSymbol,
        mainAssetDecimals,
        mainAssetImage,
        mainAssetCoinGeckoId,
        isCosmwasm,
        isSupportCW721,
        accountPrefix,
        validatorAccountPrefix,
        isEvm,
        lcdUrls,
        explorer,
        feeInfo,
        accountTypes,
      };
    });

    const remappedEvmChains: CustomEvmChainAsset[] = evmChains.map((chain) => {
      const id = chain.id;
      const chainType = 'evm';
      const chainId = chain.chain_id_evm!;
      const name = chain.chain_name;
      const image = chain?.chain_image ?? null;

      const mainAssetDenom = chain?.gas_asset_denom ?? chain?.main_asset_denom ?? NATIVE_EVM_COIN_ADDRESS;
      const mainAssetSymbol = chain?.gas_asset_symbol ?? chain?.main_asset_symbol ?? 'UNKNOWN';
      const mainAssetDecimals = chain?.gas_asset_decimals ?? chain?.main_asset_decimals ?? 18;
      const mainAssetImage = chain?.gas_asset_image ?? chain?.main_asset_image ?? null;
      const mainAssetCoinGeckoId = chain?.gas_asset_coin_gecko_id ?? chain?.main_asset_coin_gecko_id ?? null;
      const chainDefaultCoinDenoms = [chain?.gas_asset_denom, chain?.staking_asset_denom, chain?.main_asset_denom].filter((denom): denom is string =>
        Boolean(denom),
      );

      const isCosmos = chain?.chain_type?.includes('cosmos') ?? false;

      const feeInfo = {
        isEip1559: chain?.evm_fee_info?.is_eip1559 ?? false,
        gasCoefficient: chain?.evm_fee_info?.simulated_gas_multiply ?? 1.1,
      };

      const rpcUrls = chain.evm_rpc_endpoint ?? [];
      const accountTypes = [
        {
          hdPath: "m/44'/60'/0'/0/${index}",
          pubkeyStyle: 'keccak256',
          isDefault: null,
        },
      ];
      const explorer = chain?.explorer ?? null;

      return {
        id,
        chainId,
        name,
        mainAssetDenom,
        mainAssetSymbol,
        mainAssetDecimals,
        mainAssetImage,
        mainAssetCoinGeckoId,
        chainDefaultCoinDenoms,
        isCosmos,
        image,
        chainType,
        feeInfo,
        rpcUrls,
        accountTypes,
        explorer,
      };
    });

    const remappedChains = [...remappedCosmosChains, ...remappedEvmChains];

    return remappedChains;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customChainParam', requestURL],
    queryFn: fetcher,
    refetchOnWindowFocus: false,
    retry: 3,
    staleTime: Infinity,
    ...config,
  });

  return { data, error, refetch, isLoading };
}
