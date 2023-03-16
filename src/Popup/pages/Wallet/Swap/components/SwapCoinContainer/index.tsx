import { useMemo, useState } from 'react';
import { Typography } from '@mui/material';

import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import { shorterAddress } from '~/Popup/utils/string';
import type { IntegratedSwapChain, IntegratedSwapToken } from '~/types/swap/asset';

import ChainListBottomSheet from './components/ChainListBottomSheet';
import SwapAssetButton from './components/SwapAssetButton';
import TokenListBottomSheet from './components/TokenListBottomSheet';
import {
  BodyContainer,
  Container,
  FooterContainer,
  FooterLeftContainer,
  FooterRightContainer,
  HeaderContainer,
  HeaderLeftContainer,
  HeaderRightContainer,
  SwapAssetContainer,
} from './styled';

type SwapCoinContainerProps = {
  address: string;
  coinAmountPrice: string;
  headerLeftText: string;
  availableAmount?: string;
  availableChainList?: IntegratedSwapChain[];
  availableCoinList?: IntegratedSwapToken[];
  currentSelectedChain?: IntegratedSwapChain;
  currentSelectedCoin?: IntegratedSwapToken;
  isChainSelected?: boolean;
  children?: JSX.Element;
  onClickCoin?: (clickedCoin: IntegratedSwapToken) => void;
  onClickChain?: (clickedChain: IntegratedSwapChain) => void;
};

export default function SwapCoinContainer({ ...remainder }: SwapCoinContainerProps) {
  const { chromeStorage } = useChromeStorage();
  const { currency } = chromeStorage;
  const { t } = useTranslation();

  const [isOpenedChainList, setisOpenedChainList] = useState(false);
  const [isOpenedCoinList, setisOpenedCoinList] = useState(false);

  const shortAddress = useMemo(() => shorterAddress(remainder.address, 17), [remainder.address]);
  return (
    <>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h6">{remainder.headerLeftText}</Typography>
          </HeaderLeftContainer>
          <HeaderRightContainer>
            <Tooltip title={remainder.address || ''} arrow placement="top">
              <Typography variant="h6">{shortAddress}</Typography>
            </Tooltip>
          </HeaderRightContainer>
        </HeaderContainer>
        <BodyContainer>
          <SwapAssetContainer>
            <SwapAssetButton
              onClick={() => {
                setisOpenedChainList(true);
              }}
              isActive={isOpenedChainList}
              imgUrl={remainder.currentSelectedChain?.imageURL}
              title={remainder.currentSelectedChain?.networkName}
              placeholder={t('pages.Wallet.Swap.components.SwapCoinContainer.index.selectChain')}
            />
            <SwapAssetButton
              onClick={() => {
                setisOpenedCoinList(true);
              }}
              isActive={isOpenedCoinList}
              isAvailable={remainder.isChainSelected}
              imgUrl={remainder.currentSelectedCoin?.logoURI}
              title={remainder.currentSelectedCoin?.symbol}
              placeholder={t('pages.Wallet.Swap.components.SwapCoinContainer.index.selectCoin')}
            />
          </SwapAssetContainer>
          {remainder.children}
        </BodyContainer>
        <FooterContainer>
          <FooterLeftContainer>
            <NumberText typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={2} currency={currency}>
              {remainder.coinAmountPrice}
            </NumberText>
          </FooterLeftContainer>
          <FooterRightContainer>
            <Typography variant="h6n"> {t('pages.Wallet.Swap.components.SwapCoinContainer.index.balance')} :</Typography>
            &nbsp;
            <Tooltip title={remainder.availableAmount || ''} arrow placement="top">
              <span>
                <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={gt(remainder.availableAmount || '0', '0') ? getDisplayMaxDecimals(6) : 0}>
                  {remainder.availableAmount}
                </NumberText>
              </span>
            </Tooltip>
          </FooterRightContainer>
        </FooterContainer>
      </Container>
      <ChainListBottomSheet
        currentSelectedChain={remainder.currentSelectedChain}
        availableChainList={remainder.availableChainList}
        open={isOpenedChainList}
        onClose={() => setisOpenedChainList(false)}
        onClickChain={(clickedChain) => {
          remainder.onClickChain?.(clickedChain);
        }}
      />
      <TokenListBottomSheet
        currentSelectedChain={remainder.currentSelectedChain}
        currentSelectedToken={remainder.currentSelectedCoin}
        availableTokenList={remainder.availableCoinList}
        open={isOpenedCoinList}
        onClose={() => setisOpenedCoinList(false)}
        onClickToken={(clickedCoin) => {
          remainder.onClickCoin?.(clickedCoin);
        }}
      />
    </>
  );
}
