import { useTranslation } from 'react-i18next';

// import { useNavigate } from '@tanstack/react-router';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import History from '@/components/History';
import CoinDetailBox from '@/components/MainBox/CoinDetailBox';
import { useAccountAssets } from '@/hooks/useAccountAssets';
// import { Route as ManageStake } from '@/pages/coin-detail/$coinId/manage-stake';
import { getCoinId } from '@/utils/queryParamGenerator';

import { Container, HistoryContainer, HistorySectionTitle } from './styled';
import ContractAddress from '../components/ContractAddress';
import SectionContainer from '../components/SectionContainer';
import SectionStickyContainer from '../components/SectionStickyContainer';
import SectionWrapper from '../components/SectionWrapper';

type EVMProps = {
  coinId: string;
};

export default function EVM({ coinId }: EVMProps) {
  const { t } = useTranslation();
  // const navigate = useNavigate();

  const { data } = useAccountAssets();

  const selectedCoin = (() => {
    if (!data) return undefined;

    const aggregatedEVMAccountAssets = [...data.evmAccountAssets, ...data.evmAccountCustomAssets, ...data.erc20AccountAssets, ...data.customErc20AccountAssets];

    return aggregatedEVMAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
  })();

  const contractAddress = selectedCoin?.asset.type === 'erc20' ? selectedCoin.asset.id : undefined;

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <CoinDetailBox coinId={coinId} />

          <SectionWrapper>
            {contractAddress && (
              <SectionContainer>
                <ContractAddress contractAddress={contractAddress} />
              </SectionContainer>
            )}
            <SectionContainer>
              <SectionStickyContainer>
                <HistorySectionTitle variant="h3_B">{t('pages.coin-detail.entry.history')}</HistorySectionTitle>
              </SectionStickyContainer>
              <HistoryContainer>
                <History />
                <History />
                <History />
                <History />
                <History />
                <History />
                <History />
              </HistoryContainer>
            </SectionContainer>
          </SectionWrapper>
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
