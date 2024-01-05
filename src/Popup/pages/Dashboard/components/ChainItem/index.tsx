import { useMemo, useState } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';

import {
  ButtonContainer,
  LedgerCheckConnectContainer,
  LedgerCheckConnectTextContainer,
  LedgerCheckNotSupportedTextContainer,
  LeftContainer,
  LeftImageContainer,
  LeftTextChainAmountContainer,
  LeftTextChainContainer,
  LeftTextContainer,
  LeftTextErrorContainer,
  RightButtonContainer,
  RightContainer,
  RightTextChangeRateContainer,
  RightTextContainer,
  RightTextValueContainer,
  StyledAbsoluteLoading,
  StyledButton,
  StyledIconButton,
} from './styled';

import Ledger14Icon from '~/images/icons/Ledger14.svg';
import RetryIcon from '~/images/icons/Retry.svg';

type ChainItemProps = {
  chainName: string;
  amount: string;
  decimals: number;
  displayDenom: string;
  coinGeckoId?: string;
  imageURL?: string;
  onClick?: () => void;
};

export default function ChainItem({ chainName, coinGeckoId, imageURL, amount, decimals, displayDenom, onClick }: ChainItemProps) {
  const { extensionStorage } = useExtensionStorage();
  const { data } = useCoinGeckoPriceSWR();

  const price = useMemo(() => (coinGeckoId && data?.[coinGeckoId]?.[extensionStorage.currency]) || 0, [coinGeckoId, data, extensionStorage.currency]);

  const cap = useMemo(
    () => (coinGeckoId && data?.[coinGeckoId]?.[`${extensionStorage.currency}_24h_change`]) || 0,
    [coinGeckoId, data, extensionStorage.currency],
  );

  const upperDisplayDenom = displayDenom.toUpperCase();

  const displayAmount = toDisplayDenomAmount(amount, decimals);

  const value = times(displayAmount, price);

  return (
    <StyledButton onClick={onClick}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{chainName}</Typography>
          </LeftTextChainContainer>
          <LeftTextChainAmountContainer>
            <Number typoOfIntegers="h6n" typoOfDecimals="h8n" fixed={decimals}>
              {displayAmount}
            </Number>{' '}
            <Typography variant="h6n">{upperDisplayDenom}</Typography>
          </LeftTextChainAmountContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightTextValueContainer>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={extensionStorage.currency}>
              {value}
            </Number>
          </RightTextValueContainer>

          <RightTextChangeRateContainer data-color={cap > 0 ? 'green' : cap < 0 ? 'red' : 'grey'}>
            <Typography variant="h6n">{cap > 0 ? '+' : ''}</Typography>
            <Number typoOfIntegers="h6n" typoOfDecimals="h8n" fixed={2}>
              {String(cap)}
            </Number>
            <Typography variant="h6n">%</Typography>
          </RightTextChangeRateContainer>
        </RightTextContainer>
      </RightContainer>
    </StyledButton>
  );
}

type ChainItemSkeletonProps = Pick<ChainItemProps, 'chainName' | 'imageURL' | 'onClick'>;

export function ChainItemSkeleton({ chainName, imageURL, onClick }: ChainItemSkeletonProps) {
  return (
    <StyledButton onClick={onClick}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{chainName}</Typography>
          </LeftTextChainContainer>
          <LeftTextChainAmountContainer>
            <Skeleton variant="text" width={40} />
          </LeftTextChainAmountContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightTextValueContainer>
            <Skeleton variant="text" width={40} />
          </RightTextValueContainer>

          <RightTextChangeRateContainer>
            <Skeleton variant="text" width={40} />
          </RightTextChangeRateContainer>
        </RightTextContainer>
      </RightContainer>
    </StyledButton>
  );
}

type ChainItemErrorProps = Pick<ChainItemProps, 'chainName' | 'imageURL' | 'onClick'> & { onClickRetry?: () => void };

export function ChainItemError({ chainName, imageURL, onClick, onClickRetry }: ChainItemErrorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation();
  return (
    <ButtonContainer>
      <StyledButton onClick={onClick}>
        <LeftContainer>
          <LeftImageContainer>
            <Image src={imageURL} />
          </LeftImageContainer>
          <LeftTextContainer>
            <LeftTextChainContainer>
              <Typography variant="h5">{chainName}</Typography>
            </LeftTextChainContainer>
            <LeftTextErrorContainer>
              <Typography variant="h6">{t('pages.Dashboard.components.ChainItem.index.networkError')}</Typography>
            </LeftTextErrorContainer>
          </LeftTextContainer>
        </LeftContainer>
        <RightContainer />
      </StyledButton>
      <RightButtonContainer>
        <StyledIconButton
          onClick={() => {
            setIsLoading(true);

            setTimeout(() => {
              onClickRetry?.();
              setIsLoading(false);
            }, 500);
          }}
        >
          <RetryIcon />
        </StyledIconButton>
      </RightButtonContainer>
      {isLoading && <StyledAbsoluteLoading size="2rem" />}
    </ButtonContainer>
  );
}

type ChainItemTerminatedProps = Pick<ChainItemProps, 'chainName' | 'imageURL' | 'onClick'>;

export function ChainItemTerminated({ chainName, imageURL, onClick }: ChainItemTerminatedProps) {
  const { t } = useTranslation();
  return (
    <ButtonContainer>
      <StyledButton onClick={onClick}>
        <LeftContainer>
          <LeftImageContainer>
            <Image src={imageURL} />
          </LeftImageContainer>
          <LeftTextContainer>
            <LeftTextChainContainer>
              <Typography variant="h5">{chainName}</Typography>
            </LeftTextChainContainer>
            <LeftTextErrorContainer>
              <Typography variant="h6">{t('pages.Dashboard.components.ChainItem.index.inactiveNetwork')}</Typography>
            </LeftTextErrorContainer>
          </LeftTextContainer>
        </LeftContainer>
        <RightContainer />
      </StyledButton>
    </ButtonContainer>
  );
}

type ChainItemLedgerCheckProps = Pick<ChainItemProps, 'chainName' | 'imageURL' | 'onClick'> & { isSupported?: boolean };

export function ChainItemLedgerCheck({ chainName, imageURL, isSupported, onClick }: ChainItemLedgerCheckProps) {
  return (
    <StyledButton onClick={onClick} disabled={!isSupported}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{chainName}</Typography>
          </LeftTextChainContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        {isSupported ? (
          <LedgerCheckConnectContainer>
            <Ledger14Icon />
            <LedgerCheckConnectTextContainer>
              <Typography variant="h6">Connect</Typography>
            </LedgerCheckConnectTextContainer>
          </LedgerCheckConnectContainer>
        ) : (
          <LedgerCheckNotSupportedTextContainer>
            <Typography variant="h6">Not supported</Typography>
          </LedgerCheckNotSupportedTextContainer>
        )}
      </RightContainer>
    </StyledButton>
  );
}
