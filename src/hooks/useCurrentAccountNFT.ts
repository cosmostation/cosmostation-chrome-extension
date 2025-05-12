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
  const { updateExtensionStorageStore, ...storeData } = useExtensionStorageStore((state) => state);

  const currentAccountId = useMemo(() => accountId || currentAccount.id, [accountId, currentAccount.id]);

  const currentAccountNFTs = useMemo(() => {
    const evmNFT = storeData[`${currentAccountId}-nft-evm`] || [];
    const cosmosNFT = storeData[`${currentAccountId}-nft-cosmos`] || [];
    const suiNFT = storeData[`${currentAccountId}-nft-sui`] || [];
    const iotaNFT = storeData[`${currentAccountId}-nft-iota`] || [];

    const flatNFTs = [...(evmNFT || []), ...(cosmosNFT || []), ...(suiNFT || []), ...(iotaNFT || [])];

    return {
      evm: evmNFT,
      cosmos: cosmosNFT,
      sui: suiNFT,
      iota: iotaNFT,
      flat: flatNFTs,
    };
  }, [currentAccountId, storeData]);

  const addSuiNFT = async (newNFT: Omit<SuiNFT, 'id'>) => {
    const storedAddedSuiNFTs = storeData[`${currentAccountId}-nft-sui`] || [];

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
    const storedAddedSuiNFTs = storeData[`${currentAccountId}-nft-sui`] || [];

    const updatedNFTs = storedAddedSuiNFTs.filter((item) => item.id !== id);

    await updateExtensionStorageStore(`${currentAccountId}-nft-sui`, updatedNFTs);
  };

  const addIotaNFT = async (newNFT: Omit<IotaNFT, 'id'>) => {
    const storedAddedIotaNFTs = storeData[`${currentAccountId}-nft-iota`] || [];

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
    const storedAddedIotaNFTs = storeData[`${currentAccountId}-nft-iota`] || [];

    const updatedNFTs = storedAddedIotaNFTs.filter((item) => item.id !== id);

    await updateExtensionStorageStore(`${currentAccountId}-nft-iota`, updatedNFTs);
  };

  const addEVMNFT = async (newNFT: Omit<EvmNFT, 'id'>) => {
    const storedAddedEVMNFTs = storeData[`${currentAccountId}-nft-evm`] || [];

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
    const storedAddedSuiNFTs = storeData[`${currentAccountId}-nft-evm`] || [];

    const updatedNFTs = storedAddedSuiNFTs.filter((item) => item.id !== id);

    await updateExtensionStorageStore(`${currentAccountId}-nft-evm`, updatedNFTs);
  };

  const addCosmosNFT = async (newNFT: Omit<CosmosNFT, 'id'>) => {
    const storedAddedCosmosNFTs = storeData[`${currentAccountId}-nft-cosmos`] || [];

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
    const storedAddedCosmosNFTs = storeData[`${currentAccountId}-nft-cosmos`] || [];

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
    const storedAddedCosmosNFTs = storeData[`${currentAccountId}-nft-cosmos`] || [];
    const storedAddedEVMNFTs = storeData[`${currentAccountId}-nft-evm`] || [];
    const storedAddedSuiNFTs = storeData[`${currentAccountId}-nft-sui`] || [];
    const storedAddedIotaNFTs = storeData[`${currentAccountId}-nft-iota`] || [];

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
