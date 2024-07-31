import { ARCHWAY } from './chain/cosmos/archway';
import { CHIHUAHUA } from './chain/cosmos/chihuahua';
import { INJECTIVE } from './chain/cosmos/injective';
import { NEUTRON } from './chain/cosmos/neutron';
import { OSMOSIS } from './chain/cosmos/osmosis';
import { PERSISTENCE } from './chain/cosmos/persistence';
import { SEI } from './chain/cosmos/sei';
import { TERRA } from './chain/cosmos/terra';

export const SKIP_BASE_URL = 'https://api.skip.money';

export const DEFAULT_BPF = '100';

export const AFFILIATES = {
  cosmos: [
    {
      chainId: OSMOSIS.chainId,
      affiliate: [
        {
          address: 'osmo1clpqr4nrk4khgkxj78fcwwh6dl3uw4epasmvnj',
          basis_points_fee: DEFAULT_BPF,
        },
      ],
    },
    {
      chainId: NEUTRON.chainId,
      affiliate: [
        {
          address: 'neutron1clpqr4nrk4khgkxj78fcwwh6dl3uw4ep35p7l8',
          basis_points_fee: DEFAULT_BPF,
        },
      ],
    },
    {
      chainId: TERRA.chainId,
      affiliate: [
        {
          address: 'terra1564j3fq8p8np4yhh4lytnftz33japc03wuejxm',
          basis_points_fee: DEFAULT_BPF,
        },
      ],
    },
    {
      chainId: SEI.chainId,
      affiliate: [
        {
          address: 'sei1hnkkqnzwmyw652muh6wfea7xlfgplnyj3edm09',
          basis_points_fee: DEFAULT_BPF,
        },
      ],
    },
    {
      chainId: INJECTIVE.chainId,
      affiliate: [
        {
          address: 'inj1rvqzf9u2uxttmshn302anlknfgsatrh5mcu6la',
          basis_points_fee: DEFAULT_BPF,
        },
      ],
    },
    {
      chainId: CHIHUAHUA.chainId,
      affiliate: [
        {
          address: 'chihuahua1tgcypttehx3afugys6eq28h0kpmswfkgcuewfw',
          basis_points_fee: DEFAULT_BPF,
        },
      ],
    },
    {
      chainId: PERSISTENCE.chainId,
      affiliate: [
        {
          address: 'persistence1rq598kexpsdmhxq63qq74v3tf22u6yvl2a47xk',
          basis_points_fee: DEFAULT_BPF,
        },
      ],
    },
    {
      chainId: ARCHWAY.chainId,
      affiliate: [
        {
          address: 'archway1lq9la9sh5kjla8x7pg74p7djy2f74u6g6t6ags',
          basis_points_fee: DEFAULT_BPF,
        },
      ],
    },
  ],
};

export const SKIP_SUPPORTED_CHAIN_TYPE = {
  COSMOS: 'cosmos',
  ETHEREUM: 'evm',
} as const;
