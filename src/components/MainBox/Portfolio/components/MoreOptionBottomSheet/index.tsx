import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import { useChainList } from '@/hooks/useChainList';
import { Route as BuyCoin } from '@/pages/buy-coin';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { removeTemplateLiteral, removeTrailingSlash } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledOptionButton } from './styled';

import BabylonIcon from 'assets/images/icons/Babylon28.svg';
import BuyIcon from 'assets/images/icons/Buy28.svg';
import Close24Icon from 'assets/images/icons/Close24.svg';
import DropMoneyIcon from 'assets/images/icons/DropMoneny28.svg';
import VoteIcon from 'assets/images/icons/Vote28.svg';

type MoreOptionBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'>;

export default function MoreOptionBottomSheet({ onClose, ...remainder }: MoreOptionBottomSheetProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedChainFilterId } = useExtensionStorageStore((state) => state);
  const { chainList } = useChainList();

  const voteDappURL = useMemo(() => {
    if (!selectedChainFilterId) return 'https://www.mintscan.io/wallet/vote';

    const selectedChain = chainList.allCosmosChains.find((chain) => isMatchingUniqueChainId(chain, selectedChainFilterId));

    const voteURL = selectedChain?.explorer?.proposal;
    const formattedVoteURL = voteURL && removeTrailingSlash(removeTemplateLiteral(voteURL));

    return formattedVoteURL;
  }, [chainList.allCosmosChains, selectedChainFilterId]);

  const onHandleClose = () => {
    onClose?.({}, 'backdropClick');
  };

  return (
    <StyledBottomSheet {...remainder} onClose={onHandleClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{t('components.MainBox.Portfolio.components.MoreOptionBottomSheet.index.header')}</Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              onClose?.({}, 'escapeKeyDown');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <BaseOptionButton
            onClick={() => {
              navigate({
                to: BuyCoin.to,
              });
            }}
            leftContent={<BuyIcon />}
            leftSecondHeader={<Base1300Text variant="b2_M">{t('components.MainBox.Portfolio.components.MoreOptionBottomSheet.index.buy')}</Base1300Text>}
            leftSecondBody={
              <Base1000Text variant="b4_R">{t('components.MainBox.Portfolio.components.MoreOptionBottomSheet.index.buyDescription')}</Base1000Text>
            }
          />
          <StyledOptionButton
            disabled={!voteDappURL}
            onClick={() => {
              if (voteDappURL) {
                window.open(voteDappURL, '_blank');
              }
            }}
            leftContent={<VoteIcon />}
            leftSecondHeader={<Base1300Text variant="b2_M">{t('components.MainBox.Portfolio.components.MoreOptionBottomSheet.index.vote')}</Base1300Text>}
            leftSecondBody={
              <Base1000Text variant="b4_R">{t('components.MainBox.Portfolio.components.MoreOptionBottomSheet.index.voteDescription')}</Base1000Text>
            }
          />
          <BaseOptionButton
            onClick={() => {
              window.open('https://app.drop.money/dashboard?referral_code=dropmaga', '_blank');
            }}
            leftContent={<DropMoneyIcon />}
            leftSecondHeader={<Base1300Text variant="b2_M">{t('components.MainBox.Portfolio.components.MoreOptionBottomSheet.index.dropMoney')}</Base1300Text>}
            leftSecondBody={
              <Base1000Text variant="b4_R">{t('components.MainBox.Portfolio.components.MoreOptionBottomSheet.index.dropMoneyDescription')}</Base1000Text>
            }
          />
          <BaseOptionButton
            onClick={() => {
              window.open('https://btcstaking.babylonlabs.io/', '_blank');
            }}
            leftContent={<BabylonIcon />}
            leftSecondHeader={<Base1300Text variant="b2_M">{t('components.MainBox.Portfolio.components.MoreOptionBottomSheet.index.babylon')}</Base1300Text>}
            leftSecondBody={
              <Base1000Text variant="b4_R">{t('components.MainBox.Portfolio.components.MoreOptionBottomSheet.index.babylonDescription')}</Base1000Text>
            }
          />
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
