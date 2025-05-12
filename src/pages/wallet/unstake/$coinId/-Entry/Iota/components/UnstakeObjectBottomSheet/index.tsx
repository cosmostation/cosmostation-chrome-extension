import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import type { IotaDelegationData } from '@/hooks/iota/useDelegations';
import { plus, toDisplayDenomAmount } from '@/utils/numbers';
import { shorterAddress } from '@/utils/string';

import {
  AmountContainer,
  Body,
  ButtonWrapper,
  Container,
  Header,
  HeaderTitle,
  LabelAttributeText,
  LabelLeftContainer,
  StakingInfoContainer,
  StakingInfoDetailContainer,
  StakingInfoRowContainer,
  StakingInfoTitleRowContainer,
  StakingInfoTitleRowRightContainer,
  StyledBottomSheet,
  StyledButton,
  StyledValidatorImage,
  TopLeftContainer,
  TopLeftContentsContainer,
  ValidatorNameContainer,
  ValueAttributeText,
} from './styled';
import UnstakeItemButton from '../../../../-components/UnstakeItemButton';

import ClassificationIcon from '@/assets/images/icons/Classification10.svg';
import Close24Icon from 'assets/images/icons/Close24.svg';

type UnstakeObjectBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentObjectId?: string;
  objects?: IotaDelegationData[];
  onClickItem: (address: string) => void;
};

export default function UnstakeObjectBottomSheet({ currentObjectId, objects, onClose, onClickItem, ...remainder }: UnstakeObjectBottomSheetProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);

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
            <Typography variant="h2_B">{t('pages.wallet.stake.$coinId.components.UnstakeObjectBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton onClick={handleClose}>
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <ButtonWrapper>
            {objects?.map((item) => {
              const isActive = item.objectId === currentObjectId;

              const shortedObjectId = shorterAddress(item.objectId, 15);
              const decimals = item.decimals || 9;
              const symbol = item.symbol || 'IOTA';

              const displayStakedAmount = toDisplayDenomAmount(item.stakedAmount || '0', decimals);
              const displayEarnedAmount = toDisplayDenomAmount(item.earnedAmount || '0', decimals);
              const displayTotalStakedAndEarned = plus(displayStakedAmount, displayEarnedAmount);

              return (
                <UnstakeItemButton
                  key={item.objectId}
                  ref={isActive ? ref : undefined}
                  isActive={isActive}
                  onClick={() => {
                    onClickItem(item.objectId);
                    handleClose();
                  }}
                  headerContent={
                    <TopLeftContentsContainer>
                      <StyledValidatorImage imageURL={item.validatorImage} />
                      <TopLeftContainer>
                        <ValidatorNameContainer>
                          <Base1300Text variant="b2_M">{item.validatorName}</Base1300Text>
                        </ValidatorNameContainer>
                        <Base1000Text variant="b4_R">
                          {t('pages.wallet.stake.$coinId.components.UnstakeObjectBottomSheet.index.objectId', {
                            objectId: shortedObjectId,
                          })}
                        </Base1000Text>
                      </TopLeftContainer>
                    </TopLeftContentsContainer>
                  }
                  bodyContent={
                    <StakingInfoContainer>
                      <StakingInfoTitleRowContainer>
                        <Base1000Text variant="b3_R">{t('pages.wallet.stake.$coinId.components.UnstakeObjectBottomSheet.index.totalStaked')}</Base1000Text>
                        <StakingInfoTitleRowRightContainer>
                          <AmountContainer>
                            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimals}>
                              {displayTotalStakedAndEarned}
                            </NumberTypo>
                            &nbsp;
                            <Base1300Text variant="h5n_M">{symbol}</Base1300Text>
                          </AmountContainer>
                        </StakingInfoTitleRowRightContainer>
                      </StakingInfoTitleRowContainer>

                      <StakingInfoDetailContainer>
                        <StakingInfoRowContainer>
                          <LabelLeftContainer>
                            <ClassificationIcon />
                            <LabelAttributeText variant="b4_R">
                              {t('pages.wallet.stake.$coinId.components.UnstakeObjectBottomSheet.index.staked')}
                            </LabelAttributeText>
                          </LabelLeftContainer>

                          <ValueAttributeText>
                            <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={decimals}>
                              {displayStakedAmount}
                            </NumberTypo>
                          </ValueAttributeText>
                        </StakingInfoRowContainer>

                        <StakingInfoRowContainer>
                          <LabelLeftContainer>
                            <ClassificationIcon />
                            <LabelAttributeText variant="b4_R">
                              {t('pages.wallet.stake.$coinId.components.UnstakeObjectBottomSheet.index.earned')}
                            </LabelAttributeText>
                          </LabelLeftContainer>

                          <ValueAttributeText>
                            <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={decimals}>
                              {displayEarnedAmount}
                            </NumberTypo>
                          </ValueAttributeText>
                        </StakingInfoRowContainer>
                      </StakingInfoDetailContainer>
                    </StakingInfoContainer>
                  }
                />
              );
            })}
          </ButtonWrapper>
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
