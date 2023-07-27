import { useMemo } from 'react';
import type { BigNumber } from 'bignumber.js';
import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useTokensSWR } from '~/Popup/hooks/SWR/ethereum/useTokensSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { isEqualsIgnoringCase, shorterAddress } from '~/Popup/utils/string';

import {
  AddressContainer,
  AmountInfoContainer,
  ContentContainer,
  DenomContainer,
  LabelContainer,
  LeftContainer,
  RightAmountContainer,
  RightColumnContainer,
  RightContainer,
  RightValueContainer,
  ValueContainer,
} from './styled';
import Container from '../../components/Container';
import CopyButton from '../../components/CopyButton';
import type { TxMessageProps } from '../../index';

type ApproveProps = TxMessageProps;

export default function Approve({ tx, determineTxType }: ApproveProps) {
  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const tokens = useTokensSWR();
  const { currentEthereumTokens } = useCurrentEthereumTokens();

  const allTokens = useMemo(
    () => [
      ...tokens.data,
      ...currentEthereumTokens.map((token) => ({
        displayDenom: token.displayDenom,
        decimals: token.decimals,
        address: token.address,
        name: token.name,
        imageURL: token.imageURL,
        coinGeckoId: token.coinGeckoId,
      })),
    ],
    [currentEthereumTokens, tokens.data],
  );

  const { t } = useTranslation();

  const { currency } = extensionStorage;

  const { to } = tx;

  const token = allTokens.find((item) => isEqualsIgnoringCase(to, item.address));

  const price = (token?.coinGeckoId && coinGeckoPrice.data?.[token.coinGeckoId]?.[currency]) || 0;

  const tokenAddress = token?.displayDenom || shorterAddress(to, 32);
  const toAddress = (determineTxType?.txDescription?.args?.[0] as undefined | string) || '';
  const amount = (determineTxType?.txDescription?.args?.[1] as BigNumber | undefined)?.toString(10) || '';

  const displayAmount = useMemo(() => {
    try {
      return toDisplayDenomAmount(BigInt(amount).toString(10), token?.decimals || 0);
    } catch {
      return '0';
    }
  }, [amount, token?.decimals]);

  const value = times(displayAmount, price);

  return (
    <Container title="Approve (ERC20)">
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Approve.index.tokenAddress')}</Typography>
            <CopyButton text={to} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{tokenAddress}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.8rem', marginBottom: '0.4rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Approve.index.grantedAddress')}</Typography>
            <CopyButton text={toAddress} />
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(toAddress, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AmountInfoContainer>
          <LeftContainer>
            <Typography variant="h5">{t('pages.Popup.Ethereum.SignTransaction.components.TxMessage.messages.Approve.index.amount')}</Typography>
          </LeftContainer>
          <RightContainer>
            <RightColumnContainer>
              <RightAmountContainer>
                <Tooltip title={displayAmount} arrow placement="top">
                  <span>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" ellipsisMaxWidth="15">
                      {displayAmount}
                    </Number>
                  </span>
                </Tooltip>
                &nbsp;
                <DenomContainer>
                  <Typography variant="h5">{token?.displayDenom}</Typography>
                </DenomContainer>
              </RightAmountContainer>
              <RightValueContainer>
                {value !== '0' && (
                  <Tooltip title={value} arrow placement="top">
                    <span>
                      <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency} ellipsisMaxWidth="15">
                        {value}
                      </Number>
                    </span>
                  </Tooltip>
                )}
              </RightValueContainer>
            </RightColumnContainer>
          </RightContainer>
        </AmountInfoContainer>
      </ContentContainer>
    </Container>
  );
}
