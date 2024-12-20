import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { Route as Stake } from '@/pages/wallet/stake/$coinId';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';

import {
  AmountContainer,
  BodyContainer,
  BodyContentsContainer,
  BottomContainer,
  RightArrowIconContainer,
  StakeButton,
  StakeIconContainer,
  TopContainer,
} from './styled';
import MainBox from '../..';

import RightArrow from '@/assets/images/icons/RightArrow14.svg';
import StakeIcon from '@/assets/images/icons/Stake22.svg';

type SuiProps = {
  coinId: string;
};

export default function Sui({ coinId }: SuiProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useAccountAssets();

  const currentCoin = data?.suiAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const symbol = currentCoin?.asset.symbol;
  const decimals = currentCoin?.asset.decimals;
  const availableAmount = toDisplayDenomAmount(currentCoin?.balance || '0', decimals || 0);

  return (
    <>
      <MainBox
        top={
          <TopContainer>
            <Base1300Text variant="h2_B">
              {t('components.MainBox.StakeDetailBox.Sui.index.title', {
                symbol: symbol,
              })}
            </Base1300Text>
          </TopContainer>
        }
        body={
          <BodyContainer>
            <BodyContentsContainer>
              <Base1000Text variant="b2_M">{t('components.MainBox.StakeDetailBox.Sui.index.available')}</Base1000Text>
              <AmountContainer>
                <NumberTypo typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={decimals}>
                  {availableAmount}
                </NumberTypo>
                &nbsp;
                <Base1300Text variant="h5n_M">{symbol}</Base1300Text>
              </AmountContainer>
            </BodyContentsContainer>
          </BodyContainer>
        }
        bottom={
          <BottomContainer>
            <StakeButton
              onClick={() => {
                navigate({
                  to: Stake.to,
                  params: { coinId: coinId },
                });
              }}
            >
              <StakeIconContainer>
                <StakeIcon />
              </StakeIconContainer>
              <Base1300Text variant="b2_B">{t('components.MainBox.StakeDetailBox.Sui.index.suiStake')}</Base1300Text>
              <RightArrowIconContainer>
                <RightArrow />
              </RightArrowIconContainer>
            </StakeButton>
          </BottomContainer>
        }
        className="circleGradient"
        coinBackgroundImage={'https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/sui/asset/sui.png'}
      />
    </>
  );
}
