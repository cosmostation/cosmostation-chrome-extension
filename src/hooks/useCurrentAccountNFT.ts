import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { CosmosNFT, EvmNFT, FlatAccountNFT, IotaNFT, SuiNFT } from '@/types/nft';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useCurrentAccount } from './useCurrentAccount';

type UseCurrentAccountNFTProps =
  | {
      accountId?: string;
    }
  | undefined;

export function useCurrentAccountNFT({ accountId }: UseCurrentAccountNFTProps = {}) {
  const { currentAccount } = useCurrentAccount();

  const currentAccountId = useMemo(() => accountId || currentAccount.id, [accountId, currentAccount.id]);

  const evmNFT = useExtensionStorageStore((state) => state[`${currentAccountId}-nft-evm`]);
  const cosmosNFT = useExtensionStorageStore((state) => state[`${currentAccountId}-nft-cosmos`]);
  const suiNFT = useExtensionStorageStore((state) => state[`${currentAccountId}-nft-sui`]);
  const iotaNFT = useExtensionStorageStore((state) => state[`${currentAccountId}-nft-iota`]);
  const updateExtensionStorageStore = useExtensionStorageStore((state) => state.updateExtensionStorageStore);

  const storedAddedSuiNFTs = useMemo(() => suiNFT || [], [suiNFT]);
  const storedAddedIotaNFTs = useMemo(() => iotaNFT || [], [iotaNFT]);
  const storedAddedCosmosNFTs = useMemo(() => cosmosNFT || [], [cosmosNFT]);
  const storedAddedEVMNFTs = useMemo(() => evmNFT || [], [evmNFT]);

  const currentAccountNFTs = useMemo(() => {
    const flatNFTs = [...(evmNFT || []), ...(cosmosNFT || []), ...(suiNFT || []), ...(iotaNFT || [])];

    return {
      evm: evmNFT || [],
      cosmos: cosmosNFT || [],
      sui: suiNFT || [],
      iota: iotaNFT || [],
      flat: flatNFTs || [],
    };
  }, [cosmosNFT, evmNFT, iotaNFT, suiNFT]);

  const addSuiNFT = async (newNFT: Omit<SuiNFT, 'id'>) => {
    const isAlreadyAdded = storedAddedSuiNFTs.some(
      (item) => item.objectId.toLowerCase() === newNFT.objectId.toLowerCase() && item.chainId === newNFT.chainId && item.chainType === newNFT.chainType,
    );

    if (isAlreadyAdded) {
      return;
    }

    const nonDuplicateAddedNFTs = storedAddedSuiNFTs.filter(
      (item) => !(item.objectId.toLowerCase() === newNFT.objectId.toLowerCase() && item.chainId === newNFT.chainId && item.chainType === newNFT.chainType),
    );
    const newNFTWithId: SuiNFT = {
      id: uuidv4(),
      chainId: newNFT.chainId,
      chainType: newNFT.chainType,
      objectId: newNFT.objectId,
    };

    const updatedAddedNFTs = [...nonDuplicateAddedNFTs, newNFTWithId];

    await updateExtensionStorageStore(`${currentAccountId}-nft-sui`, updatedAddedNFTs);
  };

  const removeSuiNFT = async (id: string) => {
    const updatedNFTs = storedAddedSuiNFTs.filter((item) => item.id !== id);

    await updateExtensionStorageStore(`${currentAccountId}-nft-sui`, updatedNFTs);
  };

  const addIotaNFT = async (newNFT: Omit<IotaNFT, 'id'>) => {
    const storedAddedIotaNFTs = iotaNFT;

    const isAlreadyAdded = storedAddedIotaNFTs.some(
      (item) => item.objectId.toLowerCase() === newNFT.objectId.toLowerCase() && item.chainId === newNFT.chainId && item.chainType === newNFT.chainType,
    );

    if (isAlreadyAdded) {
      return;
    }

    const nonDuplicateAddedNFTs = storedAddedIotaNFTs.filter(
      (item) => !(item.objectId.toLowerCase() === newNFT.objectId.toLowerCase() && item.chainId === newNFT.chainId && item.chainType === newNFT.chainType),
    );
    const newNFTWithId: IotaNFT = {
      id: uuidv4(),
      chainId: newNFT.chainId,
      chainType: newNFT.chainType,
      objectId: newNFT.objectId,
    };

    const updatedAddedNFTs = [...nonDuplicateAddedNFTs, newNFTWithId];

    await updateExtensionStorageStore(`${currentAccountId}-nft-iota`, updatedAddedNFTs);
  };

  const removeIotaNFT = async (id: string) => {
    const updatedNFTs = storedAddedIotaNFTs.filter((item) => item.id !== id);

    await updateExtensionStorageStore(`${currentAccountId}-nft-iota`, updatedNFTs);
  };

  const addEVMNFT = async (newNFT: Omit<EvmNFT, 'id'>) => {
    const isAlreadyAdded = storedAddedEVMNFTs.some(
      (item) =>
        item.contractAddress.toLowerCase() === newNFT.contractAddress.toLowerCase() &&
        item.tokenId.toLowerCase() === newNFT.tokenId.toLowerCase() &&
        item.tokenType.toLowerCase() === newNFT.tokenType.toLowerCase() &&
        item.chainId === newNFT.chainId &&
        item.chainType === newNFT.chainType,
    );

    if (isAlreadyAdded) {
      return;
    }

    const nonDuplicateAddedNFTs = storedAddedEVMNFTs.filter(
      (item) =>
        !(
          item.contractAddress.toLowerCase() === newNFT.contractAddress.toLowerCase() &&
          item.tokenId.toLowerCase() === newNFT.tokenId.toLowerCase() &&
          item.tokenType.toLowerCase() === newNFT.tokenType.toLowerCase() &&
          item.chainId === newNFT.chainId &&
          item.chainType === newNFT.chainType
        ),
    );

    const newNFTWithId: EvmNFT = {
      id: uuidv4(),
      chainId: newNFT.chainId,
      chainType: newNFT.chainType,
      contractAddress: newNFT.contractAddress,
      tokenId: newNFT.tokenId,
      tokenType: newNFT.tokenType,
    };

    const updatedAddedNFTs = [...nonDuplicateAddedNFTs, newNFTWithId];

    await updateExtensionStorageStore(`${currentAccountId}-nft-evm`, updatedAddedNFTs);
  };

  const removeEVMNFT = async (id: string) => {
    const updatedNFTs = storedAddedEVMNFTs.filter((item) => item.id !== id);

    await updateExtensionStorageStore(`${currentAccountId}-nft-evm`, updatedNFTs);
  };

  const addCosmosNFT = async (newNFT: Omit<CosmosNFT, 'id'>) => {
    const isAlreadyAdded = storedAddedCosmosNFTs.some(
      (item) =>
        item.contractAddress.toLowerCase() === newNFT.contractAddress.toLowerCase() &&
        item.tokenId.toLowerCase() === newNFT.tokenId.toLowerCase() &&
        item.tokenType.toLowerCase() === newNFT.tokenType.toLowerCase() &&
        item.chainId === newNFT.chainId &&
        item.chainType === newNFT.chainType,
    );

    if (isAlreadyAdded) {
      return;
    }

    const nonDuplicateAddedNFTs = storedAddedCosmosNFTs.filter(
      (item) =>
        !(
          item.contractAddress.toLowerCase() === newNFT.contractAddress.toLowerCase() &&
          item.tokenId.toLowerCase() === newNFT.tokenId.toLowerCase() &&
          item.tokenType.toLowerCase() === newNFT.tokenType.toLowerCase() &&
          item.chainId === newNFT.chainId &&
          item.chainType === newNFT.chainType
        ),
    );

    const newNFTWithId: CosmosNFT = {
      id: uuidv4(),
      chainId: newNFT.chainId,
      chainType: newNFT.chainType,
      contractAddress: newNFT.contractAddress,
      tokenId: newNFT.tokenId,
      tokenType: newNFT.tokenType,
    };

    const updatedAddedNFTs = [...nonDuplicateAddedNFTs, newNFTWithId];

    await updateExtensionStorageStore(`${currentAccountId}-nft-cosmos`, updatedAddedNFTs);
  };

  const removeCosmosNFT = async (id: string) => {
    const updatedNFTs = storedAddedCosmosNFTs.filter((item) => item.id !== id);

    await updateExtensionStorageStore(`${currentAccountId}-nft-cosmos`, updatedNFTs);
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

  const removeNFT = async (id: string) => {
    const isCosmosNFT = storedAddedCosmosNFTs.some((item) => item.id === id);
    const isEVMNFT = storedAddedEVMNFTs.some((item) => item.id === id);
    const isSuiNFT = storedAddedSuiNFTs.some((item) => item.id === id);
    const isIotaNFT = storedAddedIotaNFTs.some((item) => item.id === id);

    if (isCosmosNFT) {
      await removeCosmosNFT(id);
    } else if (isEVMNFT) {
      await removeEVMNFT(id);
    } else if (isSuiNFT) {
      await removeSuiNFT(id);
    } else if (isIotaNFT) {
      await removeIotaNFT(id);
    }
  };

  return { currentAccountNFTs, addNFT, removeNFT };
}
