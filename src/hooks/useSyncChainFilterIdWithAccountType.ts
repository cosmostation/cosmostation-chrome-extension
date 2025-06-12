import type { ChainAccountType } from '@/types/chain';
import { getUniqueChainIdWithManual, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

export function useSyncChainFilterIdWithAccountType() {
  const { selectedChainFilterId, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const syncChainFilterIdWithAccountType = async (chainPreferAccountType: ChainAccountType) => {
    const currentParsedChainFilterId = selectedChainFilterId && parseUniqueChainId(selectedChainFilterId);

    const isMoveEVMtoCosmos = chainPreferAccountType.pubkeyStyle === 'secp256k1' && currentParsedChainFilterId?.chainType === 'evm';
    const isMoveCosmosToEVM = chainPreferAccountType.pubkeyStyle === 'keccak256' && currentParsedChainFilterId?.chainType === 'cosmos';

    if (isMoveEVMtoCosmos) {
      const updatedChainFilterId = getUniqueChainIdWithManual(currentParsedChainFilterId.id, 'cosmos');
      await updateExtensionStorageStore('selectedChainFilterId', updatedChainFilterId);
    }

    if (isMoveCosmosToEVM) {
      const updatedChainFilterId = getUniqueChainIdWithManual(currentParsedChainFilterId.id, 'evm');
      await updateExtensionStorageStore('selectedChainFilterId', updatedChainFilterId);
    }
  };

  return { syncChainFilterIdWithAccountType };
}
