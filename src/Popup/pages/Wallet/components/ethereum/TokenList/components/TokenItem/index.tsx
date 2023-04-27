import { useState } from 'react';
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
  const tokenBalance = useTokenBalanceSWR(token, { suspense: true });

  const { currency } = extensionStorage;
  const amount = tokenBalance.data || '0';
  const price = (token.coinGeckoId && coinGeckoPrice.data?.[token.coinGeckoId]?.[currency]) || 0;
  const displayAmount = toDisplayDenomAmount(amount, token.decimals);

  const value = times(displayAmount, price);

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
        <DeleteButton
          id="deleteButton"
          onClick={(e) => {
            e.stopPropagation();
            onClickDelete?.();
          }}
        >
          <Close16Icon />
        </DeleteButton>
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
  const tokenBalance = useTokenBalanceSWR(token);
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
