import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useChainList } from '@/hooks/useChainList';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';

import { ChainContainer, ChainImage, Container } from './styled';

type NetworkInfoProps = {
  chainId?: string;
};

export default function NetworkInfo({ chainId }: NetworkInfoProps) {
  const { t } = useTranslation();

  const { flatChainList } = useChainList();
  const chain = flatChainList.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const networkName = chainId ? chain?.name : 'Multi-Chain';
  const networkImage = chain?.image;

  return (
    <Container>
      <Base1000Text variant="b3_R">{t('pages.popup.components.NetworkInfo.index.network')}</Base1000Text>

      <ChainContainer>
        {networkImage && <ChainImage src={networkImage} />}
        <Base1300Text variant="b3_M">{networkName}</Base1300Text>
      </ChainContainer>
    </Container>
  );
}
