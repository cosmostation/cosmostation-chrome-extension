import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';
import EmptyAsset from '@/components/EmptyAsset';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';

import { Container, EmptyAssetContainer, IconContainer } from './styled';

import ExplorerIcon from '@/assets/images/icons/Explorer14.svg';
import NoSearchIcon from '@/assets/images/icons/NoSearch70.svg';

type SolanaAccountTxHistory = {
  coinId: string;
};

export default function SolanaAccountTxHistory({ coinId }: SolanaAccountTxHistory) {
  const { t } = useTranslation();

  const { getSolanaAccountAsset } = useGetAccountAsset({ coinId });
  const selectedAsset = getSolanaAccountAsset();

  const accountExplorerUrl = selectedAsset?.chain.explorer.account
    ? selectedAsset.chain.explorer.account.replace('${address}', selectedAsset.address.address)
    : '';

  return (
    <Container>
      <EmptyAssetContainer>
        <EmptyAsset
          icon={<NoSearchIcon />}
          title={t('components.AccountTxHistory.components.Solana.index.NoHistoryTitle')}
          subTitle={t('components.AccountTxHistory.components.Solana.index.NoHistorySubTitle')}
          chipButtonProps={
            accountExplorerUrl
              ? {
                  onClick: () => {
                    window.open(accountExplorerUrl, '_blank');
                  },
                  children: (
                    <>
                      <IconContainer>
                        <ExplorerIcon />
                      </IconContainer>
                      <Base1300Text variant="b3_M">{t('components.AccountTxHistory.components.Solana.index.goToExplorer')}</Base1300Text>
                    </>
                  ),
                }
              : undefined
          }
        />
      </EmptyAssetContainer>
    </Container>
  );
}
