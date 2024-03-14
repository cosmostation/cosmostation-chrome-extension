import { useMemo, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useTokenBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { EthereumToken } from '~/types/chain';

import {
  DeleteButton,
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
  TextChangeRateContainer,
} from './styled';

import Close16Icon from '~/images/icons/Close16.svg';
import RetryIcon from '~/images/icons/Retry.svg';

type TokenItemProps = {
  token: EthereumToken;
  onClick?: () => void;
  onClickDelete?: () => void;
  disabled?: boolean;
};

export default function TokenItem({ token, disabled, onClick, onClickDelete }: TokenItemProps) {
  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const tokenBalance = useTokenBalanceSWR({ token }, { suspense: true });

  const { currency } = extensionStorage;
  const amount = useMemo(() => tokenBalance.data || '0', [tokenBalance.data]);
  const price = useMemo(
    () => (token.coinGeckoId && coinGeckoPrice.data?.[token.coinGeckoId]?.[currency]) || 0,
    [coinGeckoPrice.data, currency, token.coinGeckoId],
  );

  const cap = useMemo(
    () => (token.coinGeckoId && coinGeckoPrice.data?.[token.coinGeckoId]?.[`${extensionStorage.currency}_24h_change`]) || 0,
    [coinGeckoPrice.data, extensionStorage.currency, token.coinGeckoId],
  );

  const displayAmount = useMemo(() => toDisplayDenomAmount(amount, token.decimals), [amount, token.decimals]);

  const value = useMemo(() => times(displayAmount, price), [displayAmount, price]);

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={token.imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{token.displayDenom}</Typography>
          </LeftTextChainContainer>
          <LeftTextChainAmountContainer>
            <Number typoOfIntegers="h6n" typoOfDecimals="h8n" currency={extensionStorage.currency}>
              {String(price)}
            </Number>

            <TextChangeRateContainer data-color={cap > 0 ? 'green' : cap < 0 ? 'red' : 'grey'}>
              <Typography variant="h6n">{cap > 0 ? '+' : ''}</Typography>
              <Number typoOfIntegers="h6n" typoOfDecimals="h8n" fixed={2}>
                {String(cap)}
              </Number>
              <Typography variant="h8n">%</Typography>
            </TextChangeRateContainer>
          </LeftTextChainAmountContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightTextValueContainer>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
              {displayAmount}
            </Number>
          </RightTextValueContainer>
          <RightTextChangeRateContainer>
            <Number typoOfIntegers="h6n" typoOfDecimals="h8n" currency={currency}>
              {value}
            </Number>
          </RightTextChangeRateContainer>
        </RightTextContainer>
        {!token.default && (
          <DeleteButton
            id="deleteButton"
            onClick={(e) => {
              e.stopPropagation();
              onClickDelete?.();
            }}
          >
            <Close16Icon />
          </DeleteButton>
        )}
      </RightContainer>
    </StyledButton>
  );
}

type TokenItemSkeletonProps = Pick<TokenItemProps, 'token'>;

export function TokenItemSkeleton({ token }: TokenItemSkeletonProps) {
  return (
    <StyledButton disabled>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={token.imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{token.displayDenom}</Typography>
          </LeftTextChainContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightTextValueContainer>
            <Skeleton width={40} variant="text" />
          </RightTextValueContainer>
          <RightTextChangeRateContainer>
            <Skeleton width={40} variant="text" />
          </RightTextChangeRateContainer>
        </RightTextContainer>
      </RightContainer>
    </StyledButton>
  );
}

type TokenItemErrorProps = Pick<TokenItemProps, 'token' | 'onClickDelete'> & FallbackProps;

export function TokenItemError({ token, onClickDelete, resetErrorBoundary }: TokenItemErrorProps) {
  const tokenBalance = useTokenBalanceSWR({ token });
  const [isLoading, setIsLoading] = useState(false);

  const isInvalid = tokenBalance.error?.message.startsWith("Returned values aren't valid") || false;

  const { t } = useTranslation();

  return (
    <StyledButton disabled>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={token.imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{token.displayDenom}</Typography>
          </LeftTextChainContainer>
          <LeftTextErrorContainer>
            <Typography variant="h6">
              {isInvalid
                ? t('pages.Wallet.components.ethereum.TokenList.components.TokenItem.index.invalidError')
                : t('pages.Wallet.components.ethereum.TokenList.components.TokenItem.index.networkError')}
            </Typography>
          </LeftTextErrorContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightButtonContainer>
        <StyledIconButton
          onClick={() => {
            if (isInvalid) {
              onClickDelete?.();
            } else {
              setIsLoading(true);

              setTimeout(() => {
                resetErrorBoundary();
                setIsLoading(false);
              }, 500);
            }
          }}
        >
          {isInvalid ? <Close16Icon /> : <RetryIcon />}
        </StyledIconButton>
      </RightButtonContainer>
      {isLoading && <StyledAbsoluteLoading size="2rem" />}
    </StyledButton>
  );
}
