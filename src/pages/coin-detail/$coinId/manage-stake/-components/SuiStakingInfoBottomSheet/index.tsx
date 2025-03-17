import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import Image from '@/components/common/Image';
import NumberTypo from '@/components/common/NumberTypo';
import { useDelegations } from '@/hooks/sui/useDelegations';
import { useGetAverageAPY } from '@/hooks/sui/useGetAverageAPY';
import { useGetLatestSuiSystemState } from '@/hooks/sui/useGetLatestSuiSystemState';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { Route as Stake } from '@/pages/wallet/stake/$coinId/$validatorAddress';
import { plus, toDisplayDenomAmount } from '@/utils/numbers';

import {
  Body,
  CoinImage,
  Container,
  ContentsContainer,
  DescriptionContentsContainer,
  DescriptionItemContainer,
  Footer,
  GreenText,
  Header,
  HeaderTitle,
  ImageContainer,
  LabelText,
  StakingInfoContainer,
  StakingInfoItem,
  StakingInfoRightItem,
  StyledBottomSheet,
  StyledButton,
  TextWrapContainer,
} from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

import apyImage from '@/assets/images/etc/apy.png';

type SuiStakingInfoBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  coinId: string;
};

export default function SuiStakingInfoBottomSheet({ coinId, onClose, ...remainder }: SuiStakingInfoBottomSheetProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { getSuiAccountAsset } = useGetAccountAsset({ coinId });
  const { suiCosmostationValidator } = useDelegations({ coinId });
  const { averageAPY } = useGetAverageAPY({ coinId });
  const { data: latestSystemState } = useGetLatestSuiSystemState({ coinId });

  const suiAccountAsset = getSuiAccountAsset();

  const displayAvailableAmount = toDisplayDenomAmount(suiAccountAsset?.balance || 0, suiAccountAsset?.asset.decimals || 0);

  const currrentEpoch = latestSystemState?.result?.epoch || 0;
  const nextEpoch = plus(currrentEpoch, 1);

  const handleConfirm = () => {
    navigate({
      to: Stake.to,
      params: {
        coinId: coinId,
        validatorAddress: suiCosmostationValidator?.suiAddress || '',
      },
    });

    onClose?.({}, 'backdropClick');
  };

  return (
    <StyledBottomSheet
      {...remainder}
      onClose={() => {
        onClose?.({}, 'backdropClick');
      }}
    >
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.header')}</Typography>
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
          <ContentsContainer>
            <DescriptionItemContainer>
              <LabelText variant="h5n_M">01</LabelText>

              <DescriptionContentsContainer>
                <Base1300Text variant="b2_M">{t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.title1')}</Base1300Text>

                <TextWrapContainer>
                  <Base1000Text variant="b4_R">{t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.subtitle1')}</Base1000Text>
                </TextWrapContainer>
              </DescriptionContentsContainer>
            </DescriptionItemContainer>

            <DescriptionItemContainer>
              <LabelText variant="h5n_M">02</LabelText>

              <DescriptionContentsContainer>
                <Base1300Text variant="b2_M">{t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.title2')}</Base1300Text>

                <TextWrapContainer>
                  <Base1000Text variant="b4_R">
                    {t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.subtitle2-1')}
                    &nbsp;
                    <span>
                      <Base1300Text variant="b4_R">
                        {t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.epoch', { epoch: currrentEpoch })}
                      </Base1300Text>
                    </span>
                    &nbsp;
                    {t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.subtitle2-2')}
                  </Base1000Text>
                </TextWrapContainer>
              </DescriptionContentsContainer>
            </DescriptionItemContainer>

            <DescriptionItemContainer>
              <LabelText variant="h5n_M">03</LabelText>

              <DescriptionContentsContainer>
                <Base1300Text variant="b2_M">{t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.title3')}</Base1300Text>

                <TextWrapContainer>
                  <Base1000Text variant="b4_R">
                    {t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.subtitle3-1')}
                    &nbsp;
                    <span>
                      <Base1300Text variant="b4_R">
                        {t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.epoch', { epoch: nextEpoch })}
                      </Base1300Text>
                    </span>
                    &nbsp;
                    {t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.subtitle3-2')}
                  </Base1000Text>
                </TextWrapContainer>
              </DescriptionContentsContainer>
            </DescriptionItemContainer>

            <DescriptionItemContainer>
              <LabelText variant="h5n_M">04</LabelText>

              <DescriptionContentsContainer>
                <Base1300Text variant="b2_M">{t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.title4')}</Base1300Text>

                <TextWrapContainer>
                  <Base1000Text variant="b4_R">{t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.subtitle4')}</Base1000Text>
                </TextWrapContainer>
              </DescriptionContentsContainer>
            </DescriptionItemContainer>
          </ContentsContainer>
        </Body>
        <Footer>
          <StakingInfoContainer>
            <StakingInfoItem>
              <CoinImage imageURL={suiAccountAsset?.asset.image} />
              <StakingInfoRightItem>
                <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.available')}</Base1000Text>

                <Base1300Text>
                  <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={suiAccountAsset?.asset.decimals || 0}>
                    {displayAvailableAmount}
                  </NumberTypo>
                </Base1300Text>
              </StakingInfoRightItem>
            </StakingInfoItem>

            <StakingInfoItem>
              <ImageContainer>
                <Image src={apyImage} />
              </ImageContainer>

              <StakingInfoRightItem>
                <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.estApr')}</Base1000Text>

                <GreenText>
                  <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={2}>
                    {averageAPY}
                  </NumberTypo>
                  <Typography variant="h7n_R">%</Typography>
                </GreenText>
              </StakingInfoRightItem>
            </StakingInfoItem>
          </StakingInfoContainer>
          <Button onClick={handleConfirm}>{t('pages.coin-detail.$coinId.manage-stake.components.SuiStakingInfoBottomSheet.index.goToSuiStake')}</Button>
        </Footer>
      </Container>
    </StyledBottomSheet>
  );
}
