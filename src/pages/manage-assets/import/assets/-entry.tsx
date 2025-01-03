import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import ChainSelectBox from '@/components/ChainSelectBox/index.tsx';
import { useChainList } from '@/hooks/useChainList.ts';
import type { UniqueChainId } from '@/types/chain.ts';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator.ts';

import CW20 from './-components/CW20/index.tsx';
import ERC20 from './-components/ERC20/index.tsx';
import { Container } from './-styled.tsx';

export default function Entry() {
  const { t } = useTranslation();

  const { chainList } = useChainList();

  // FIXME Shido케이스 핸들링 필요., 커스텀 체인도 리스팅되도록 로직 수정 필요
  const allCosmosChains = [...(chainList?.cosmosChains || []), ...chainList.customCosmosChains];
  const allEVMChains = [...(chainList?.evmChains || []), ...chainList.customEvmChains];

  const mergedChainList = [...allEVMChains, ...(allCosmosChains?.filter((chain) => chain.isCosmwasm) || [])];

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
          label={t('pages.manage-assets.import.assets.entry.network')}
          bottomSheetTitle={t('pages.manage-assets.import.assets.entry.selectNetwork')}
          bottomSheetSearchPlaceholder={t('pages.manage-assets.import.assets.entry.searchNetwork')}
        />
      </Container>
      {currentChain?.chainType === 'evm' ? (
        <ERC20 chainId={getUniqueChainId(currentChain)} />
      ) : currentChain?.chainType === 'cosmos' && currentChain?.isCosmwasm ? (
        <CW20 chainId={getUniqueChainId(currentChain)} />
      ) : null}
    </BaseBody>
  );
}
