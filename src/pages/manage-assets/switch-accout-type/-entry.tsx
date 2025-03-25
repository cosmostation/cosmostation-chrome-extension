import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import InformationPanel from '@/components/InformationPanel';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentPreferAccountTypes } from '@/hooks/useCurrentPreferAccountTypes';
import { isSameChain } from '@/utils/queryParamGenerator';

import CoinTypeButton from './-components/CoinTypeButton';
import { RowContainer, StickyContainer, TopContainer } from './-styled';

export default function Entry() {
  const { t } = useTranslation();

  const { currentPreferAccountType } = useCurrentPreferAccountTypes();
  const { chainList, flatChainList } = useChainList();

  const managedChains = useMemo(
    () =>
      flatChainList.filter(
        (chain) => ![...(chainList?.customCosmosChains || []), ...(chainList?.customEvmChains || [])].some((customChain) => isSameChain(chain, customChain)),
      ),
    [chainList?.customCosmosChains, chainList?.customEvmChains, flatChainList],
  );

  const mappedAccountTypes = useMemo(
    () =>
      currentPreferAccountType &&
      Object.keys(currentPreferAccountType)
        .map((item) => {
          const chain = managedChains.find((chain) => chain.id === item);

          return {
            chain,
            accountType: currentPreferAccountType[item],
          };
        })
        .filter((item) => !!item.chain),
    [currentPreferAccountType, managedChains],
  );

  const networkCount = mappedAccountTypes?.length || 0;

  return (
    <>
      <BaseBody>
        <TopContainer>
          <InformationPanel
            varitant="info"
            title={<Typography variant="b3_M">{t('pages.manage-assets.switch-account-type.entry.info')}</Typography>}
            body={<Typography variant="b4_R_Multiline">{t('pages.manage-assets.switch-account-type.entry.infoDescription')}</Typography>}
          />
        </TopContainer>
        <StickyContainer>
          <RowContainer>
            <Base1300Text variant="h4_B">{t('pages.manage-assets.switch-account-type.entry.network')}</Base1300Text>
            <Base1000Text variant="h4_B">{networkCount}</Base1000Text>
          </RowContainer>
        </StickyContainer>
        <EdgeAligner>
          {mappedAccountTypes?.map((item) => {
            const hdPathParts = item.accountType.hdPath.split('/');
            const coinTypeLevel = item.chain?.chainType === 'bitcoin' ? hdPathParts[1] : hdPathParts[2];

            return <CoinTypeButton key={item.chain?.id} chain={item.chain!} coinTypeLevel={coinTypeLevel} />;
          })}
        </EdgeAligner>
      </BaseBody>
    </>
  );
}
