export type V11Param = {
  chain_id: string;
  block_time: number;
  params: {
    apr: string;
    minting_inflation: {
      inflation: string;
    };
    staking_params: {
      params: {
        unbonding_time?: string;
        max_validators?: number;
        max_entries?: number;
        historical_entries?: number;
        bond_denom?: string;
        min_commission_rate?: string;
      };
    };
    slashing_params: {
      params: {
        signed_blocks_window: string;
        min_signed_per_window: string;
        downtime_jail_duration: string;
        slash_fraction_double_sign: string;
        slash_fraction_downtime: string;
      };
    };
    chainlist_params: {
      chain_id?: string;
      chain_id_cosmos?: string;
      chain_id_evm?: string;
      chain_name: string;
      chain_image: string;
      staking_asset_denom?: string;
      staking_asset_symbol?: string;
      staking_asset_image?: string;
      main_asset_denom?: string;
      main_asset_symbol?: string;
      main_asset_image?: string;
      gas_asset_denom?: string;
      gas_asset_symbol?: string;
      gas_asset_image?: string;
      bech_account_prefix?: string;
      bech_validator_prefix?: string;
      origin_genesis_time: string;
      api_name: string;
      is_stake_enabled?: boolean;
      is_send_enabled?: boolean;
      is_support_mintscan?: boolean;
      is_support_cw20?: boolean;
      is_support_cw721?: boolean;
      is_support_mobile_wallet?: boolean;
      is_support_extension_wallet?: boolean;
      is_support_erc20?: boolean;
      chain_type: string[];
      account_type?: {
        hd_path: string;
        pubkey_style: string;
        pubkey_type: string;
        is_default?: boolean;
      }[];
      cosmos_fee_info?: {
        base: string;
        rate: string[];
        is_simulable: boolean;
        simulated_gas_multiply: number;
        init_gas_limit: number;
        fee_threshold: string;
        is_feemarket?: boolean;
      };
      evm_fee_info?: {
        is_eip1559: boolean;
        simulated_gas_multiply: number;
      };
      grpc_endpoint?: {
        provider: string;
        url: string;
      }[];
      lcd_endpoint?: {
        provider: string;
        url: string;
      }[];
      rpc_endpoint?: {
        provider: string;
        url: string;
      }[];
      evm_rpc_endpoint?: {
        provider: string;
        url: string;
      }[];
      explorer: {
        name: string;
        url: string;
        account: string;
        tx: string;
        proposal: string;
      };
      about: {
        website: string;
        docs: string;
        github: string;
        blog: string;
        medium: string;
        twitter: string;
        coingecko: string;
      };
      forum: {
        main: string;
        governance: string;
      };
      description: {
        ko: string;
        en: string;
        ja: string;
      };
      reported_validators?: string[];
    };
    interchain_provider_params?: {
      max_provider_consensus_validators?: string;
    };
  };
  updated_at: string;
  is_support: boolean;
};

export type V11Asset = {
  chain: string;
  type: string;
  denom: string;
  name: string;
  symbol: string;
  description?: string;
  decimals: number;
  image?: string;
  coinGeckoId?: string;
  ibc_info?: {
    path: string;
    client: {
      channel: string;
      port: string;
    };
    counterparty: {
      channel: string;
      port: string;
      chain: string;
      denom: string;
    };
  };
};

export type V11Erc20 = {
  chain: string;
  type: string;
  contract: string;
  name: string;
  symbol: string;
  description?: string;
  decimals: number;
  image?: string;
  coinGeckoId?: string;
  wallet_preload?: boolean;
};

export type V11Cw20 = {
  chain: string;
  type: string;
  contract: string;
  name: string;
  symbol: string;
  description?: string;
  decimals: number;
  image?: string;
  coinGeckoId?: string;
  color?: string;
  wallet_preload?: boolean;
};
