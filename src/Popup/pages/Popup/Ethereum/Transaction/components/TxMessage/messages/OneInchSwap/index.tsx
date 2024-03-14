import { useMemo } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useOneInchTokensSWR } from '~/Popup/hooks/SWR/integratedSwap/oneInch/SWR/useOneInchTokensSWR';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayDenomAmount } from '~/Popup/utils/big';
import { getCapitalize, getDisplayMaxDecimals } from '~/Popup/utils/common';
import { isEqualsIgnoringCase, shorterAddress } from '~/Popup/utils/string';
import type { OneInchSwapTxData } from '~/types/1inch/contract';

import CoinAmountInfoContainer from './components/CoinAmountInfoContainer';
import {
  ContentContainer,
  ContentItemContainer,
  DenomContainer,
  HeaderContainer,
  ImageContainer,
  LabelContainer,
  RightColumnContainer,
  StyledDivider,
  SwapTokenContainer,
  SwapTxMessageContainer,
  SwapTxMessageContentContainer,
  TokenAmountContainer,
  TokenContainer,
  ValueContainer,
} from './styled';
import Container from '../../components/Container';
import CopyButton from '../../components/CopyButton';
import type { TxMessageProps } from '../../index';

import SwapArrowIcon from '~/images/icons/SwapArrow.svg';

type OneInchSwapProps = TxMessageProps;

export default function OneInchSwap({ tx, determineTxType }: OneInchSwapProps) {
  const { t } = useTranslation();

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { data: oneInchTokens } = useOneInchTokensSWR(String(parseInt(currentEthereumNetwork.chainId, 16)));

  const { to, data } = tx;

  const args = determineTxType?.type === 'swap' ? (determineTxType?.txDescription?.args as unknown as OneInchSwapTxData) : undefined;

  const receiverAddress = useMemo(() => args?.desc.dstReceiver, [args?.desc.dstReceiver]);

  const srcToken = useMemo(() => oneInchTokens.find((item) => isEqualsIgnoringCase(item.address, args?.desc.srcToken)), [args?.desc.srcToken, oneInchTokens]);

  const dstToken = useMemo(() => oneInchTokens.find((item) => isEqualsIgnoringCase(item.address, args?.desc.dstToken)), [args?.desc.dstToken, oneInchTokens]);

  const inputDisplayAmount = useMemo(
    () => String(parseFloat(toDisplayDenomAmount(BigInt(args?.desc?.amount || '0').toString(10), srcToken?.decimals || 0))),
    [args?.desc.amount, srcToken?.decimals],
  );

  const expectedOutputDisplayMinAmount = useMemo(
    () => String(parseFloat(toDisplayDenomAmount(args?.desc.minReturnAmount || '0', dstToken?.decimals || 0))),
    [args?.desc.minReturnAmount, dstToken?.decimals],
  );

  if (args) {
    return (
      <SwapTxMessageContainer>
        <HeaderContainer>
          <CoinAmountInfoContainer coinImg={srcToken?.logoURI} displayDenom={srcToken?.symbol} displayAmount={inputDisplayAmount} />
          <SwapArrowIcon />
          <CoinAmountInfoContainer coinImg={dstToken?.logoURI} displayDenom={dstToken?.symbol} displayAmount={expectedOutputDisplayMinAmount} isTilde />
        </HeaderContainer>
        <StyledDivider />
        <SwapTxMessageContentContainer>
          <ContentItemContainer>
            <SwapTokenContainer>
              <div>
                <LabelContainer>
                  <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.fromToken')}</Typography>
                </LabelContainer>
                <ValueContainer>
                  <TokenContainer>
                    <ImageContainer>
                      <Image src={srcToken?.logoURI} />
                    </ImageContainer>
                    <DenomContainer>
                      <Tooltip title={srcToken?.name || ''} arrow placement="top">
                        <Typography variant="h5">{srcToken?.name}</Typography>
                      </Tooltip>
                    </DenomContainer>
                  </TokenContainer>
                </ValueContainer>
              </div>
              <RightColumnContainer>
                <LabelContainer>
                  <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.swapAmount')}</Typography>
                </LabelContainer>
                <ValueContainer>
                  <TokenAmountContainer>
                    <Tooltip title={inputDisplayAmount} arrow placement="top">
                      <span>
                        <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(srcToken?.decimals)}>
                          {inputDisplayAmount}
                        </Number>
                      </span>
                    </Tooltip>
                    <DenomContainer>
                      <Tooltip title={srcToken?.symbol || ''} arrow placement="top">
                        <Typography variant="h5">{srcToken?.symbol}</Typography>
                      </Tooltip>
                    </DenomContainer>
                  </TokenAmountContainer>
                </ValueContainer>
              </RightColumnContainer>
            </SwapTokenContainer>
          </ContentItemContainer>

          <ContentItemContainer sx={{ marginTop: '1.2rem' }}>
            <SwapTokenContainer>
              <div>
                <LabelContainer>
                  <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.toToken')}</Typography>
                </LabelContainer>
                <ValueContainer>
                  <TokenContainer>
                    <ImageContainer>
                      <Image src={dstToken?.logoURI} />
                    </ImageContainer>
                    <DenomContainer>
                      <Tooltip title={dstToken?.name || ''} arrow placement="top">
                        <Typography variant="h5">{dstToken?.name}</Typography>
                      </Tooltip>
                    </DenomContainer>
                  </TokenContainer>
                </ValueContainer>
              </div>
              <RightColumnContainer>
                <LabelContainer>
                  <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.expectedOutput')}</Typography>
                </LabelContainer>
                <ValueContainer>
                  <TokenAmountContainer>
                    <Typography variant="h5n">≈</Typography>
                    <Tooltip title={expectedOutputDisplayMinAmount} arrow placement="top">
                      <span>
                        <Number typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(dstToken?.decimals || 0)}>
                          {expectedOutputDisplayMinAmount}
                        </Number>
                      </span>
                    </Tooltip>
                    <DenomContainer>
                      <Tooltip title={dstToken?.symbol || ''} arrow placement="top">
                        <Typography variant="h5">{dstToken?.symbol}</Typography>
                      </Tooltip>
                    </DenomContainer>
                  </TokenAmountContainer>
                </ValueContainer>
              </RightColumnContainer>
            </SwapTokenContainer>
          </ContentItemContainer>

          <ContentItemContainer sx={{ marginTop: '1.2rem' }}>
            <LabelContainer>
              <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.receiverAddress')}</Typography>
              <CopyButton text={receiverAddress} />
            </LabelContainer>
            <ValueContainer>
              <Typography variant="h5">{shorterAddress(receiverAddress, 32)}</Typography>
            </ValueContainer>
          </ContentItemContainer>

          <ContentItemContainer sx={{ marginTop: '0.8rem' }}>
            <LabelContainer>
              <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.contractMethod')}</Typography>
            </LabelContainer>
            <ValueContainer>
              <Typography variant="h5">{`${getCapitalize(determineTxType?.txDescription?.name || 'swap')} (1inch)`}</Typography>
            </ValueContainer>
          </ContentItemContainer>

          <ContentItemContainer sx={{ marginTop: '0.8rem' }}>
            <LabelContainer>
              <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.contractAddress')}</Typography>
              <CopyButton text={to} />
            </LabelContainer>
            <ValueContainer>
              <Typography variant="h5">{shorterAddress(to, 32)}</Typography>
            </ValueContainer>
          </ContentItemContainer>
        </SwapTxMessageContentContainer>
      </SwapTxMessageContainer>
    );
  }

  return (
    <Container title={`${getCapitalize(determineTxType?.txDescription?.name || 'swap')} (1inch)`}>
      <ContentContainer>
        <ContentItemContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.contractAddress')}</Typography>
            <CopyButton text={to} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(to, 32)}</Typography>
          </ValueContainer>
        </ContentItemContainer>

        <ContentItemContainer sx={{ marginTop: '0.8rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Interact.index.data')}</Typography>
            <CopyButton text={data} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{data}</Typography>
          </ValueContainer>
        </ContentItemContainer>
      </ContentContainer>
    </Container>
  );
}
