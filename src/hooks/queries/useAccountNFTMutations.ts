import { v4 as uuidv4 } from 'uuid';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CosmosNFT, EvmNFT, IotaNFT, SuiNFT } from '@/types/nft';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';

export function useAccountNFTMutations(accountId: string) {
  const queryClient = useQueryClient();

  const invalidateNFTs = () => {
    void queryClient.invalidateQueries({ queryKey: ['account-nft', accountId] });
  };

  const addSuiNFTMutation = useMutation({
    mutationFn: async ({ newNFT }: { newNFT: Omit<SuiNFT, 'id'> }) => {
      const currentStoredNFTs = (await getExtensionLocalStorage(`${accountId}-nft-sui`)) || [];

      const isAlreadyAdded = currentStoredNFTs.some(
        (item) => item.objectId.toLowerCase() === newNFT.objectId.toLowerCase() && item.chainId === newNFT.chainId && item.chainType === newNFT.chainType,
      );

      if (isAlreadyAdded) {
        return;
      }

      const newNFTWithId: SuiNFT = {
        id: uuidv4(),
        chainId: newNFT.chainId,
        chainType: newNFT.chainType,
        objectId: newNFT.objectId,
      };

      const updatedAddedNFTs = [...currentStoredNFTs, newNFTWithId];

      await setExtensionLocalStorage(`${accountId}-nft-sui`, updatedAddedNFTs);
    },
    onSuccess: invalidateNFTs,
  });

  const removeSuiNFTMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const currentStoredNFTs = (await getExtensionLocalStorage(`${accountId}-nft-sui`)) || [];

      const updatedNFTs = currentStoredNFTs.filter((item) => item.id !== id);
      await setExtensionLocalStorage(`${accountId}-nft-sui`, updatedNFTs);
    },
    onSuccess: invalidateNFTs,
  });

  const addIotaNFTMutation = useMutation({
    mutationFn: async ({ newNFT }: { newNFT: Omit<IotaNFT, 'id'> }) => {
      const currentStoredNFTs = (await getExtensionLocalStorage(`${accountId}-nft-iota`)) || [];

      const isAlreadyAdded = currentStoredNFTs.some(
        (item) => item.objectId.toLowerCase() === newNFT.objectId.toLowerCase() && item.chainId === newNFT.chainId && item.chainType === newNFT.chainType,
      );

      if (isAlreadyAdded) {
        return;
      }

      const newNFTWithId: IotaNFT = {
        id: uuidv4(),
        chainId: newNFT.chainId,
        chainType: newNFT.chainType,
        objectId: newNFT.objectId,
      };
      const updatedAddedNFTs = [...currentStoredNFTs, newNFTWithId];

      await setExtensionLocalStorage(`${accountId}-nft-iota`, updatedAddedNFTs);
    },
    onSuccess: invalidateNFTs,
  });

  const removeIotaNFTMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const currentStoredNFTs = (await getExtensionLocalStorage(`${accountId}-nft-iota`)) || [];

      const updatedNFTs = currentStoredNFTs.filter((item) => item.id !== id);
      await setExtensionLocalStorage(`${accountId}-nft-iota`, updatedNFTs);
    },
    onSuccess: invalidateNFTs,
  });

  const addEVMNFTMutation = useMutation({
    mutationFn: async ({ newNFT }: { newNFT: Omit<EvmNFT, 'id'> }) => {
      const currentStoredNFTs = (await getExtensionLocalStorage(`${accountId}-nft-evm`)) || [];

      const isAlreadyAdded = currentStoredNFTs.some(
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

      const newNFTWithId: EvmNFT = {
        id: uuidv4(),
        chainId: newNFT.chainId,
        chainType: newNFT.chainType,
        contractAddress: newNFT.contractAddress,
        tokenId: newNFT.tokenId,
        tokenType: newNFT.tokenType,
      };

      const updatedAddedNFTs = [...currentStoredNFTs, newNFTWithId];

      await setExtensionLocalStorage(`${accountId}-nft-evm`, updatedAddedNFTs);
    },
    onSuccess: invalidateNFTs,
  });

  const removeEVMNFTMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const currentStoredNFTs = (await getExtensionLocalStorage(`${accountId}-nft-evm`)) || [];

      const updatedNFTs = currentStoredNFTs.filter((item) => item.id !== id);
      await setExtensionLocalStorage(`${accountId}-nft-evm`, updatedNFTs);
    },
    onSuccess: invalidateNFTs,
  });

  const addCosmosNFTMutation = useMutation({
    mutationFn: async ({ newNFT }: { newNFT: Omit<CosmosNFT, 'id'> }) => {
      const currentStoredNFTs = (await getExtensionLocalStorage(`${accountId}-nft-cosmos`)) || [];

      const isAlreadyAdded = currentStoredNFTs.some(
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

      const newNFTWithId: CosmosNFT = {
        id: uuidv4(),
        chainId: newNFT.chainId,
        chainType: newNFT.chainType,
        contractAddress: newNFT.contractAddress,
        tokenId: newNFT.tokenId,
        tokenType: newNFT.tokenType,
      };

      const updatedAddedNFTs = [...currentStoredNFTs, newNFTWithId];

      await setExtensionLocalStorage(`${accountId}-nft-cosmos`, updatedAddedNFTs);
    },
    onSuccess: invalidateNFTs,
  });

  const removeCosmosNFTMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const currentStoredNFTs = ((await getExtensionLocalStorage(`${accountId}-nft-cosmos`)) as CosmosNFT[]) || [];

      const updatedNFTs = currentStoredNFTs.filter((item) => item.id !== id);

      await setExtensionLocalStorage(`${accountId}-nft-cosmos`, updatedNFTs);
    },
    onSuccess: invalidateNFTs,
  });
  return {
    addSuiNFT: addSuiNFTMutation.mutateAsync,
    removeSuiNFT: removeSuiNFTMutation.mutateAsync,
    addIotaNFT: addIotaNFTMutation.mutateAsync,
    removeIotaNFT: removeIotaNFTMutation.mutateAsync,
    addEVMNFT: addEVMNFTMutation.mutateAsync,
    removeEVMNFT: removeEVMNFTMutation.mutateAsync,
    addCosmosNFT: addCosmosNFTMutation.mutateAsync,
    removeCosmosNFT: removeCosmosNFTMutation.mutateAsync,
  };
}
