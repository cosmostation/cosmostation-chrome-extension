import { useMemo, useState } from 'react';
import type { ChainData, TokenData } from '@0xsquid/sdk/dist/types';
import { Typography } from '@mui/material';

import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import { shorterAddress } from '~/Popup/utils/string';

import AssetListBottomSheet from './components/AssetListBottomSheet';
import SwapAssetButton from './components/SwapAssetButton';
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
  headerLeftText: string;
  availableChainList?: ChainData[];
  availableCoinList?: TokenData[];
  currentSelectedChain?: ChainData;
  currentSelectedCoin?: TokenData;
  isChainSelected?: boolean;
  children?: JSX.Element;
  onClickCoin?: (clickedCoin: TokenData) => void;
  onClickChain?: (clickedChain: ChainData) => void;
};

export default function SwapCoinContainer({ ...remainder }: SwapCoinContainerProps) {
  const { chromeStorage } = useChromeStorage();
  const { currency } = chromeStorage;
  const { t } = useTranslation();

  const [isOpenedChainList, setisOpenedChainList] = useState(false);
  const [isOpenedCoinList, setisOpenedCoinList] = useState(false);

  const shortAddress = useMemo(() => shorterAddress(remainder.address, 17), [remainder.address]);
  const availableCoinAmount = '404.502';
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
              imgUrl={remainder.currentSelectedChain?.chainIconURI}
              title={remainder.currentSelectedChain?.chainName}
              placeholder="Select chain"
            />
            <SwapAssetButton
              onClick={() => {
                setisOpenedCoinList(true);
              }}
              isActive={isOpenedCoinList}
              isAvailable={remainder.isChainSelected}
              imgUrl={remainder.currentSelectedCoin?.logoURI}
              title={remainder.currentSelectedCoin?.symbol}
              placeholder="Select coin"
            />
          </SwapAssetContainer>
          {remainder.children}
        </BodyContainer>
        <FooterContainer>
          <FooterLeftContainer>
            <NumberText typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={2} currency={currency}>
              43.423
            </NumberText>
          </FooterLeftContainer>
          <FooterRightContainer>
            <Typography variant="h6"> {t('pages.Wallet.Swap.entry.availableAmount')} :</Typography>
            &nbsp;
            <Tooltip title={availableCoinAmount} arrow placement="top">
              <span>
                <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(6)}>
                  {availableCoinAmount}
                </NumberText>
              </span>
            </Tooltip>
          </FooterRightContainer>
        </FooterContainer>
      </Container>
      <AssetListBottomSheet
        type="chain"
        currentSelectedChain={remainder.currentSelectedChain}
        availableChainList={remainder.availableChainList}
        open={isOpenedChainList}
        onClose={() => setisOpenedChainList(false)}
        onClickChain={(clickedChain) => {
          remainder.onClickChain?.(clickedChain);
        }}
      />
      <AssetListBottomSheet
        type="coin"
        currentSelectedCoin={remainder.currentSelectedCoin}
        availableCoinList={remainder.availableCoinList}
        open={isOpenedCoinList}
        onClose={() => setisOpenedCoinList(false)}
        onClickCoin={(clickedCoin) => {
          remainder.onClickCoin?.(clickedCoin);
        }}
      />
    </>
  );
}