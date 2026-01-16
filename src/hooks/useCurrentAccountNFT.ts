import { useMemo } from 'react';

import type { ChainType } from '@/types/chain';
import type { CosmosNFT, EvmNFT, FlatAccountNFT, IotaNFT, SuiNFT } from '@/types/nft';

import { useAccountNFTMutations } from './queries/useAccountNFTMutations';
import { useAccountNFTQuery } from './queries/useAccountNFTQuery';
import { useCurrentAccount } from './useCurrentAccount';

type UseCurrentAccountNFTProps =
  | {
      accountId?: string;
    }
  | undefined;

export function useCurrentAccountNFT({ accountId }: UseCurrentAccountNFTProps = {}) {
  const { currentAccount } = useCurrentAccount();

  const currentAccountId = useMemo(() => accountId || currentAccount.id, [accountId, currentAccount.id]);

  const { data: nftData } = useAccountNFTQuery(currentAccountId);
  const mutations = useAccountNFTMutations(currentAccountId);

  const currentAccountNFTs = useMemo(() => {
    if (!nftData) {
      return {
        evm: [],
        cosmos: [],
        sui: [],
        iota: [],
        flat: [],
      };
    }

    const flatNFTs = [...nftData.evm, ...nftData.cosmos, ...nftData.sui, ...nftData.iota];

    return {
      evm: nftData.evm,
      cosmos: nftData.cosmos,
      sui: nftData.sui,
      iota: nftData.iota,
      flat: flatNFTs,
    };
  }, [nftData]);

  const addSuiNFT = async (newNFT: Omit<SuiNFT, 'id'>) => {
    mutations.addSuiNFT({ newNFT });
  };

  const removeSuiNFT = async (id: string) => {
    mutations.removeSuiNFT({ id });
  };

  const addIotaNFT = async (newNFT: Omit<IotaNFT, 'id'>) => {
    mutations.addIotaNFT({ newNFT });
  };

  const removeIotaNFT = async (id: string) => {
    mutations.removeIotaNFT({ id });
  };

  const addEVMNFT = async (newNFT: Omit<EvmNFT, 'id'>) => {
    mutations.addEVMNFT({ newNFT });
  };

  const removeEVMNFT = async (id: string) => {
    mutations.removeEVMNFT({ id });
  };

  const addCosmosNFT = async (newNFT: Omit<CosmosNFT, 'id'>) => {
    mutations.addCosmosNFT({ newNFT });
  };

  const removeCosmosNFT = async (id: string) => {
    mutations.removeCosmosNFT({ id });
  };

  const addNFT = async (newNFT: Omit<FlatAccountNFT, 'id'>) => {
    if (newNFT.chainType === 'evm') {
      await addEVMNFT(newNFT as Omit<EvmNFT, 'id'>);
    } else if (newNFT.chainType === 'cosmos') {
      await addCosmosNFT(newNFT as Omit<CosmosNFT, 'id'>);
    } else if (newNFT.chainType === 'sui') {
      await addSuiNFT(newNFT as Omit<SuiNFT, 'id'>);
    } else if (newNFT.chainType === 'iota') {
      await addIotaNFT(newNFT as Omit<IotaNFT, 'id'>);
    }
  };

  const removeNFT = async (id: string, chainType: ChainType) => {
    if (chainType === 'evm') {
      await removeEVMNFT(id);
    } else if (chainType === 'cosmos') {
      await removeCosmosNFT(id);
    } else if (chainType === 'sui') {
      await removeSuiNFT(id);
    } else if (chainType === 'iota') {
      await removeIotaNFT(id);
    }
  };

  return { currentAccountNFTs, addNFT, removeNFT };
}
