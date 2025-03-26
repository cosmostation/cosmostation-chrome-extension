import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { isEqualsIgnoringCase } from '@/utils/string';

import ValidatorButton from './components/ValidatorItem';
import { Body, ButtonWrapper, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';
import type { UnstakeValidator } from '../..';

import Close24Icon from 'assets/images/icons/Close24.svg';

type ValidatorBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentUnstakingCoinId: string;
  currentValidatorId?: string;
  validatorList?: UnstakeValidator[];
  onClickItem: (address: string) => void;
};

export default function ValidatorBottomSheet({
  currentUnstakingCoinId,
  currentValidatorId,
  validatorList,
  onClose,
  onClickItem,
  ...remainder
}: ValidatorBottomSheetProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);

  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId: currentUnstakingCoinId });

  const currentUnstakingCoin = getCosmosAccountAsset();

  const handleClose = () => {
    onClose?.({}, 'backdropClick');
  };

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledBottomSheet {...remainder} onClose={handleClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">
              {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.components.ValidatorBottomSheet.index.title')}
            </Typography>
          </HeaderTitle>
          <StyledButton onClick={handleClose}>
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <ButtonWrapper>
            {validatorList?.map((item) => {
              const isActive = isEqualsIgnoringCase(item.validatorAddress, currentValidatorId);

              return (
                <ValidatorButton
                  key={item.validatorAddress}
                  ref={isActive ? ref : undefined}
                  isActive={isActive}
                  validatorAddress={item.validatorAddress}
                  validatorName={item.validatorName}
                  validatorImage={item.validatorImage}
                  stakedAmount={item.stakedAmount}
                  rewardAmount={item.rewardAmount}
                  rewardTokenCounts={item.rewardTokenCounts}
                  symbol={currentUnstakingCoin?.asset.symbol || ''}
                  commission={item.commission}
                  decimals={currentUnstakingCoin?.asset.decimals || 0}
                  onClick={() => {
                    onClickItem(item.validatorAddress);
                    handleClose();
                  }}
                />
              );
            })}
          </ButtonWrapper>
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
