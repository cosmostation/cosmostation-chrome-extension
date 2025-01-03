import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import ChainSelectBox from '@/components/ChainSelectBox';
import type { ChainType, UniqueChainId } from '@/types/chain';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';

import Cosmos from './-components/Cosmos';
import EVM from './-components/EVM';
import { Container } from './-styled';

import CosmosImage from '@/assets/images/chain/cosmos.png';
import EVMImage from '@/assets/images/chain/evm.png';

export const UNIVERSAL_NETWORK_ID = 'universal';

export default function Entry() {
  const { t } = useTranslation();

  const baseChainList = [
    {
      id: UNIVERSAL_NETWORK_ID,
      name: 'Cosmos Network',
      image: CosmosImage,
      chainType: 'cosmos' as ChainType,
    },
    {
      id: UNIVERSAL_NETWORK_ID,
      name: 'EVM Network',
      image: EVMImage,
      chainType: 'evm' as ChainType,
    },
  ];

  const [currentChainId, setCurrentChainId] = useState<UniqueChainId | undefined>(getUniqueChainId(baseChainList[0]));

  const currentChain = baseChainList.find((chain) => isMatchingUniqueChainId(chain, currentChainId));

  return (
    <BaseBody>
      <Container>
        <ChainSelectBox
          chainList={baseChainList}
          currentChainId={currentChainId}
          onClickChain={(chainId) => {
            setCurrentChainId(chainId);
          }}
          label={t('pages.manage-assets.import.network.entry.network')}
          bottomSheetTitle={t('pages.manage-assets.import.network.entry.selectNetwork')}
          bottomSheetSearchPlaceholder={t('pages.manage-assets.import.network.entry.searchNetwork')}
        />
      </Container>
      {currentChain?.chainType === 'evm' ? <EVM /> : currentChain?.chainType === 'cosmos' ? <Cosmos /> : null}
    </BaseBody>
  );
}
