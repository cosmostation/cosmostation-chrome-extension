import { useMemo, useState } from 'react';
import { Typography } from '@mui/material';

import unknownChainImg from '~/images/chainImgs/unknown.png';
import Image from '~/Popup/components/common/Image';
import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt } from '~/Popup/utils/big';
import { shorterAddress } from '~/Popup/utils/string';
import type { IntegratedSwapChain, IntegratedSwapToken } from '~/types/swap/asset';

import ChainListBottomSheet from './components/ChainListBottomSheet';
import SwapAssetButton from './components/SwapAssetButton';
import TokenListBottomSheet from './components/TokenListBottomSheet';
import {
  BodyContainer,
  Container,
  ContentCenterTextContainer,
  ContentLeftAbsoluteChainImageContainer,
  ContentLeftAbsoluteImageContainer,
  ContentLeftChainImageContainer,
  ContentLeftContainer,
  ContentLeftImageContainer,
  ContentPlaceholderContainer,
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
  balance: string;
  children: JSX.Element;
  headerLeftText: string;
  isChainAvailable?: boolean;
  isTokenAvailable: boolean;
  tokenAmountPrice: string;
  availableChainList?: IntegratedSwapChain[];
  availableTokenList?: IntegratedSwapToken[];
  currentSelectedChain?: IntegratedSwapChain;
  currentSelectedCoin?: IntegratedSwapToken;
  onClickChain?: (clickedChain: IntegratedSwapChain) => void;
  onClickCoin?: (clickedCoin: IntegratedSwapToken) => void;
};

export default function SwapCoinContainer({ isChainAvailable = true, ...remainder }: SwapCoinContainerProps) {
  const { extensionStorage } = useExtensionStorage();
  const { currency } = extensionStorage;
  const { t } = useTranslation();

  const [isOpenedChainList, setIsOpenedChainList] = useState(false);
  const [isOpenedCoinList, setIsOpenedCoinList] = useState(false);

  const shortAddress = useMemo(() => shorterAddress(remainder.address, 17), [remainder.address]);
  return (
    <>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h6">{remainder.headerLeftText}</Typography>
          </HeaderLeftContainer>
          <HeaderRightContainer>
            <Tooltip title={remainder.address} arrow placement="top">
              <Typography variant="h6">{shortAddress}</Typography>
            </Tooltip>
          </HeaderRightContainer>
        </HeaderContainer>
        <BodyContainer>
          <SwapAssetContainer>
            <SwapAssetButton
              onClick={() => {
                setIsOpenedChainList(true);
              }}
              isActive={isOpenedChainList}
              leftProps={
                <ContentLeftContainer>
                  {remainder.currentSelectedChain ? (
                    <>
                      <ContentLeftChainImageContainer>
                        <ContentLeftAbsoluteChainImageContainer>
                          <Image src={remainder.currentSelectedChain.imageURL} defaultImgSrc={unknownChainImg} />
                        </ContentLeftAbsoluteChainImageContainer>
                      </ContentLeftChainImageContainer>
                      <ContentCenterTextContainer>
                        <Typography variant="h6">{remainder.currentSelectedChain.networkName}</Typography>
                      </ContentCenterTextContainer>
                    </>
                  ) : (
                    <ContentPlaceholderContainer data-is-disabled={!isChainAvailable}>
                      <Typography variant="h6">{t('pages.Wallet.Swap.components.SwapCoinContainer.index.selectChain')}</Typography>
                    </ContentPlaceholderContainer>
                  )}
                </ContentLeftContainer>
              }
              isAvailable={isChainAvailable}
            />
            <SwapAssetButton
              onClick={() => {
                setIsOpenedCoinList(true);
              }}
              isActive={isOpenedCoinList}
              leftProps={
                <ContentLeftContainer>
                  {remainder.currentSelectedCoin ? (
                    <>
                      <ContentLeftImageContainer>
                        <ContentLeftAbsoluteImageContainer>
                          <Image src={remainder.currentSelectedCoin.imageURL} />
                        </ContentLeftAbsoluteImageContainer>
                      </ContentLeftImageContainer>
                      <ContentCenterTextContainer>
                        <Typography variant="h6">{remainder.currentSelectedCoin.displayDenom}</Typography>
                      </ContentCenterTextContainer>
                    </>
                  ) : (
                    <ContentPlaceholderContainer data-is-disabled={!remainder.isTokenAvailable}>
                      <Typography variant="h6">{t('pages.Wallet.Swap.components.SwapCoinContainer.index.selectCoin')}</Typography>
                    </ContentPlaceholderContainer>
                  )}
                </ContentLeftContainer>
              }
              isAvailable={remainder.isTokenAvailable}
            />
          </SwapAssetContainer>

          {remainder.children}
        </BodyContainer>
        <FooterContainer>
          <FooterLeftContainer>
            {gt(remainder.tokenAmountPrice, '0') && (
              <div>
                <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2} currency={currency}>
                  {remainder.tokenAmountPrice}
                </NumberText>
              </div>
            )}
          </FooterLeftContainer>
          <FooterRightContainer>
            <Typography variant="h6n"> {t('pages.Wallet.Swap.components.SwapCoinContainer.index.balance')} :</Typography>
            &nbsp;
            <Tooltip title={remainder.balance} arrow placement="top">
              <span>
                <NumberText typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={gt(remainder.balance, '0') ? 6 : 0}>
                  {remainder.balance}
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
        onClose={() => setIsOpenedChainList(false)}
        onClickChain={(clickedChain) => {
          remainder.onClickChain?.(clickedChain);
        }}
      />
      <TokenListBottomSheet
        currentSelectedChain={remainder.currentSelectedChain}
        currentSelectedToken={remainder.currentSelectedCoin}
        availableTokenList={remainder.availableTokenList}
        open={isOpenedCoinList}
        onClose={() => setIsOpenedCoinList(false)}
        onClickToken={(clickedCoin) => {
          remainder.onClickCoin?.(clickedCoin);
        }}
      />
    </>
  );
}
