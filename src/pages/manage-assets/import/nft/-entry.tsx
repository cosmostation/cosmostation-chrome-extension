import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import ChainSelectBox from '@/components/ChainSelectBox/index.tsx';
import { useChainList } from '@/hooks/useChainList.ts';
import type { UniqueChainId } from '@/types/chain.ts';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator.ts';

import Cosmos from './-components/Cosmos/index.tsx';
import EVM from './-components/EVM/index.tsx';
import { Container } from './-styled.tsx';

export default function Entry() {
  const { t } = useTranslation();

  const { chainListFilteredByAccountType } = useChainList();

  const allCosmosChains = chainListFilteredByAccountType.cosmosChains?.filter((chain) => chain.isSupportCW721 || chain.isCosmwasm) || [];

  const allEVMChains = [...(chainListFilteredByAccountType.evmChains || [])];

  const mergedChainList = [...allEVMChains, ...allCosmosChains];

  const defaultChain = mergedChainList.length > 0 ? mergedChainList.find((chain) => chain.id === 'ethereum') || mergedChainList[0] : undefined;
  const defaultChainId = defaultChain ? getUniqueChainId(defaultChain) : undefined;

  const [currentChainId, setCurrentChainId] = useState<UniqueChainId | undefined>(defaultChainId);
  const currentChain = mergedChainList.find((chain) => isMatchingUniqueChainId(chain, currentChainId));

  useEffect(() => {
    if (!currentChainId) {
      setCurrentChainId(defaultChainId);
    }
  }, [currentChainId, defaultChainId]);

  return (
    <BaseBody>
      <Container>
        <ChainSelectBox
          chainList={mergedChainList}
          currentChainId={currentChainId}
          onClickChain={(chainId) => {
            setCurrentChainId(chainId);
          }}
          label={t('pages.manage-assets.import.nft.entry.network')}
          bottomSheetTitle={t('pages.manage-assets.import.nft.entry.selectNetwork')}
          bottomSheetSearchPlaceholder={t('pages.manage-assets.import.nft.entry.searchNetwork')}
        />
      </Container>
      {currentChain?.chainType === 'evm' ? (
        <EVM chainId={getUniqueChainId(currentChain)} />
      ) : currentChain?.chainType === 'cosmos' ? (
        <Cosmos chainId={getUniqueChainId(currentChain)} />
      ) : null}
    </BaseBody>
  );
}
